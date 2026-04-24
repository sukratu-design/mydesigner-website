const { connectLambda, getStore } = require('@netlify/blobs');

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

  getAuthSecret() {
    return process.env.RESEND_EVENTS_SECRET || process.env.RESEND_WEBHOOK_SECRET;
  },

  authorize(event) {
    const secret = api.getAuthSecret();
    if (!secret) {
      const error = new Error('Missing event queue secret');
      error.statusCode = 500;
      throw error;
    }
    const bearer = api.getHeader(event, 'authorization');
    const token = bearer?.startsWith('Bearer ') ? bearer.slice(7) : api.getHeader(event, 'x-resend-events-secret');
    if (!token || token !== secret) {
      const error = new Error('Unauthorized');
      error.statusCode = 401;
      throw error;
    }
  },

  normalizeLimit(raw) {
    const parsed = Number.parseInt(raw || '50', 10);
    return Number.isFinite(parsed) ? Math.max(1, Math.min(parsed, 200)) : 50;
  },

  async listEvents({ since, limit }) {
    const store = api.getStore();
    const { blobs } = await store.list();
    const keys = blobs.map((item) => item.key).sort();
    const filtered = since ? keys.filter((key) => key > since) : keys;
    const selected = filtered.slice(0, limit);
    const events = [];
    for (const key of selected) {
      const payload = await store.get(key, { type: 'json', consistency: 'strong' });
      if (payload) events.push({ key, payload });
    }
    const nextCursor = selected.length ? selected[selected.length - 1] : since || null;
    return {
      events,
      next_cursor: nextCursor,
      remaining: Math.max(0, filtered.length - selected.length),
    };
  },
};

exports.api = api;
exports.handler = async (event) => {
  api.initializeBlobs(event);

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers: RESPONSE_HEADERS, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    api.authorize(event);
    const qs = event.queryStringParameters || {};
    const result = await api.listEvents({
      since: qs.since || null,
      limit: api.normalizeLimit(qs.limit),
    });
    return {
      statusCode: 200,
      headers: RESPONSE_HEADERS,
      body: JSON.stringify({ ok: true, ...result }),
    };
  } catch (error) {
    return {
      statusCode: error.statusCode || 500,
      headers: RESPONSE_HEADERS,
      body: JSON.stringify({ error: error.message || 'Internal error' }),
    };
  }
};
