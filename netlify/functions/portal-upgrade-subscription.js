const { getFirestore, verifyAuth } = require('./_lib/firebase-admin');
const { getStripe, getPlanPriceMap, getPlanFromPriceId } = require('./_lib/stripe');

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

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }

  try {
    const decoded = await verifyAuth(event);
    const { plan } = parseBody(event);
    const planPriceMap = getPlanPriceMap();
    const newPriceId = planPriceMap[plan];

    if (!plan || !newPriceId) {
      return json(400, { error: 'Invalid plan selected or missing Stripe price ID env var' });
    }

    const db = getFirestore();
    const stripe = getStripe();
    const customerDoc = await db.collection('customers').doc(decoded.uid).get();
    const customerId = customerDoc.exists ? customerDoc.data().stripeCustomerId : null;

    if (!customerId) {
      return json(404, { error: 'No Stripe customer found for user' });
    }

    const subs = await stripe.subscriptions.list({ customer: customerId, status: 'all', limit: 10 });
    const current = subs.data.find((sub) => ['trialing', 'active', 'past_due', 'unpaid'].includes(sub.status));

    if (!current) {
      return json(404, { error: 'No active subscription found' });
    }

    const currentItem = current.items.data[0];
    if (!currentItem) {
      return json(400, { error: 'Subscription has no line item to update' });
    }

    if (currentItem.price.id === newPriceId) {
      return json(200, {
        ok: true,
        message: 'Already on selected plan',
        subscription: {
          id: current.id,
          status: current.status,
          plan: getPlanFromPriceId(currentItem.price.id),
          priceId: currentItem.price.id,
        },
      });
    }

    const updated = await stripe.subscriptions.update(current.id, {
      cancel_at_period_end: false,
      proration_behavior: 'create_prorations',
      items: [
        {
          id: currentItem.id,
          price: newPriceId,
        },
      ],
    });

    const updatedItem = updated.items.data[0];
    const updatedPriceId = updatedItem && updatedItem.price ? updatedItem.price.id : null;

    await db.collection('customers').doc(decoded.uid).set(
      {
        subscriptionId: updated.id,
        subscriptionStatus: updated.status,
        cancelAtPeriodEnd: Boolean(updated.cancel_at_period_end),
        currentPeriodEnd: updated.current_period_end || null,
        priceId: updatedPriceId,
        plan: updatedPriceId ? getPlanFromPriceId(updatedPriceId) : null,
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
        priceId: updatedPriceId,
        plan: updatedPriceId ? getPlanFromPriceId(updatedPriceId) : null,
      },
    });
  } catch (err) {
    return json(err.statusCode || 500, { error: err.message || 'Internal server error' });
  }
};
