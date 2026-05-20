const assert = require('assert');
const mod = require('../resend-events');
const { handler, api } = mod;

async function run() {
  const originalGetStore = api.getStore;
  const originalInit = api.initializeBlobs;
  const originalSecret = process.env.RESEND_EVENTS_SECRET;

  api.initializeBlobs = () => {};
  process.env.RESEND_EVENTS_SECRET = 'queue-secret';
  let res = await handler({ httpMethod: 'GET', headers: {} });
  assert.equal(res.statusCode, 401);

  api.getStore = () => ({
    list: async () => ({ blobs: [
      { key: '2026-04-24T05:00:00.000Z_msg1_email.sent' },
      { key: '2026-04-24T05:01:00.000Z_msg2_email.received' },
    ] }),
    get: async (key) => ({ type: key.includes('received') ? 'email.received' : 'email.sent' }),
  });

  res = await handler({
    httpMethod: 'GET',
    headers: { authorization: 'Bearer queue-secret' },
    queryStringParameters: { since: '2026-04-24T05:00:00.000Z_msg1_email.sent', limit: '10' },
  });
  assert.equal(res.statusCode, 200);
  const parsed = JSON.parse(res.body);
  assert.equal(parsed.ok, true);
  assert.equal(parsed.events.length, 1);
  assert.equal(parsed.events[0].key, '2026-04-24T05:01:00.000Z_msg2_email.received');

  api.getStore = originalGetStore;
  api.initializeBlobs = originalInit;
  if (originalSecret === undefined) delete process.env.RESEND_EVENTS_SECRET;
  else process.env.RESEND_EVENTS_SECRET = originalSecret;
  console.log('resend-events tests passed');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
