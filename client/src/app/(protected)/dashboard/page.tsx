'use client';

import { MessageSquare, Users, MapPin, Ruler, TreePine } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { containerVariants, itemVariants } from '@/lib/animations';
import { useEffect, useRef, useState, useMemo } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { api } from '../../../lib/api';
import { motion } from 'framer-motion';
import { useGame } from '../../../contexts/GameContext';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '../../../components/ui/collapsible';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { DialogFooter } from '../../../components/ui/dialog';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, query, limit, orderBy, where } from 'firebase/firestore';
import { db, withIdConverter } from '@/lib/firebase';
import { ChatMessage, ResourceType } from '@/models';
import { useTranslation } from '@/hooks/useTranslation';
import { formatDistanceToNow } from 'date-fns';
import { enUS, fr } from 'date-fns/locale';

export default function Dashboard() {
	const router = useRouter();
	const { state } = useGame();
	const { t, locale } = useTranslation('dashboard');

	const [messages] = useCollectionData<ChatMessage>(
		query(collection(db, 'chat').withConverter(withIdConverter), orderBy('created_at', 'desc'), limit(100))
	);
	const [newMessage, setNewMessage] = useState('');
	const scrollAreaRef = useRef<HTMLDivElement>(null);
	const [showOnlineCommanders, setShowOnlineCommanders] = useState(false);
	const [planetInfo, setPlanetInfo] = useState<{
		name: string;
		size: string;
		coordinates: string;
		biome: string;
	}>({
		name: '',
		size: '',
		coordinates: '',
		biome: '',
	});
	const [biomeInfo, setBiomeInfo] = useState<{ bonuses: string; maluses: string } | null>(null);
	const [showAllBiomes, setShowAllBiomes] = useState(false);
	const [showRenameDialog, setShowRenameDialog] = useState(false);

	useEffect(() => {
		// Scroll to bottom when new messages arrive
		if (scrollAreaRef.current) {
			const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
			if (scrollContainer) {
				scrollContainer.scrollTop = scrollContainer.scrollHeight;
			}
		}
	}, [messages]);

	useEffect(() => {
		if (!state.loading) {
			if (state.currentUser) {
				if (state.currentUser.onboarding_step === 'check-mails') {
					router.push('/secure-communications');
				}
			} else {
				router.push('/create-user');
			}
		}
	}, [state.loading, state.currentUser, state.selectedPlanet, state.userPlanets.length, router]);

	// Example planet data fetching, replace with actual data retrieval logic
	useEffect(() => {
		const fetchPlanetInfo = async () => {
			setPlanetInfo({
				name: state.selectedPlanet?.name || 'Unknown',
				size: state.selectedPlanet?.radius.toString() || 'Unknown',
				coordinates: `${state.selectedPlanet?.position.x}, ${state.selectedPlanet?.position.y}, ${state.selectedPlanet?.position.chunk}`,
				biome: state.selectedPlanet?.biome || 'Unknown',
			});

			if (state.selectedPlanet?.biome && state.gameConfig) {
				const biomeModifiers = state.gameConfig.biomes[state.selectedPlanet.biome];
				setBiomeInfo(formatBiomeInfo(biomeModifiers));
			}
		};

		fetchPlanetInfo();
	}, [state.selectedPlanet, state.gameConfig]);

	// Helper function to get the appropriate date-fns locale
	const getDateLocale = () => {
		switch (locale) {
			case 'fr':
				return fr;
			default:
				return enUS;
		}
	};

	const handleSendMessage = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newMessage.trim()) return;

		try {
			await api.sendMessage('global', newMessage);
			setNewMessage('');
		} catch (error) {
			console.error('Failed to send message:', error);
		}
	};

	if (state.userPlanets.length === 0) {
		router.push('/secure-communications');
		return null; // Return null while redirecting
	}

	return (
		<motion.div className="space-y-8" variants={containerVariants} initial="hidden" animate="show">
			<motion.div className="flex justify-between items-center" variants={itemVariants}>
				<div>
					<h1 className="text-3xl font-bold neon-text mb-2">{t('title')}</h1>
					<p className="text-muted-foreground">{t('welcome', { name: state.currentUser?.name || '' })}</p>
				</div>
			</motion.div>

			{/* Stats Grid */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{[
					// {
					// 	title: t('stats.unread_messages.title'),
					// 	icon: <MessageSquare className="h-4 w-4 text-primary" />,
					// 	value: t('stats.unread_messages.value', { count: unreadMails }),
					// 	subtext: t('stats.unread_messages.subtext'),
					// 	onClick: () => router.push('/secure-communications'),
					// },
					{
						title: t('stats.active_commanders.title'),
						icon: <Users className="h-4 w-4 text-primary" />,
						value: state.activePlayers.length,
						subtext: t('stats.active_commanders.subtext'),
						onClick: () => setShowOnlineCommanders(true),
					},
				].map((stat) => (
					<motion.div
						key={stat.title}
						variants={itemVariants}
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
					>
						<Card
							className={`cursor-pointerbg-card/50 backdrop-blur-sm neon-border hover:shadow-[0_0_20px_rgba(32,224,160,0.3)] transition-all duration-300`}
							onClick={stat.onClick}
						>
							<CardHeader className="flex flex-row items-center justify-between pb-2">
								<CardTitle className="text-sm font-medium neon-text">{stat.title}</CardTitle>
								{stat.icon}
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{stat.value}</div>
								<p className="text-xs text-muted-foreground">{stat.subtext}</p>
							</CardContent>
						</Card>
					</motion.div>
				))}
			</div>

			{/* Planet Information Card */}
			<motion.div variants={itemVariants}>
				<Card className="bg-card/50 backdrop-blur-sm neon-border">
					<CardHeader className="pb-2">
						<CardTitle className="neon-text flex items-center justify-between">
							<div className="flex items-center gap-2">
								<MapPin className="h-4 w-4" />
								{t('planet.overview')}
							</div>
							<button
								onClick={() => setShowRenameDialog(true)}
								className="text-sm bg-primary/20 hover:bg-primary/30 px-3 py-1 rounded-md transition-colors"
							>
								{t('planet.rename')}
							</button>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="space-y-4">
								<div>
									<div className="text-sm text-muted-foreground mb-1">{t('planet.designation')}</div>
									<div className="text-xl font-bold">{planetInfo.name}</div>
								</div>
								<div>
									<div className="text-sm text-muted-foreground mb-1">{t('planet.coordinates')}</div>
									<div className="font-mono">{planetInfo.coordinates}</div>
								</div>
							</div>
							<div className="space-y-4">
								<div>
									<div className="text-sm text-muted-foreground mb-1">{t('planet.size')}</div>
									<div className="flex items-center gap-2">
										<Ruler className="h-4 w-4 text-primary" />
										{planetInfo.size}
									</div>
								</div>
								<div>
									<div className="text-sm text-muted-foreground mb-1">{t('planet.biome')}</div>
									<Collapsible>
										<CollapsibleTrigger className="flex items-center gap-2 hover:text-primary transition-colors">
											<TreePine className="h-4 w-4" />
											{planetInfo.biome}
										</CollapsibleTrigger>

										<CollapsibleContent>
											<motion.div
												initial={{ opacity: 0, y: -10 }}
												animate={{ opacity: 1, y: 0 }}
												className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20"
											>
												<div className="flex justify-between items-center mb-2">
													<div className="text-sm font-medium">
														{t('planet.biome_characteristics')}
													</div>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => setShowAllBiomes(true)}
														className="text-xs text-primary hover:text-primary/80"
													>
														{t('planet.view_all_biomes')}
													</Button>
												</div>
												<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
													<div>
														<div className="text-xs text-primary mb-1">
															{t('planet.advantages')}
														</div>
														<div className="text-sm text-muted-foreground">
															{biomeInfo?.bonuses}
														</div>
													</div>
													<div>
														<div className="text-xs text-red-400 mb-1">
															{t('planet.disadvantages')}
														</div>
														<div className="text-sm text-muted-foreground">
															{biomeInfo?.maluses}
														</div>
													</div>
												</div>
											</motion.div>
										</CollapsibleContent>
									</Collapsible>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</motion.div>

			{/* Chat Window */}
			<motion.div variants={itemVariants}>
				<Card className="bg-card/50 backdrop-blur-sm neon-border h-[400px] flex flex-col">
					<CardHeader className="pb-2">
						<CardTitle className="neon-text flex items-center gap-2">
							<MessageSquare className="h-4 w-4" />
							{t('comms.title')}
						</CardTitle>
					</CardHeader>
					<CardContent className="flex-1 flex flex-col overflow-hidden">
						<ScrollArea className="flex-1" ref={scrollAreaRef}>
							<div className="space-y-4 font-mono pr-4">
								{messages &&
									[...messages].reverse().map((msg: ChatMessage) => (
										<div key={msg.id} className="text-sm break-words flex items-start gap-2">
											{msg.sender?.avatar ? (
												<Image
													src={`/images/avatars/${msg.sender?.avatar}.webp`}
													width={100}
													height={100}
													alt={msg.sender?.name || 'User'}
													className="w-6 h-6 flex-shrink-0 object-cover"
												/>
											) : (
												<div className="w-6 h-6 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center text-[10px] uppercase">
													{msg.sender?.name?.[0] || '?'}
												</div>
											)}
											<div>
												<span className="text-primary whitespace-nowrap">
													[
													{formatDistanceToNow(msg.created_at.toDate(), {
														addSuffix: true,
														locale: getDateLocale(),
													})}
													]
												</span>{' '}
												<Link
													href={msg.type === 'user_message' ? `/user/${msg.sender?.id}` : '#'}
													className={`text-secondary ${
														msg.type === 'system_message' ? 'text-red-500' : ''
													} ${msg.type === 'user_message' ? 'hover:underline' : ''}`}
													onClick={(e) => {
														if (msg.type !== 'user_message') {
															e.preventDefault();
														}
													}}
												>
													{msg.sender?.name}:
												</Link>{' '}
												<span
													className={`text-muted-foreground ${
														msg.type === 'system_message' ? 'text-red-400' : ''
													}`}
												>
													{msg.text}
												</span>
											</div>
										</div>
									))}
							</div>
						</ScrollArea>
						<form onSubmit={handleSendMessage} className="border border-primary/30 rounded p-2 mt-4">
							<input
								type="text"
								value={newMessage}
								onChange={(e) => setNewMessage(e.target.value)}
								placeholder={`> ${t('comms.enter_message')}`}
								className="w-full bg-transparent border-none focus:outline-none text-primary placeholder:text-primary/50"
							/>
						</form>
					</CardContent>
				</Card>
			</motion.div>

			<OnlineCommandersDialog open={showOnlineCommanders} onOpenChange={setShowOnlineCommanders} />

			<BiomesDialog open={showAllBiomes} onOpenChange={setShowAllBiomes} />

			<RenamePlanetDialog open={showRenameDialog} onOpenChange={setShowRenameDialog} />
		</motion.div>
	);
}

function OnlineCommandersDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
	const { state } = useGame();
	const { t } = useTranslation('dashboard');

	// Memoize the query to prevent recreation on every render
	const commandersQuery = useMemo(() => {
		if (!state.activePlayers?.length) return null;
		return query(
			collection(db, 'users').withConverter(withIdConverter),
			where('__name__', 'in', state.activePlayers)
		);
	}, [state.activePlayers]); // Only recreate when activePlayers changes

	// Use the memoized query
	const [commanders] = useCollectionData(commandersQuery);

	// Memoize the commanders list to prevent unnecessary re-renders of child components
	const memoizedCommanders = useMemo(() => {
		if (!commanders) return [];
		return commanders.map((commander) => ({
			id: commander.id,
			name: commander.name,
			avatar: commander.avatar,
		}));
	}, [commanders]); // Only recreate when commanders data changes

	if (!memoizedCommanders.length) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Users className="h-5 w-5 text-primary" />
						{t('dialogs.online_commanders.title')}
					</DialogTitle>
				</DialogHeader>
				<ScrollArea className="max-h-[60vh]">
					<div className="space-y-4 pr-4">
						{memoizedCommanders.map((commander) => (
							<Link
								key={commander.id}
								href={`/user/${commander.id}`}
								className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary/10 transition-colors"
							>
								{commander.avatar ? (
									<Image
										src={`/images/avatars/${commander.avatar}.webp`}
										width={40}
										height={40}
										alt={commander.name}
										className="rounded-full"
									/>
								) : (
									<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg uppercase">
										{commander.name[0]}
									</div>
								)}
								<span className="text-primary">{commander.name}</span>
							</Link>
						))}
					</div>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
}

function BiomesDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
	const { state } = useGame();
	const { t } = useTranslation('dashboard');

	if (!state.gameConfig) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-3xl">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<TreePine className="h-5 w-5 text-primary" />
						{t('dialogs.biomes.title')}
					</DialogTitle>
				</DialogHeader>
				<ScrollArea className="max-h-[60vh]">
					<div className="space-y-6 pr-4">
						{Object.entries(state.gameConfig?.biomes || {}).map(([biome, modifiers]) => {
							const info = formatBiomeInfo(modifiers);
							return (
								<Card key={biome} className="bg-card/50">
									<CardHeader>
										<CardTitle className="text-lg flex items-center gap-2">
											<TreePine className="h-4 w-4 text-primary" />
											{biome.replace(/_/g, ' ').toUpperCase()}
										</CardTitle>
									</CardHeader>
									<CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<div className="text-xs text-primary mb-1">{t('planet.advantages')}</div>
											<div className="text-sm text-muted-foreground">{info.bonuses}</div>
										</div>
										<div>
											<div className="text-xs text-red-400 mb-1">{t('planet.disadvantages')}</div>
											<div className="text-sm text-muted-foreground">{info.maluses}</div>
										</div>
									</CardContent>
								</Card>
							);
						})}
					</div>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
}

const formatBiomeInfo = (biomeModifiers: { [key in ResourceType]?: number }) => {
	const bonuses: string[] = [];
	const maluses: string[] = [];

	Object.entries(biomeModifiers).forEach(([resource, modifier]) => {
		const formattedResource = resource.replace('_', ' ').toUpperCase();
		const percentage = Math.abs(modifier || 0);

		if (modifier && modifier > 0) {
			bonuses.push(`+${percentage}% ${formattedResource} production`);
		} else if (modifier && modifier < 0) {
			maluses.push(`-${percentage}% ${formattedResource} production`);
		}
	});

	return {
		bonuses: bonuses.join('\n') || 'No bonuses',
		maluses: maluses.join('\n') || 'No penalties',
	};
};

function RenamePlanetDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
	const { state } = useGame();
	const { t } = useTranslation('dashboard');
	const [newPlanetName, setNewPlanetName] = useState('');

	const handleRenamePlanet = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!state.selectedPlanet?.id) return;

		try {
			await api.renamePlanet(state.selectedPlanet.id, newPlanetName);
			onOpenChange(false);
			setNewPlanetName('');
			console.log('Planet renamed successfully');
		} catch (error) {
			console.error('Failed to rename planet:', error);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<MapPin className="h-5 w-5 text-primary" />
						{t('dialogs.rename_planet.title')}
					</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleRenamePlanet}>
					<div className="grid gap-4 py-4">
						<div className="space-y-2">
							<div className="text-sm text-muted-foreground">
								{t('dialogs.rename_planet.current_name')}
							</div>
							<div className="font-medium">{state.selectedPlanet?.name}</div>
						</div>
						<div className="space-y-2">
							<label htmlFor="name" className="text-sm text-muted-foreground">
								{t('dialogs.rename_planet.new_name')}
							</label>
							<Input
								id="name"
								value={newPlanetName}
								onChange={(e) => setNewPlanetName(e.target.value)}
								placeholder={t('dialogs.rename_planet.enter_new_name')}
								className="col-span-3"
								autoFocus
								required
								minLength={3}
								maxLength={30}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button type="submit" disabled={!newPlanetName.trim()}>
							{t('dialogs.rename_planet.submit')}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
