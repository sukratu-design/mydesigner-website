const admin = require('firebase-admin');

function assertEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getFirebaseApp() {
  if (admin.apps.length) {
    return admin.app();
  }

  const projectId = assertEnv('FIREBASE_PROJECT_ID');
  const clientEmail = assertEnv('FIREBASE_CLIENT_EMAIL');
  const privateKey = assertEnv('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n');

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

function getFirestore() {
  getFirebaseApp();
  return admin.firestore();
}

async function verifyAuth(event) {
  getFirebaseApp();
  const authHeader = event.headers.authorization || event.headers.Authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const err = new Error('Missing bearer token');
    err.statusCode = 401;
    throw err;
  }

  const idToken = authHeader.slice('Bearer '.length).trim();
  if (!idToken) {
    const err = new Error('Invalid bearer token');
    err.statusCode = 401;
    throw err;
  }

  try {
    return await admin.auth().verifyIdToken(idToken);
  } catch (_e) {
    const err = new Error('Unauthorized');
    err.statusCode = 401;
    throw err;
  }
}

module.exports = {
  admin,
  getFirebaseApp,
  getFirestore,
  verifyAuth,
};
