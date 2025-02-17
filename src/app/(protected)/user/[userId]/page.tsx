'use client';

import _ from 'lodash';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { ChevronLeft, ChevronRight, Earth, Edit, ImageIcon, Trophy, User as UserIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../../components/ui/dialog';
import { cardVariants, containerVariants, itemVariants } from '@/lib/animations';
import { useState } from 'react';

import { Button } from '../../../../components/ui/button';
import Image from 'next/image';
import { Input } from '../../../../components/ui/input';
import { User } from '../../../../models/user';
import { api } from '../../../../lib/api';
import { getPublicImageUrl } from '@/lib/images';
import { motion } from 'framer-motion';
import { useGame } from '../../../../contexts/GameContext';
import { useParams } from 'next/navigation';
import { Progress } from '../../../../components/ui/progress';
import { getRequiredPointsForLevel } from '@/utils/user_calculations';
import { useCollectionDataOnce, useDocumentData } from 'react-firebase-hooks/firestore';
import { collection, doc, query, where } from 'firebase/firestore';
import { db, withIdConverter } from '@/lib/firebase';

export default function UserProfilePage() {
	const params = useParams();
	const userId = params.userId as string;
	const { state } = useGame();
	const [user] = useDocumentData<User>(doc(db, `users/${userId}`).withConverter(withIdConverter));
	const [isEditing, setIsEditing] = useState(false);
	const [newName, setNewName] = useState('');
	const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
	const [currentPage, setCurrentPage] = useState(0);
	const [userPlanets] = useCollectionDataOnce(
		state.gameConfig
			? query(
					collection(db, `seasons/${state.gameConfig.season.current}/planets`).withConverter(withIdConverter),
					where('owner_id', '==', userId)
			  )
			: null
	);

	const avatars = Array.from({ length: 9 }, (_, i) => i + '.webp');
	const avatarsPerPage = 9;
	const totalPages = Math.ceil(avatars.length / avatarsPerPage);
	const paginatedAvatars = avatars.slice(currentPage * avatarsPerPage, (currentPage + 1) * avatarsPerPage);

	const isCurrentUser = state.currentUser?.id === userId;

	const handleUpdateName = async () => {
		if (!user || !newName.trim()) return;

		try {
			await api.updateUser(newName, user.avatar || 1);
			setIsEditing(false);
		} catch (error) {
			console.error('Error updating name:', error);
		}
	};

	const handleAvatarSelect = async (avatarName: string) => {
		if (!user) return;

		try {
			await api.updateUser(user.name, _.toInteger(avatarName.split('.')[0]));
			setIsAvatarDialogOpen(false);
		} catch (error) {
			console.error('Error updating avatar:', error);
		}
	};

	if (!user) {
		return <div>Commander not found.</div>;
	}

	return (
		<motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="show">
			{/* Header Section */}
			<motion.div className="flex justify-between items-center" variants={itemVariants}>
				<div>
					<h1 className="text-3xl font-bold neon-text mb-2 flex items-center gap-2">
						<UserIcon className="h-8 w-8" />
						COMMANDER PROFILE
					</h1>
					<p className="text-muted-foreground">Viewing commander {user.name}&apos;s service record</p>
				</div>
			</motion.div>

			{/* Profile Card */}
			<motion.div variants={cardVariants} whileHover="hover" whileTap="tap">
				<Card className="border-2 shadow-2xl shadow-primary/20 overflow-hidden">
					<div className="relative h-48 bg-gradient-to-b from-primary/20 to-background">
						<div className="absolute -bottom-16 left-8 flex items-end gap-6">
							<div className="relative">
								<Image
									src={getPublicImageUrl('avatars', user.avatar + '.webp')}
									alt={user.name}
									width={192}
									height={192}
									aria-description={`Avatar ${user.avatar}`}
									className="border-4 border-background shadow-xl object-cover"
								/>
								{isCurrentUser && (
									<Button
										variant="default"
										size="icon"
										className="absolute bottom-0 right-0 rounded-full"
										onClick={() => setIsAvatarDialogOpen(true)}
									>
										<ImageIcon className="h-4 w-4" />
									</Button>
								)}
							</div>
							<div className="mb-4">
								{isEditing ? (
									<div className="flex items-center gap-2">
										<Input
											value={newName}
											onChange={(e) => setNewName(e.target.value)}
											className="bg-background"
										/>
										<Button onClick={handleUpdateName}>Save</Button>
										<Button variant="outline" onClick={() => setIsEditing(false)}>
											Cancel
										</Button>
									</div>
								) : (
									<h2 className="text-2xl font-bold flex items-center gap-2">
										{user.name}
										{isCurrentUser && (
											<Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
												<Edit className="h-4 w-4" />
											</Button>
										)}
									</h2>
								)}
							</div>
						</div>
					</div>
					<CardContent className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
						<Card className="bg-card/50 backdrop-blur-sm neon-border hover:shadow-[0_0_20px_rgba(32,224,160,0.3)] transition-all duration-300 md:col-span-3">
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-yellow-400">
									<Trophy className="h-5 w-5" />
									Reputation Level {user.level}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									<div className="flex justify-between text-sm text-muted-foreground">
										<span>
											{user.xp.toLocaleString()} /{' '}
											{getRequiredPointsForLevel(user.level + 1).toLocaleString()} XP
										</span>
										<span>Next Level: {user.level + 1}</span>
									</div>
									<Progress
										value={
											((user.xp - getRequiredPointsForLevel(user.level)) /
												(getRequiredPointsForLevel(user.level + 1) -
													getRequiredPointsForLevel(user.level))) *
											100
										}
										className="h-2"
									/>
								</div>
							</CardContent>
						</Card>

						<Card className="bg-card/50 backdrop-blur-sm neon-border hover:shadow-[0_0_20px_rgba(32,224,160,0.3)] transition-all duration-300">
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-primary">
									<Trophy className="h-5 w-5" />
									Score
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-3xl font-bold">{user.score}</div>
							</CardContent>
						</Card>
					</CardContent>
				</Card>
			</motion.div>

			{/* Avatar Selection Dialog */}
			<Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
				<DialogContent className="sm:max-w-[600px]">
					<DialogHeader>
						<DialogTitle>Select Commander Avatar</DialogTitle>
					</DialogHeader>
					<div className="grid grid-cols-3 gap-4 p-4">
						{paginatedAvatars.map((avatarName, index) => (
							<button
								key={index}
								className="relative overflow-hidden rounded-lg border-2 border-muted hover:border-primary transition-colors"
								onClick={() => handleAvatarSelect(avatarName)}
							>
								<Image
									src={getPublicImageUrl('avatars', avatarName)}
									alt={`Avatar ${index}`}
									width={192}
									height={192}
									aria-description={`Avatar ${index}`}
									className="w-full h-full object-cover"
								/>
							</button>
						))}
					</div>
					<div className="flex justify-between items-center px-4 pb-4">
						<Button
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
							variant="outline"
							onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
							disabled={currentPage === totalPages - 1}
						>
							Next
							<ChevronRight className="h-4 w-4 ml-2" />
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			{/* Planets Section */}
			<motion.div variants={cardVariants} whileHover="hover" whileTap="tap">
				<Card className="border-2 shadow-2xl shadow-primary/20">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Earth className="h-5 w-5" />
							Controlled Systems ({userPlanets?.length || 0})
						</CardTitle>
					</CardHeader>
					<CardContent>
						<motion.div
							className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
							variants={containerVariants}
						>
							{userPlanets?.map((planet) => (
								<motion.div
									key={planet.id}
									variants={itemVariants}
									whileHover={{
										scale: 1.05,
										transition: { duration: 0.2 },
									}}
								>
									<Card className="bg-card/50 backdrop-blur-sm hover:shadow-[0_0_20px_rgba(32,224,160,0.3)] transition-all duration-300">
										<CardContent className="p-4">
											<div className="font-bold text-primary">{planet.name}</div>
											<div className="text-sm text-muted-foreground">
												[{planet.coordinate_x}, {planet.coordinate_y}]
											</div>
											<div className="text-sm">Size: {planet.size_km.toLocaleString()} km</div>
											<div className="text-sm capitalize">
												Biome: {planet.biome.replace('_', ' ')}
											</div>
										</CardContent>
									</Card>
								</motion.div>
							))}
						</motion.div>
					</CardContent>
				</Card>
			</motion.div>
		</motion.div>
	);
}
