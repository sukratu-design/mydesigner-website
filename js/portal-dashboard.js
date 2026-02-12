import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js';
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js';

const emailEl = document.querySelector('#user-email');
const statusDotEl = document.querySelector('#subscription-status-dot');
const statusTextEl = document.querySelector('#subscription-status-text');
const planEl = document.querySelector('#subscription-plan');
const periodEl = document.querySelector('#subscription-period');
const periodNoteEl = document.querySelector('#subscription-period-note');
const messageEl = document.querySelector('#portal-message');

const refreshBtn = document.querySelector('#refresh-subscription-btn');
const logoutBtn = document.querySelector('#logout-btn');
const planCards = Array.from(document.querySelectorAll('[data-plan-card]'));
const confirmStopModal = document.querySelector('#confirm-stop-modal');
const confirmStopMessage = document.querySelector('#confirm-stop-message');
const confirmStopApproveBtn = document.querySelector('#confirm-stop-approve');
const confirmStopCancelBtn = document.querySelector('#confirm-stop-cancel');

const planOrder = { starter: 1, growth: 2, scale: 3 };
const planNames = { starter: 'Starter', growth: 'Growth', scale: 'Scale' };

let currentUser = null;
let currentSubscription = null;
let auth = null;

function toDateString(epochSeconds) {
  if (!epochSeconds) return 'N/A';
  return new Date(epochSeconds * 1000).toLocaleString();
}

function toPlanDisplay(plan) {
  if (!plan || typeof plan !== 'string') return 'N/A';
  return plan.charAt(0).toUpperCase() + plan.slice(1);
}

function setStatus(isActive) {
  statusTextEl.textContent = isActive ? 'Active' : 'Inactive';
  statusDotEl.className = `h-2.5 w-2.5 rounded-full ${isActive ? 'bg-success' : 'bg-error'}`;
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
    const actionBtn = card.querySelector(`[data-plan-action="${plan}"]`);
    const currentBadge = card.querySelector('[data-current-badge]');
    const isCurrent = Boolean(subscription && currentPlan === plan);

    if (currentBadge) {
      currentBadge.classList.toggle('hidden', !isCurrent);
    }

    if (!subscription) {
      actionBtn.disabled = false;
      actionBtn.textContent = 'Subscribe';
      return;
    }

    if (isCurrent) {
      actionBtn.disabled = Boolean(subscription.cancelAtPeriodEnd);
      actionBtn.textContent = subscription.cancelAtPeriodEnd ? 'Stopping at Period End' : 'Stop at Period End';
      return;
    }

    actionBtn.disabled = false;
    actionBtn.textContent = getPlanDirectionLabel(currentPlan, plan);
  });
}

function setSubscriptionUI(subscription) {
  currentSubscription = subscription;

  if (!subscription) {
    setStatus(false);
    planEl.textContent = 'N/A';
    periodEl.textContent = 'N/A';
    periodNoteEl.textContent = 'No active subscription. Subscribe to start your plan.';
    setPlanCards(null);
    return;
  }

  setStatus(true);
  planEl.textContent = toPlanDisplay(subscription.plan);
  periodEl.textContent = `${toDateString(subscription.currentPeriodStart)} to ${toDateString(subscription.currentPeriodEnd)}`;
  periodNoteEl.textContent = subscription.cancelAtPeriodEnd
    ? 'Your plan is scheduled to cancel.'
    : 'Your plan will auto-renew.';
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

async function getPortalConfig() {
  const response = await fetch('/.netlify/functions/portal-public-config');
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.firebase) {
    throw new Error(data.error || 'Failed to load portal config');
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

function confirmStopAction() {
  const until = currentSubscription ? toDateString(currentSubscription.currentPeriodEnd) : 'the end of this billing period';
  const text = `Your plan will remain active until ${until}. Do you want to continue?`;

  if (!confirmStopModal || typeof confirmStopModal.showModal !== 'function') {
    return Promise.resolve(window.confirm(text));
  }

  return new Promise((resolve) => {
    confirmStopMessage.textContent = text;

    const closeAndResolve = (value) => {
      confirmStopApproveBtn.removeEventListener('click', onApprove);
      confirmStopCancelBtn.removeEventListener('click', onCancel);
      confirmStopModal.removeEventListener('close', onClose);
      resolve(value);
    };

    const onApprove = () => {
      confirmStopModal.close();
      closeAndResolve(true);
    };

    const onCancel = () => {
      confirmStopModal.close();
      closeAndResolve(false);
    };

    const onClose = () => closeAndResolve(false);

    confirmStopApproveBtn.addEventListener('click', onApprove);
    confirmStopCancelBtn.addEventListener('click', onCancel);
    confirmStopModal.addEventListener('close', onClose, { once: true });
    confirmStopModal.showModal();
  });
}

async function runButtonAction(button, fn) {
  const originalHtml = button.innerHTML;

  try {
    button.disabled = true;
    button.innerHTML = '<span class="loading loading-spinner loading-xs"></span>';
    hideMessage();
    await fn();
  } catch (err) {
    showMessage(err.message || 'Action failed.', 'error');
  } finally {
    await refreshSubscription().catch(() => {});
    button.innerHTML = originalHtml;
    button.disabled = false;
  }
}

async function initAuthAndData() {
  try {
    const config = await getPortalConfig();
    const app = initializeApp(config.firebase);
    auth = getAuth(app);
  } catch (err) {
    showMessage(err.message || 'Portal is temporarily unavailable.', 'error');
    refreshBtn.disabled = true;
    return;
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
}

logoutBtn.addEventListener('click', async () => {
  if (!auth) return;
  await signOut(auth);
  window.location.href = '/portal/login.html';
});

refreshBtn.addEventListener('click', () => runButtonAction(refreshBtn, refreshSubscription));

planCards.forEach((card) => {
  const plan = card.dataset.planCard;
  const actionBtn = card.querySelector(`[data-plan-action="${plan}"]`);

  actionBtn.addEventListener('click', () =>
    runButtonAction(actionBtn, async () => {
      if (!currentSubscription) {
        await startSubscription(plan);
        return;
      }

      if (currentSubscription.plan === plan) {
        const confirmed = await confirmStopAction();
        if (!confirmed) {
          return;
        }
        await stopSubscriptionAtPeriodEnd();
        return;
      }

      await changeSubscriptionPlan(plan);
    })
  );
});

initAuthAndData();
