const { getFirestore, verifyAuth } = require('./_lib/firebase-admin');
const { getStripe, getPlanFromPriceId, getPlanPriceMap } = require('./_lib/stripe');

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  };
}

async function ensureCustomer(stripe, db, uid, email) {
  const customerDocRef = db.collection('customers').doc(uid);
  const customerDoc = await customerDocRef.get();
  let stripeCustomerId = customerDoc.exists ? customerDoc.data().stripeCustomerId : null;

  if (!stripeCustomerId && email) {
    const existing = await stripe.customers.list({ email, limit: 1 });
    if (existing.data[0]) {
      stripeCustomerId = existing.data[0].id;
    }
  }

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email,
      metadata: { uid },
    });
    stripeCustomerId = customer.id;
  } else {
    await stripe.customers.update(stripeCustomerId, {
      email,
      metadata: { uid },
    });
  }

  await customerDocRef.set(
    {
      uid,
      email,
      stripeCustomerId,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  return stripeCustomerId;
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return json(405, { error: 'Method not allowed' });
  }

  try {
    const decoded = await verifyAuth(event);
    const uid = decoded.uid;
    const email = decoded.email || null;

    const db = getFirestore();
    const stripe = getStripe();
    const stripeCustomerId = await ensureCustomer(stripe, db, uid, email);

    const subs = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: 'all',
      limit: 20,
    });

    const current = subs.data.find((sub) => ['trialing', 'active', 'past_due', 'unpaid'].includes(sub.status)) || null;

    const item = current && current.items && current.items.data ? current.items.data[0] : null;
    const priceId = item && item.price ? item.price.id : null;
    const currentPlan = priceId ? getPlanFromPriceId(priceId) : null;

    return json(200, {
      customerId: stripeCustomerId,
      subscription: current
        ? {
            id: current.id,
            status: current.status,
            cancelAtPeriodEnd: Boolean(current.cancel_at_period_end),
            currentPeriodEnd: current.current_period_end || null,
            priceId,
            plan: currentPlan,
          }
        : null,
      plans: getPlanPriceMap(),
    });
  } catch (err) {
    return json(err.statusCode || 500, { error: err.message || 'Internal server error' });
  }
};
