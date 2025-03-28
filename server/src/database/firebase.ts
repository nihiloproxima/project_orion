import admin from 'firebase-admin';

// Load credentials from the service account file
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '');

if (!admin.apps.length) {
	admin.initializeApp({
		credential: admin.credential.cert(serviceAccount),
	});
}

export const db = admin.firestore();
