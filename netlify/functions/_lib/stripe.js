const Stripe = require('stripe');

let stripeClient;

function getStripe() {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('Missing required environment variable: STRIPE_SECRET_KEY');
    }

    stripeClient = new Stripe(key, {
      apiVersion: '2024-06-20',
    });
  }

  return stripeClient;
}

function getPlanPriceMap() {
  return {
    starter: process.env.STRIPE_PRICE_STARTER || '',
    growth: process.env.STRIPE_PRICE_GROWTH || '',
    scale: process.env.STRIPE_PRICE_SCALE || '',
  };
}

function getPlanFromPriceId(priceId) {
  const planPriceMap = getPlanPriceMap();
  return Object.keys(planPriceMap).find((plan) => planPriceMap[plan] === priceId) || null;
}

module.exports = {
  getStripe,
  getPlanPriceMap,
  getPlanFromPriceId,
};
