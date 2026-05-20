const { connectLambda, getStore } = require('@netlify/blobs');
const { Webhook } = require('svix');

const ALLOWED_EVENTS = new Set([
  'email.sent',
  'email.delivered',
  'email.failed',
  'email.bounced',
  'email.suppressed',
  'email.received',
]);
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 60;
const rateLimitStore = new Map();
const RESPONSE_HEADERS = {
  'Content-Type': 'application/json',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Cache-Control': 'no-store',
};

const api = {
  initializeBlobs(event) {
    connectLambda(event);
  },

  getStore() {
    return getStore('resend-events');
  },

  getHeader(event, name) {
    const headers = event.headers || {};
    const target = name.toLowerCase();
    for (const [key, value] of Object.entries(headers)) {
      if (key.toLowerCase() === target) return value;
    }
    return undefined;
  },

  getClientKey(event) {
    return api.getHeader(event, 'x-forwarded-for') || api.getHeader(event, 'client-ip') || 'unknown';
  },

  enforceRateLimit(event) {
    const now = Date.now();
    const key = api.getClientKey(event);
    const entry = rateLimitStore.get(key);
    if (!entry || now - entry.startedAt >= RATE_LIMIT_WINDOW_MS) {
      rateLimitStore.set(key, { startedAt: now, count: 1 });
      return;
    }
    entry.count += 1;
    if (entry.count > RATE_LIMIT_MAX) {
      const error = new Error('Rate limit exceeded');
      error.statusCode = 429;
      throw error;
    }
  },

  async verifySignature(event) {
    const secret = process.env.RESEND_WEBHOOK_SECRET;
    if (!secret) {
      const error = new Error('Missing RESEND_WEBHOOK_SECRET');
      error.statusCode = 500;
      throw error;
    }

    const contentType = api.getHeader(event, 'content-type') || '';
    if (!contentType.toLowerCase().includes('application/json')) {
      const error = new Error('Unsupported content type');
      error.statusCode = 415;
      throw error;
    }

    const payload = event.body || '';
    const headers = {
      'svix-id': api.getHeader(event, 'svix-id'),
      'svix-timestamp': api.getHeader(event, 'svix-timestamp'),
      'svix-signature': api.getHeader(event, 'svix-signature'),
    };

    if (!headers['svix-id'] || !headers['svix-timestamp'] || !headers['svix-signature']) {
      const error = new Error('Missing Svix headers');
      error.statusCode = 400;
      throw error;
    }

    return new Webhook(secret).verify(payload, headers);
  },

  makeEventKey(eventType, svixId, createdAt) {
    const ts = new Date(createdAt || Date.now()).toISOString();
    return `${ts}_${svixId}_${eventType}`;
  },

  async persistEvent(event, payload, eventType) {
    const store = api.getStore();
    const svixId = api.getHeader(event, 'svix-id') || 'unknown';
    const key = api.makeEventKey(eventType, svixId, payload.created_at || new Date().toISOString());
    await store.setJSON(key, payload, {
      metadata: {
        svix_id: svixId,
        event_type: eventType,
        created_at: payload.created_at || new Date().toISOString(),
      },
    });
    return key;
  },

  async forwardIfConfigured(event) {
    const forwardUrl = process.env.RESEND_FORWARD_WEBHOOK_URL;
    if (!forwardUrl) {
      return { forwarded: false };
    }

    const headers = {
      'content-type': api.getHeader(event, 'content-type') || 'application/json',
    };

    for (const name of ['svix-id', 'svix-timestamp', 'svix-signature']) {
      const value = api.getHeader(event, name);
      if (value) headers[name] = value;
    }

    const resp = await fetch(forwardUrl, {
      method: 'POST',
      headers,
      body: event.body || '',
    });

    return {
      forwarded: true,
      status: resp.status,
      ok: resp.ok,
      body: await resp.text(),
    };
  },
};

exports.api = api;
exports.handler = async (event) => {
  api.initializeBlobs(event);

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: RESPONSE_HEADERS, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    api.enforceRateLimit(event);
  } catch (error) {
    return { statusCode: error.statusCode || 429, headers: RESPONSE_HEADERS, body: JSON.stringify({ error: error.message }) };
  }

  let payload;
  try {
    payload = await api.verifySignature(event);
  } catch (error) {
    return {
      statusCode: error.statusCode || 400,
      headers: RESPONSE_HEADERS,
      body: JSON.stringify({ error: error.message || 'Invalid webhook' }),
    };
  }

  const eventType = String(payload.type || '').toLowerCase();
  if (!eventType || !ALLOWED_EVENTS.has(eventType)) {
    return {
      statusCode: 400,
      headers: RESPONSE_HEADERS,
      body: JSON.stringify({ error: 'Unsupported Resend event type' }),
    };
  }

  const queueKey = await api.persistEvent(event, payload, eventType);
  const forwardResult = await api.forwardIfConfigured(event);

  return {
    statusCode: 200,
    headers: RESPONSE_HEADERS,
    body: JSON.stringify({
      ok: true,
      event_type: eventType,
      endpoint: '/.netlify/functions/resend-webhook',
      queue_key: queueKey,
      forward: forwardResult,
    }),
  };
};
