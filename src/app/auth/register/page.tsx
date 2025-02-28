'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';

export default function Register() {
	const router = useRouter();
	const { t } = useTranslation('auth');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		signOut(auth);
	}, []);

	const validatePasswords = () => {
		if (password !== confirmPassword) {
			setError('ACCESS CODES DO NOT MATCH');
			return false;
		}
		if (password.length < 6) {
			setError('ACCESS CODE MUST BE AT LEAST 6 CHARACTERS');
			return false;
		}
		setError('');

		return true;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		setIsLoading(true);
		e.preventDefault();
		if (!validatePasswords()) {
			setIsLoading(false);
			return;
		}

		try {
			const userCredential = await createUserWithEmailAndPassword(auth, email, password);

			// Check user status after successful login
			const user = await getDoc(doc(db, 'users', userCredential.user?.uid));
			console.log(user);
			console.log(user.exists());

			if (!user.exists()) {
				router.push('/create-user');
			} else if (!user.data()?.home_planet_id) {
				router.push('/secure-communications');
			} else {
				router.push('/dashboard');
			}
			console.log('User created successfully');
		} catch (error: any) {
			console.error('Login failed:', error);
			setError(error.message || 'Login failed');
		} finally {
			setIsLoading(false);
		}
	};

	const handleDiscordSignIn = async () => {
		try {
			// Auth callback will handle the rest of the flow
		} catch (error: any) {
			setError(error.message || 'Discord authentication failed');
			console.error('Discord auth failed:', error);
		}
	};

	return (
		<div className="flex items-center justify-center min-h-screen bg-background cyber-grid">
			<Card className="w-full max-w-md border-primary/50 bg-black/80 backdrop-blur-sm">
				<CardHeader className="space-y-1 text-center">
					<CardTitle className="text-2xl font-bold tracking-tight neon-text">
						{t('register.title')}
					</CardTitle>
					<CardDescription className="text-muted-foreground">
						{t('register.subtitle')}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="email">{t('register.email')}</Label>
							<Input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								className="bg-black/50 border-primary/30"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">{t('register.password')}</Label>
							<Input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								className="bg-black/50 border-primary/30"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="confirmPassword">{t('register.confirm_password')}</Label>
							<Input
								id="confirmPassword"
								type="password"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								required
								className="bg-black/50 border-primary/30"
							/>
						</div>
						<Button
							type="submit"
							className="w-full bg-primary hover:bg-primary/80 text-primary-foreground"
							disabled={isLoading}
						>
							{isLoading ? (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							) : (
								t('register.submit')
							)}
						</Button>
					</form>
				</CardContent>
				<CardFooter className="flex justify-center">
					<div className="text-xs font-mono text-primary/70">
						{t('register.existing_user')}{' '}
						<Link href="/auth/login" className="text-primary hover:text-primary/80 neon-text">
							{t('register.login')}
						</Link>
					</div>
				</CardFooter>
			</Card>
		</div>
	);
}
