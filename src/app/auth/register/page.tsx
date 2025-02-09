'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function Register() {
	const router = useRouter();
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
			const { error } = await supabase.auth.signInWithOAuth({
				provider: 'discord',
				options: {
					redirectTo: `${window.location.origin}/auth/callback`,
					queryParams: {
						access_type: 'offline',
						prompt: 'consent',
					},
				},
			});

			if (error) throw error;
			// Auth callback will handle the rest of the flow
		} catch (error: any) {
			setError(error.message || 'Discord authentication failed');
			console.error('Discord auth failed:', error);
		}
	};

	return (
		<div className="w-full min-h-screen bg-background cyber-grid flex items-center justify-center">
			<div className="absolute inset-0 bg-primary/5 blur-[100px] rounded-full"></div>
			<Card className="w-[400px] bg-black/50 backdrop-blur-sm border-primary/50 neon-border">
				<CardHeader className="space-y-4">
					<CardTitle className="font-mono text-2xl text-center neon-text tracking-wider">
						NEW OPERATOR REGISTRATION
					</CardTitle>

					<div className="text-xs font-mono text-primary/70">{'>'} INITIALIZING REGISTRATION SEQUENCE...</div>
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
					<div className="grid grid-cols-2 gap-3 mb-6">
						<Button
							type="button"
							onClick={handleDiscordSignIn}
							className="font-mono bg-[#5865F2]/80 hover:bg-[#5865F2]/90 border border-[#5865F2]/60 neon-border text-white h-9"
						>
							<svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
								<path
									fill="currentColor"
									d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"
								/>
							</svg>
							Discord
						</Button>
						<Button
							type="button"
							onClick={() => {}}
							className="font-mono bg-white/90 hover:bg-white border border-zinc-300 text-zinc-900 h-9"
						>
							<svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
								<path
									fill="#4285F4"
									d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
								/>
								<path
									fill="#34A853"
									d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
								/>
								<path
									fill="#FBBC05"
									d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
								/>
								<path
									fill="#EA4335"
									d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
								/>
							</svg>
							Google
						</Button>
					</div>

					<div className="relative mb-6">
						<div className="absolute inset-0 flex items-center">
							<span className="w-full border-t border-primary/30"></span>
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-background px-2 text-primary/70 font-mono">Or continue with email</span>
						</div>
					</div>

					<form onSubmit={handleSubmit} className="space-y-6">
						<div className="space-y-2">
							<Label htmlFor="email" className="font-mono text-sm text-primary/90">
								[OPERATOR EMAIL]
							</Label>
							<Input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								disabled={isLoading}
								className="font-mono bg-black/30 border-primary/30 focus:border-primary/60 neon-border disabled:opacity-50"
								placeholder="enter.operator@id"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="password" className="font-mono text-sm text-primary/90">
								[ACCESS CODE]
							</Label>
							<Input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								disabled={isLoading}
								className="font-mono bg-black/30 border-primary/30 focus:border-primary/60 neon-border disabled:opacity-50"
								placeholder="****************"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="confirmPassword" className="font-mono text-sm text-primary/90">
								[VERIFY ACCESS CODE]
							</Label>
							<Input
								id="confirmPassword"
								type="password"
								value={confirmPassword}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									setConfirmPassword(e.target.value)
								}
								required
								disabled={isLoading}
								className="font-mono bg-black/30 border-primary/30 focus:border-primary/60 neon-border disabled:opacity-50"
								placeholder="****************"
							/>
						</div>

						<Button
							type="submit"
							disabled={isLoading}
							className="w-full font-mono bg-primary/80 hover:bg-primary/90 border border-primary/60 neon-border disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isLoading ? 'INITIALIZING...' : 'INITIALIZE ACCESS'}
						</Button>
					</form>
				</CardContent>
				<CardFooter className="flex justify-center">
					<div className="text-xs font-mono text-primary/70">
						[EXISTING OPERATOR?]{' '}
						<Link href="/auth/login" className="text-primary hover:text-primary/80 neon-text">
							ACCESS SYSTEM
						</Link>
					</div>
				</CardFooter>
			</Card>
		</div>
	);
}
