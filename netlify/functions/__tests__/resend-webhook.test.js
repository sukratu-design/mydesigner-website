const assert = require('assert');
const mod = require('../resend-webhook');
const { handler, api } = mod;

async function run() {
  const originalVerify = api.verifySignature;
  const originalForward = api.forwardIfConfigured;
  const originalRate = api.enforceRateLimit;
  const originalFetch = global.fetch;

  let res = await handler({ httpMethod: 'GET' });
  assert.equal(res.statusCode, 405);

  api.enforceRateLimit = () => {};
  api.verifySignature = async () => {
    const err = new Error('Missing Svix headers');
    err.statusCode = 400;
    throw err;
  };
  res = await handler({ httpMethod: 'POST', body: '{}', headers: { 'content-type': 'application/json' } });
  assert.equal(res.statusCode, 400);

  api.verifySignature = async () => ({ type: 'Email.Sent' });
  api.forwardIfConfigured = async () => ({ forwarded: false });
  res = await handler({ httpMethod: 'POST', body: JSON.stringify({ type: 'Email.Sent' }), headers: { 'content-type': 'application/json' } });
  assert.equal(res.statusCode, 200);
  let parsed = JSON.parse(res.body);
  assert.equal(parsed.ok, true);
  assert.equal(parsed.event_type, 'email.sent');
  assert.equal(parsed.endpoint, '/.netlify/functions/resend-webhook');
  assert.equal(parsed.forward.forwarded, false);
  assert.equal(res.headers['X-Content-Type-Options'], 'nosniff');

  api.verifySignature = async () => ({ type: 'email.opened' });
  res = await handler({ httpMethod: 'POST', body: JSON.stringify({ type: 'email.opened' }), headers: { 'content-type': 'application/json' } });
  assert.equal(res.statusCode, 400);

  api.verifySignature = async () => ({ type: 'email.received' });
  process.env.RESEND_FORWARD_WEBHOOK_URL = 'https://example.com/hook';
  global.fetch = async (url, options) => {
    assert.equal(url, 'https://example.com/hook');
    assert.equal(options.method, 'POST');
    assert.equal(options.headers['svix-id'], 'msg_123');
    return { status: 202, ok: true, text: async () => 'forwarded' };
  };
  api.forwardIfConfigured = originalForward;
  res = await handler({
    httpMethod: 'POST',
    body: JSON.stringify({ type: 'email.received' }),
    headers: { 'svix-id': 'msg_123', 'svix-timestamp': '1', 'svix-signature': 'sig', 'content-type': 'application/json' },
  });
  parsed = JSON.parse(res.body);
  assert.equal(parsed.forward.forwarded, true);
  assert.equal(parsed.forward.status, 202);
  assert.equal(parsed.forward.body, 'forwarded');

  api.enforceRateLimit = () => { const err = new Error('Rate limit exceeded'); err.statusCode = 429; throw err; };
  res = await handler({ httpMethod: 'POST', body: JSON.stringify({ type: 'email.sent' }), headers: { 'content-type': 'application/json' } });
  assert.equal(res.statusCode, 429);

  api.verifySignature = originalVerify;
  api.forwardIfConfigured = originalForward;
  api.enforceRateLimit = originalRate;
  global.fetch = originalFetch;
  delete process.env.RESEND_FORWARD_WEBHOOK_URL;
  console.log('resend-webhook tests passed');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
