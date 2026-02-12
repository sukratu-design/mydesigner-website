const { getFirestore, admin } = require('./_lib/firebase-admin');
const { getStripe, getPlanFromPriceId } = require('./_lib/stripe');

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  };
}

async function findUidByCustomer(db, customerId) {
  if (!customerId) return null;
  const snap = await db.collection('customers').where('stripeCustomerId', '==', customerId).limit(1).get();
  if (snap.empty) return null;
  return snap.docs[0].id;
}

async function resolveUid(db, candidateUid, customerId) {
  if (candidateUid) return candidateUid;
  return findUidByCustomer(db, customerId);
}

async function upsertCustomer(db, uid, payload) {
  if (!uid) return;
  await db.collection('customers').doc(uid).set(
    {
      ...payload,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}

function epochToIso(epochSeconds) {
  if (!epochSeconds) return null;
  return new Date(epochSeconds * 1000).toISOString();
}

async function handleCheckoutCompleted(db, stripe, session) {
  const uid = await resolveUid(db, session.client_reference_id || session.metadata?.uid, session.customer);
  if (!uid) return;

  const customerId = session.customer;
  const customer = customerId ? await stripe.customers.retrieve(customerId) : null;

  await upsertCustomer(db, uid, {
    uid,
    email: customer && !customer.deleted ? customer.email || null : null,
    stripeCustomerId: customerId || null,
    checkoutSessionId: session.id,
    lastCheckoutCompletedAt: new Date().toISOString(),
  });
}

async function handleSubscriptionEvent(db, subscription) {
  const customerId = subscription.customer;
  const subscriptionItem = subscription.items?.data?.[0] || null;
  const priceId = subscriptionItem?.price?.id || null;
  const uid = await resolveUid(db, subscription.metadata?.uid, customerId);

  if (!uid) return;

  await upsertCustomer(db, uid, {
    uid,
    stripeCustomerId: customerId,
    subscriptionId: subscription.id,
    subscriptionStatus: subscription.status,
    cancelAtPeriodEnd: Boolean(subscription.cancel_at_period_end),
    currentPeriodEnd: subscription.current_period_end || null,
    currentPeriodEndIso: epochToIso(subscription.current_period_end),
    priceId,
    plan: priceId ? getPlanFromPriceId(priceId) : null,
  });
}

async function handleInvoiceEvent(db, invoice) {
  const customerId = invoice.customer;
  const uid = await resolveUid(db, null, customerId);
  if (!uid) return;

  await upsertCustomer(db, uid, {
    uid,
    stripeCustomerId: customerId,
    lastInvoiceId: invoice.id,
    lastInvoiceStatus: invoice.status || null,
    lastInvoicePaid: Boolean(invoice.paid),
  });
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }

  try {
    const stripe = getStripe();
    const db = getFirestore();

    const signature = event.headers['stripe-signature'] || event.headers['Stripe-Signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!signature || !endpointSecret) {
      return json(400, { error: 'Missing Stripe signature or webhook secret' });
    }

    const rawBody = event.isBase64Encoded
      ? Buffer.from(event.body || '', 'base64').toString('utf8')
      : event.body || '';

    const stripeEvent = stripe.webhooks.constructEvent(rawBody, signature, endpointSecret);

    switch (stripeEvent.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(db, stripe, stripeEvent.data.object);
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionEvent(db, stripeEvent.data.object);
        break;
      case 'invoice.paid':
      case 'invoice.payment_failed':
        await handleInvoiceEvent(db, stripeEvent.data.object);
        break;
      default:
        break;
    }

    await db.collection('stripeWebhookEvents').doc(stripeEvent.id).set(
      {
        id: stripeEvent.id,
        type: stripeEvent.type,
        created: stripeEvent.created,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return json(200, { received: true });
  } catch (err) {
    return json(400, { error: err.message || 'Webhook error' });
  }
};
