const { getFirestore, verifyAuth } = require('./_lib/firebase-admin');
const { getStripe } = require('./_lib/stripe');

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  };
}

async function getCustomerId(db, uid) {
  const doc = await db.collection('customers').doc(uid).get();
  return doc.exists ? doc.data().stripeCustomerId : null;
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }

  try {
    const decoded = await verifyAuth(event);
    const db = getFirestore();
    const stripe = getStripe();

    const customerId = await getCustomerId(db, decoded.uid);
    if (!customerId) {
      return json(404, { error: 'No Stripe customer found for user' });
    }

    const subs = await stripe.subscriptions.list({ customer: customerId, status: 'all', limit: 10 });
    const current = subs.data.find((sub) => ['trialing', 'active', 'past_due', 'unpaid'].includes(sub.status));

    if (!current) {
      return json(404, { error: 'No active subscription found' });
    }

    const updated = await stripe.subscriptions.update(current.id, {
      cancel_at_period_end: true,
    });

    await db.collection('customers').doc(decoded.uid).set(
      {
        subscriptionId: updated.id,
        cancelAtPeriodEnd: Boolean(updated.cancel_at_period_end),
        subscriptionStatus: updated.status,
        currentPeriodEnd: updated.current_period_end || null,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return json(200, {
      ok: true,
      subscription: {
        id: updated.id,
        status: updated.status,
        cancelAtPeriodEnd: Boolean(updated.cancel_at_period_end),
        currentPeriodEnd: updated.current_period_end || null,
      },
    });
  } catch (err) {
    return json(err.statusCode || 500, { error: err.message || 'Internal server error' });
  }
};
