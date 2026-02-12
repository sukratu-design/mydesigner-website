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

const refreshBtn = document.querySelector('#refresh-subscription-btn');
const logoutBtn = document.querySelector('#logout-btn');
const planCards = Array.from(document.querySelectorAll('[data-plan-card]'));

const planOrder = { starter: 1, growth: 2, scale: 3 };
const planNames = { starter: 'Starter', growth: 'Growth', scale: 'Scale' };

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

function getPlanDirectionLabel(currentPlan, targetPlan) {
  if (!currentPlan || !planOrder[currentPlan] || !planOrder[targetPlan]) {
    return `Switch to ${planNames[targetPlan]}`;
  }

  if (planOrder[targetPlan] > planOrder[currentPlan]) {
    return `Upgrade to ${planNames[targetPlan]}`;
  }

  return `Downgrade to ${planNames[targetPlan]}`;
}

function setPlanCards(subscription) {
  const currentPlan = subscription ? subscription.plan : null;

  planCards.forEach((card) => {
    const plan = card.dataset.planCard;
    const switchBtn = card.querySelector(`[data-switch-plan="${plan}"]`);
    const stopBtn = card.querySelector(`[data-stop-plan="${plan}"]`);
    const currentBadge = card.querySelector('[data-current-badge]');
    const isCurrent = Boolean(subscription && currentPlan === plan);

    if (currentBadge) {
      currentBadge.classList.toggle('hidden', !isCurrent);
    }

    if (!subscription) {
      switchBtn.disabled = false;
      switchBtn.textContent = `Start ${planNames[plan]}`;
      stopBtn.disabled = true;
      return;
    }

    if (isCurrent) {
      switchBtn.disabled = true;
      switchBtn.textContent = 'Current Plan';
      stopBtn.disabled = Boolean(subscription.cancelAtPeriodEnd);
      return;
    }

    switchBtn.disabled = false;
    switchBtn.textContent = getPlanDirectionLabel(currentPlan, plan);
    stopBtn.disabled = true;
  });
}

function setSubscriptionUI(subscription) {
  currentSubscription = subscription;

  if (!subscription) {
    statusEl.textContent = 'No active subscription';
    planEl.textContent = 'N/A';
    renewalEl.textContent = 'N/A';
    cancelFlagEl.textContent = 'N/A';
    setPlanCards(null);
    return;
  }

  statusEl.textContent = subscription.status || 'unknown';
  planEl.textContent = subscription.plan || 'custom';
  renewalEl.textContent = toDateString(subscription.currentPeriodEnd);
  cancelFlagEl.textContent = subscription.cancelAtPeriodEnd ? 'Yes (ends current period)' : 'No';
  setPlanCards(subscription);
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

async function startSubscription(plan) {
  const data = await authedFetch('/.netlify/functions/portal-start-subscription', {
    method: 'POST',
    body: JSON.stringify({ plan }),
  });

  if (!data.checkoutUrl) {
    throw new Error('Stripe checkout URL not returned');
  }

  window.location.href = data.checkoutUrl;
}

async function changeSubscriptionPlan(plan) {
  await authedFetch('/.netlify/functions/portal-upgrade-subscription', {
    method: 'POST',
    body: JSON.stringify({ plan }),
  });

  showMessage(`Switched to ${planNames[plan]} with immediate proration.`, 'success');
  await refreshSubscription();
}

async function stopSubscriptionAtPeriodEnd() {
  await authedFetch('/.netlify/functions/portal-stop-subscription', {
    method: 'POST',
    body: JSON.stringify({}),
  });

  showMessage('Subscription will cancel at the end of the current billing period.', 'success');
  await refreshSubscription();
}

async function runButtonAction(button, fn) {
  const originalLabel = button.textContent;

  try {
    button.disabled = true;
    button.textContent = 'Please wait...';
    hideMessage();
    await fn();
  } catch (err) {
    showMessage(err.message || 'Action failed.', 'error');
    button.textContent = originalLabel;
  } finally {
    await refreshSubscription().catch(() => {});
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

refreshBtn.addEventListener('click', () => runButtonAction(refreshBtn, refreshSubscription));

planCards.forEach((card) => {
  const plan = card.dataset.planCard;
  const switchBtn = card.querySelector(`[data-switch-plan="${plan}"]`);
  const stopBtn = card.querySelector(`[data-stop-plan="${plan}"]`);

  switchBtn.addEventListener('click', () =>
    runButtonAction(switchBtn, async () => {
      if (!currentSubscription) {
        await startSubscription(plan);
        return;
      }

      if (currentSubscription.plan === plan) {
        showMessage(`${planNames[plan]} is already your current plan.`, 'info');
        return;
      }

      await changeSubscriptionPlan(plan);
    })
  );

  stopBtn.addEventListener('click', () =>
    runButtonAction(stopBtn, async () => {
      if (!currentSubscription) {
        showMessage('No active subscription to stop.', 'error');
        return;
      }

      if (currentSubscription.plan !== plan) {
        showMessage('You can stop only from your active plan card.', 'error');
        return;
      }

      await stopSubscriptionAtPeriodEnd();
    })
  );
});
