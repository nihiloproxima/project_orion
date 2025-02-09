'use client';

import { auth } from '@/lib/firebase';
import { signOut, User } from 'firebase/auth';
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingScreen } from '../components/LoadingScreen';

interface AuthContextType {
	isAuthenticated: boolean;
	authedUser: User | null;
	logout: () => Promise<void>;
	loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(auth.currentUser);
	const [loading, setLoading] = useState(true);
	const router = useRouter();

	useEffect(() => {
		// Listen for auth state changes
		const unsubscribe = auth.onAuthStateChanged((user) => {
			setUser(user);
			setLoading(false);
		});
		return () => unsubscribe(); // Cleanup on unmount
	}, []);

	const logout = async () => {
		await signOut(auth);

		router.push('/auth/login');
	};

	if (loading) {
		return <LoadingScreen />;
	}

	return (
		<AuthContext.Provider
			value={{
				isAuthenticated: !!user,
				authedUser: user,
				logout,
				loading,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
}
