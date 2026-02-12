const { getFirestore, verifyAuth } = require('./_lib/firebase-admin');
const { getStripe, getPlanPriceMap } = require('./_lib/stripe');

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  };
}

function parseBody(event) {
  try {
    return event.body ? JSON.parse(event.body) : {};
  } catch (_e) {
    return {};
  }
}

function getSiteOrigin(event) {
  const proto = event.headers['x-forwarded-proto'] || 'https';
  const host = event.headers.host;
  return `${proto}://${host}`;
}

async function ensureCustomer(stripe, db, uid, email) {
  const docRef = db.collection('customers').doc(uid);
  const doc = await docRef.get();
  let customerId = doc.exists ? doc.data().stripeCustomerId : null;

  if (!customerId && email) {
    const existing = await stripe.customers.list({ email, limit: 1 });
    if (existing.data[0]) {
      customerId = existing.data[0].id;
    }
  }

  if (!customerId) {
    const customer = await stripe.customers.create({ email, metadata: { uid } });
    customerId = customer.id;
  } else {
    await stripe.customers.update(customerId, { email, metadata: { uid } });
  }

  await docRef.set(
    {
      uid,
      email,
      stripeCustomerId: customerId,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  return customerId;
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }

  try {
    const decoded = await verifyAuth(event);
    const { plan } = parseBody(event);
    const planPriceMap = getPlanPriceMap();
    const priceId = planPriceMap[plan];

    if (!plan || !priceId) {
      return json(400, { error: 'Invalid plan selected or missing Stripe price ID env var' });
    }

    const stripe = getStripe();
    const db = getFirestore();
    const uid = decoded.uid;
    const email = decoded.email || null;

    const customerId = await ensureCustomer(stripe, db, uid, email);
    const origin = getSiteOrigin(event);

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      client_reference_id: uid,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${origin}/portal/?checkout=success`,
      cancel_url: `${origin}/portal/?checkout=cancelled`,
      metadata: {
        uid,
        plan,
      },
      subscription_data: {
        metadata: {
          uid,
          plan,
        },
      },
    });

    return json(200, { checkoutUrl: session.url });
  } catch (err) {
    return json(err.statusCode || 500, { error: err.message || 'Internal server error' });
  }
};
