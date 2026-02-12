import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js';

const form = document.querySelector('#auth-form');
const titleEl = document.querySelector('#auth-title');
const subtitleEl = document.querySelector('#auth-subtitle');
const submitBtn = document.querySelector('#auth-submit');
const toggleBtn = document.querySelector('#auth-toggle');
const errorEl = document.querySelector('#auth-error');

let mode = 'login';
let auth;

function setMode(nextMode) {
  mode = nextMode;
  const isLogin = mode === 'login';
  titleEl.textContent = isLogin ? 'Log in to your portal' : 'Create your portal account';
  subtitleEl.textContent = isLogin
    ? 'Use your subscription email to manage billing.'
    : 'Create an account with the same email used in Stripe checkout.';
  submitBtn.textContent = isLogin ? 'Log In' : 'Create Account';
  toggleBtn.textContent = isLogin ? 'New here? Create account' : 'Already have an account? Log in';
  errorEl.classList.add('hidden');
}

function setLoading(isLoading) {
  submitBtn.disabled = isLoading;
  submitBtn.textContent = isLoading ? 'Please wait...' : mode === 'login' ? 'Log In' : 'Create Account';
}

function showError(message) {
  errorEl.textContent = message;
  errorEl.classList.remove('hidden');
}

async function getPortalConfig() {
  const response = await fetch('/.netlify/functions/portal-public-config');
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.firebase) {
    throw new Error(data.error || 'Failed to load portal config');
  }
  return data;
}

async function init() {
  try {
    const config = await getPortalConfig();
    const app = initializeApp(config.firebase);
    auth = getAuth(app);
  } catch (err) {
    showError(err.message || 'Portal is temporarily unavailable.');
    submitBtn.disabled = true;
    toggleBtn.disabled = true;
    return;
  }

  onAuthStateChanged(auth, (user) => {
    if (user) {
      window.location.href = '/portal/';
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.classList.add('hidden');

    const formData = new FormData(form);
    const email = String(formData.get('email') || '').trim();
    const password = String(formData.get('password') || '');

    if (!email || !password) {
      showError('Email and password are required.');
      return;
    }

    try {
      setLoading(true);
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      window.location.href = '/portal/';
    } catch (err) {
      showError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  });

  toggleBtn.addEventListener('click', () => {
    setMode(mode === 'login' ? 'signup' : 'login');
  });
}

setMode('login');
init();
