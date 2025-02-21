'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { doc } from 'firebase/firestore';
import { useDocument } from 'react-firebase-hooks/firestore';
import { db } from '@/lib/firebase';

export default function CreateUser() {
	const router = useRouter();
	const { authedUser } = useAuth();
	const [userDoc] = useDocument(authedUser ? doc(db, 'users', authedUser.uid) : null);
	const [name, setName] = useState('');
	const [selectedAvatar, setSelectedAvatar] = useState('0');
	const [currentPage, setCurrentPage] = useState(0);
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	const avatars = Array.from({ length: 9 }, (_, i) => i + '.webp');
	const avatarsPerPage = 9;
	const totalPages = Math.ceil(avatars.length / avatarsPerPage);
	const paginatedAvatars = avatars.slice(currentPage * avatarsPerPage, (currentPage + 1) * avatarsPerPage);

	useEffect(() => {
		if (!authedUser) {
			router.push('/auth/login');
			return;
		}

		// Check if user already exists in users table

		if (userDoc?.exists()) {
			router.push('/secure-communications');
		}
	}, [authedUser, router, userDoc]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim()) {
			setError('Commander name is required');
			return;
		}

		setLoading(true);
		try {
			await api.createUser(name, parseInt(selectedAvatar));
			router.push('/secure-communications');
		} catch (error: any) {
			console.error('Error creating user:', error);
			setError(error.message || 'Failed to create user');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-background cyber-grid flex items-center justify-center p-4">
			<Card className="w-full max-w-2xl bg-black/50 backdrop-blur-sm border-primary/50 neon-border">
				<CardHeader>
					<CardTitle className="text-2xl text-center neon-text">CREATE YOUR COMMANDER PROFILE</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-6">
						<div className="space-y-2">
							<label className="text-sm text-primary/90">COMMANDER NAME</label>
							<Input
								value={name}
								onChange={(e) => setName(e.target.value)}
								className="bg-black/30 border-primary/30"
								placeholder="Enter your commander name"
							/>
						</div>

						<div className="space-y-4">
							<label className="text-sm text-primary/90">SELECT AVATAR</label>
							<div className="grid grid-cols-3 gap-2 max-w-[300px] mx-auto">
								{paginatedAvatars.map((avatar, index) => (
									<button
										key={index}
										type="button"
										onClick={() => setSelectedAvatar(avatar.split('.')[0])}
										className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-colors ${
											selectedAvatar === avatar.split('.')[0]
												? 'border-primary'
												: 'border-muted hover:border-primary/50'
										}`}
									>
										<Image
											src={`/images/avatars/${avatar}.webp`}
											alt={`Avatar ${index}`}
											fill
											className="object-cover"
											sizes="(max-width: 768px) 60px, 80px"
											quality={75}
										/>
									</button>
								))}
							</div>

							{totalPages > 1 && (
								<div className="flex justify-between items-center">
									<Button
										type="button"
										variant="outline"
										onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
										disabled={currentPage === 0}
									>
										<ChevronLeft className="h-4 w-4 mr-2" />
										Previous
									</Button>
									<span className="text-sm text-muted-foreground">
										Page {currentPage + 1} of {totalPages}
									</span>
									<Button
										type="button"
										variant="outline"
										onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
										disabled={currentPage === totalPages - 1}
									>
										Next
										<ChevronRight className="h-4 w-4 ml-2" />
									</Button>
								</div>
							)}
						</div>

						{error && <div className="text-red-500 text-sm bg-red-500/10 p-2 rounded">{error}</div>}

						<Button type="submit" className="w-full" disabled={loading || !name.trim()}>
							{loading ? 'Creating Profile...' : 'Create Commander Profile'}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
