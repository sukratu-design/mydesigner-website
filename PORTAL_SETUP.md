# MyDesigner Portal Setup (Staging)

This repository now includes a Stripe + Firebase customer portal on:

- `/portal/login.html`
- `/portal/`

Netlify Functions used:

- `/.netlify/functions/portal-subscription`
- `/.netlify/functions/portal-start-subscription`
- `/.netlify/functions/portal-stop-subscription`
- `/.netlify/functions/portal-upgrade-subscription`
- `/.netlify/functions/stripe-webhook`

## Required Netlify Environment Variables (staging-portal branch)

Set these env vars in Netlify with scope limited to branch `staging-portal`:

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_APP_ID`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_STARTER`
- `STRIPE_PRICE_GROWTH`
- `STRIPE_PRICE_SCALE`

## Stripe Webhook Endpoint (staging)

Use this endpoint URL in Stripe test mode:

- `https://staging-portal--mydesigner-gg.netlify.app/.netlify/functions/stripe-webhook`

Subscribe to these events:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`

## Firebase Requirements

1. Enable Authentication provider: `Email/Password`.
2. Enable Firestore in production mode.
3. Use a service account key with Firestore and Auth admin permissions.

## Behavior Implemented

- **Start**: creates Stripe Checkout session for selected plan.
- **Stop**: sets `cancel_at_period_end = true`.
- **Upgrade**: immediate proration (`proration_behavior = create_prorations`).
- API routes verify Firebase ID token from `Authorization: Bearer <token>`.
