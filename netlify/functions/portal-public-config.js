function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'content-type': 'application/json',
      'cache-control': 'no-store',
    },
    body: JSON.stringify(body),
  };
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return json(405, { error: 'Method not allowed' });
  }

  const firebase = {
    apiKey: process.env.FIREBASE_API_KEY || '',
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    appId: process.env.FIREBASE_APP_ID || '',
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
  };

  if (!firebase.apiKey || !firebase.authDomain || !firebase.projectId || !firebase.appId) {
    return json(500, { error: 'Missing Firebase public config env vars' });
  }

  return json(200, {
    firebase,
    plans: [
      { id: 'starter', name: 'Starter' },
      { id: 'growth', name: 'Growth' },
      { id: 'scale', name: 'Scale' },
    ],
  });
};
