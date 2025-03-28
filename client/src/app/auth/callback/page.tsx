'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { LoadingScreen } from '@/components/LoadingScreen';
import { doc, getDoc } from 'firebase/firestore';

export default function AuthCallback() {
	const router = useRouter();

	useEffect(() => {
		const handleCallback = async () => {
			try {
				const currentUser = auth.currentUser;
				if (!currentUser) throw new Error('No user found');

				// Check if user exists in users collection
				const userDoc = await getDoc(doc(db, 'users', currentUser.uid));

				if (!userDoc.exists()) {
					// New user - redirect to create profile
					router.push('/create-user');
				} else {
					const userData = userDoc.data();
					if (!userData.home_planet_id) {
						// User exists but needs homeworld
						router.push('/secure-communications');
					} else {
						// Complete user - go to dashboard
						router.push('/dashboard');
					}
				}
			} catch (error) {
				console.error('Auth callback error:', error);
				router.push('/auth/login');
			}
		};

		handleCallback();
	}, [router]);

	return <LoadingScreen message="INITIALIZING..." />;
}
