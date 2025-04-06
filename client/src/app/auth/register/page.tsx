'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useTranslation } from '@/hooks/useTranslation';
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
			setError(t('register.errors.passwords_mismatch'));
			return false;
		}
		if (password.length < 6) {
			setError(t('register.errors.password_length'));
			return false;
		}
		setError('');

		return true;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		setIsLoading(true);
		e.preventDefault();
		if (!validatePasswords()) {
			setError(t('register.errors.passwords_mismatch'));
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

	const handleGoogleSignIn = async () => {
		setIsLoading(true);
		try {
			const provider = new GoogleAuthProvider();
			const userCredential = await signInWithPopup(auth, provider);

			// Check user status after successful login
			const user = await getDoc(doc(db, 'users', userCredential.user?.uid));

			if (!user.exists()) {
				router.push('/create-user');
			} else if (!user.data()?.home_planet_id) {
				router.push('/secure-communications');
			} else {
				router.push('/dashboard');
			}
		} catch (error: any) {
			console.error('Google auth failed:', error);
			setError(error.message || 'Google authentication failed');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="w-full min-h-screen bg-background cyber-grid flex items-center justify-center">
			<div className="absolute inset-0 bg-primary/5 blur-[100px] rounded-full"></div>
			<Card className="w-[400px] bg-black/50 backdrop-blur-sm border-primary/50 neon-border">
				<CardHeader className="space-y-4">
					<CardTitle className="font-mono text-2xl text-center neon-text tracking-wider">
						{t('register.title')}
					</CardTitle>

					<div className="text-xs font-mono text-primary/70">
						{'>'} {t('register.subtitle')}
					</div>
					{error && (
						<div className="text-xs font-mono text-red-500 bg-red-500/10 p-2 border border-red-500/30 rounded animate-pulse shadow-lg shadow-red-500/20 backdrop-blur-sm">
							<span className="inline-block animate-ping mr-2">!</span>
							<span className="inline-block animate-pulse">{'>'}</span>
							<span className="font-bold tracking-wider ml-1">ERROR:</span>
							<span className="opacity-90 ml-1">{error}</span>
						</div>
					)}
				</CardHeader>
				<CardContent>
					<Button
						onClick={handleGoogleSignIn}
						disabled={isLoading}
						className="w-full mb-6 font-mono bg-white/90 hover:bg-white text-black border border-white/60 neon-border disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
					>
						{isLoading ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<>
								<svg className="h-5 w-5" viewBox="0 0 24 24">
									<path
										d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
										fill="#4285F4"
									/>
									<path
										d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
										fill="#34A853"
									/>
									<path
										d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
										fill="#FBBC05"
									/>
									<path
										d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
										fill="#EA4335"
									/>
								</svg>
								{t('register.google')}
							</>
						)}
					</Button>

					<div className="relative mb-6">
						<div className="absolute inset-0 flex items-center">
							<span className="w-full border-t border-primary/30"></span>
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-background px-2 text-primary/70 font-mono">
								{t('login.continue_with')}
							</span>
						</div>
					</div>

					<form onSubmit={handleSubmit} className="space-y-6">
						<div className="space-y-2">
							<Label htmlFor="email" className="font-mono text-sm text-primary/90">
								[{t('register.email')}]
							</Label>
							<Input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								disabled={isLoading}
								className="font-mono bg-black/30 border-primary/30 focus:border-primary/60 neon-border disabled:opacity-50"
								placeholder={t('login.email_placeholder')}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="password" className="font-mono text-sm text-primary/90">
								[{t('register.password')}]
							</Label>
							<Input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								disabled={isLoading}
								className="font-mono bg-black/30 border-primary/30 focus:border-primary/60 neon-border disabled:opacity-50"
								placeholder={t('login.password_placeholder')}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="confirmPassword" className="font-mono text-sm text-primary/90">
								[{t('register.confirm_password')}]
							</Label>
							<Input
								id="confirmPassword"
								type="password"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								required
								disabled={isLoading}
								className="font-mono bg-black/30 border-primary/30 focus:border-primary/60 neon-border disabled:opacity-50"
								placeholder={t('login.password_placeholder')}
							/>
						</div>

						<Button
							type="submit"
							disabled={isLoading}
							className="w-full font-mono bg-primary/80 hover:bg-primary/90 border border-primary/60 neon-border disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : t('register.submit')}
						</Button>
					</form>
				</CardContent>
				<CardFooter className="flex justify-center">
					<div className="text-xs font-mono text-primary/70">
						[{t('register.existing_user')}]{' '}
						<Link href="/auth/login" className="text-primary hover:text-primary/80 neon-text">
							{t('register.login')}
						</Link>
					</div>
				</CardFooter>
			</Card>
		</div>
	);
}
