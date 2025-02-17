import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your Firebase config from Firebase Console
// const firebaseConfig = {
// 	apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
// 	authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
// 	projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
// 	storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
// 	messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
// 	appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
// };

const firebaseConfig = {
	apiKey: 'AIzaSyDFpW552jNRgfTujizaMI2beyFzKYE8rFs',

	authDomain: 'project-orion-prod.firebaseapp.com',

	projectId: 'project-orion-prod',

	storageBucket: 'project-orion-prod.firebasestorage.app',

	messagingSenderId: '528381855325',

	appId: '1:528381855325:web:37ccf638ad4dabca4e6fb4',

	measurementId: 'G-3K1CDZ6YLS',
};

// Initialize Firebase app if not already initialized
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Firestore converter to include document ID in the data
export const withIdConverter = {
	fromFirestore: (snapshot: any, options: any) => {
		const data = snapshot.data(options);
		return {
			...data,
			id: snapshot.id,
		};
	},
	toFirestore: (data: any) => {
		return data;
	},
};
