import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js';
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js';

const config = window.MYDESIGNER_PORTAL_CONFIG;
if (!config || !config.firebase) {
  throw new Error('Missing portal config');
}

const app = initializeApp(config.firebase);
const auth = getAuth(app);

const emailEl = document.querySelector('#user-email');
const statusEl = document.querySelector('#subscription-status');
const planEl = document.querySelector('#subscription-plan');
const renewalEl = document.querySelector('#subscription-renewal');
const cancelFlagEl = document.querySelector('#subscription-cancel-flag');
const messageEl = document.querySelector('#portal-message');

const startBtn = document.querySelector('#start-subscription-btn');
const stopBtn = document.querySelector('#stop-subscription-btn');
const upgradeBtn = document.querySelector('#upgrade-subscription-btn');
const refreshBtn = document.querySelector('#refresh-subscription-btn');
const logoutBtn = document.querySelector('#logout-btn');
const planSelect = document.querySelector('#plan-select');

let currentUser = null;
let currentSubscription = null;

function toDateString(epochSeconds) {
  if (!epochSeconds) return 'N/A';
  return new Date(epochSeconds * 1000).toLocaleString();
}

function showMessage(text, kind = 'info') {
  messageEl.textContent = text;
  messageEl.className = `alert ${kind === 'error' ? 'alert-error' : kind === 'success' ? 'alert-success' : 'alert-info'}`;
  messageEl.classList.remove('hidden');
}

function hideMessage() {
  messageEl.classList.add('hidden');
}

function setSubscriptionUI(subscription) {
  currentSubscription = subscription;

  if (!subscription) {
    statusEl.textContent = 'No active subscription';
    planEl.textContent = 'N/A';
    renewalEl.textContent = 'N/A';
    cancelFlagEl.textContent = 'N/A';
    startBtn.disabled = false;
    stopBtn.disabled = true;
    upgradeBtn.disabled = true;
    return;
  }

  statusEl.textContent = subscription.status || 'unknown';
  planEl.textContent = subscription.plan || 'custom';
  renewalEl.textContent = toDateString(subscription.currentPeriodEnd);
  cancelFlagEl.textContent = subscription.cancelAtPeriodEnd ? 'Yes (ends current period)' : 'No';

  startBtn.disabled = true;
  stopBtn.disabled = subscription.cancelAtPeriodEnd;
  upgradeBtn.disabled = false;
}

async function authedFetch(path, options = {}) {
  const token = await currentUser.getIdToken();
  const response = await fetch(path, {
    ...options,
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Request failed (${response.status})`);
  }

  return data;
}

async function refreshSubscription() {
  hideMessage();
  const data = await authedFetch('/.netlify/functions/portal-subscription');
  setSubscriptionUI(data.subscription || null);
}

async function startSubscription() {
  const plan = planSelect.value;
  if (!plan) {
    showMessage('Select a plan before starting.', 'error');
    return;
  }

  const data = await authedFetch('/.netlify/functions/portal-start-subscription', {
    method: 'POST',
    body: JSON.stringify({ plan }),
  });

  if (!data.checkoutUrl) {
    throw new Error('Stripe checkout URL not returned');
  }

  window.location.href = data.checkoutUrl;
}

async function stopSubscription() {
  await authedFetch('/.netlify/functions/portal-stop-subscription', {
    method: 'POST',
    body: JSON.stringify({}),
  });
  showMessage('Subscription will cancel at the end of the current billing period.', 'success');
  await refreshSubscription();
}

async function upgradeSubscription() {
  const plan = planSelect.value;
  if (!plan) {
    showMessage('Select a plan to upgrade.', 'error');
    return;
  }

  await authedFetch('/.netlify/functions/portal-upgrade-subscription', {
    method: 'POST',
    body: JSON.stringify({ plan }),
  });
  showMessage('Subscription updated with immediate proration.', 'success');
  await refreshSubscription();
}

async function runAction(fn, button) {
  try {
    button.disabled = true;
    hideMessage();
    await fn();
  } catch (err) {
    showMessage(err.message || 'Action failed.', 'error');
  } finally {
    await refreshSubscription().catch(() => {});
    button.disabled = false;
  }
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = '/portal/login.html';
    return;
  }

  currentUser = user;
  emailEl.textContent = user.email || 'Signed in';

  const query = new URLSearchParams(window.location.search);
  if (query.get('checkout') === 'success') {
    showMessage('Checkout completed. Syncing subscription status...', 'success');
  }

  try {
    await refreshSubscription();
  } catch (err) {
    showMessage(err.message || 'Failed to load subscription.', 'error');
  }
});

logoutBtn.addEventListener('click', async () => {
  await signOut(auth);
  window.location.href = '/portal/login.html';
});

startBtn.addEventListener('click', () => runAction(startSubscription, startBtn));
stopBtn.addEventListener('click', () => runAction(stopSubscription, stopBtn));
upgradeBtn.addEventListener('click', () => runAction(upgradeSubscription, upgradeBtn));
refreshBtn.addEventListener('click', () => runAction(refreshSubscription, refreshBtn));
