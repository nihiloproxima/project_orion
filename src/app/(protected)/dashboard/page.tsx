'use client';

import { MessageSquare, Rocket, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { ChatMessage, Ship } from '../../../models';
import { containerVariants, itemVariants } from '@/lib/animations';
import { useEffect, useRef, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { api } from '../../../lib/api';
import { getPublicImageUrl } from '@/lib/images';
import { motion } from 'framer-motion';
import { supabase } from '../../../lib/supabase';
import { useGame } from '../../../contexts/GameContext';
import { useRouter } from 'next/navigation'; // Changed from next/router
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';

export default function Dashboard() {
	const router = useRouter();
	const { state } = useGame();
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [newMessage, setNewMessage] = useState('');
	const scrollAreaRef = useRef<HTMLDivElement>(null);
	const [stationedShips, setStationedShips] = useState<number>(0);
	const [allShips, setAllShips] = useState<Ship[]>([]);
	const [unreadMails, setUnreadMails] = useState<number>(0);
	const [showOnlineCommanders, setShowOnlineCommanders] = useState(false);
	const [commanders, setCommanders] = useState<{ id: string; name: string; avatar: string | null }[]>([]);

	useEffect(() => {
		// Initial fetch of messages
		const fetchMessages = async () => {
			const { data } = await supabase
				.from('chat_messages')
				.select('*')
				.order('created_at', { ascending: false })
				.limit(50);

			if (data) {
				setMessages(data.reverse());
			}
		};

		fetchMessages();

		// Subscribe to new messages
		const subscription = supabase
			.channel('chat_messages')
			.on(
				'postgres_changes',
				{
					event: 'INSERT',
					schema: 'public',
					table: 'chat_messages',
				},
				(payload) => {
					setMessages((prev) => [...prev, payload.new as ChatMessage]);
				}
			)
			.subscribe();

		return () => {
			subscription.unsubscribe();
		};
	}, []);

	useEffect(() => {
		// Scroll to bottom when new messages arrive
		if (scrollAreaRef.current) {
			const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
			if (scrollContainer) {
				scrollContainer.scrollTop = scrollContainer.scrollHeight;
			}
		}
	}, [messages]);

	const handleSendMessage = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newMessage.trim()) return;

		try {
			await api.chat.sendMessage('global', newMessage);
			setNewMessage('');
		} catch (error) {
			console.error('Failed to send message:', error);
		}
	};

	useEffect(() => {
		if (!state.loading) {
			if (state.currentUser) {
				if (!state.selectedPlanet && state.userPlanets.length === 0) {
					router.push('/secure-communications');
				}
			} else {
				router.push('/create-user');
			}
		}
	}, [state.loading, state.currentUser, state.selectedPlanet, state.userPlanets.length, router]);

	useEffect(() => {
		const fetchActivePlayers = async () => {
			const { data } = await supabase.from('users').select('id, name, avatar').in('id', state.activePlayers);
			setCommanders(data || []);
		};

		fetchActivePlayers();
	}, [state.activePlayers]);

	useEffect(() => {
		const fetchStationedShips = async () => {
			if (!state.selectedPlanet?.id) return;

			const { data, error } = await supabase
				.from('ships')
				.select('*')
				.eq('current_planet_id', state.selectedPlanet.id)
				.eq('status', 'stationed')
				.is('mission_type', null);

			if (error) {
				console.error('Error fetching stationed ships:', error);
				return;
			}

			setStationedShips(data?.length || 0);
		};

		fetchStationedShips();

		// Subscribe to changes
		const subscription = supabase
			.channel(`stationed_ships_${state.selectedPlanet?.id}`)
			.on(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'ships',
					filter: `current_planet_id=eq.${state.selectedPlanet?.id}`,
				},
				() => {
					// Refetch ships when there are changes
					fetchStationedShips();
				}
			)
			.subscribe();

		return () => {
			subscription.unsubscribe();
		};
	}, [state.selectedPlanet?.id]);

	useEffect(() => {
		const fetchAllShips = async () => {
			const { data, error } = await supabase.from('ships').select('*').eq('owner_id', state.currentUser?.id);

			if (error) {
				console.error('Error fetching ships:', error);
				return;
			}

			setAllShips(data || []);
		};

		fetchAllShips();

		const subscription = supabase
			.channel('user_ships')
			.on(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'ships',
					filter: `owner_id=eq.${state.currentUser?.id}`,
				},
				() => {
					fetchAllShips();
				}
			)
			.subscribe();

		return () => {
			subscription.unsubscribe();
		};
	}, [state.currentUser?.id]);

	useEffect(() => {
		const fetchUnreadMails = async () => {
			if (!state.currentUser?.id) return;

			const { data, error } = await supabase
				.from('mails')
				.select('id', { count: 'exact' })
				.eq('owner_id', state.currentUser.id)
				.eq('read', false);

			if (error) {
				console.error('Error fetching unread mails:', error);
				return;
			}

			setUnreadMails(data?.length || 0);
		};

		fetchUnreadMails();

		// Subscribe to mail changes
		const subscription = supabase
			.channel('user_mails')
			.on(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'mails',
					filter: `owner_id=eq.${state.currentUser?.id}`,
				},
				() => {
					fetchUnreadMails();
				}
			)
			.subscribe();

		return () => {
			subscription.unsubscribe();
		};
	}, [state.currentUser?.id]);

	const calculateFleetStats = () => {
		const stats = {
			total: allShips.length,
			inCombat: allShips.filter((ship) => ship.status === 'traveling' && ship.mission_type === 'attack').length,
			inOrbit: allShips.filter((ship) => ship.status === 'traveling' && ship.mission_type !== 'attack').length,
			stationed: stationedShips,
		};

		return stats;
	};

	if (state.userPlanets.length === 0) {
		router.push('/secure-communications');
		return null; // Return null while redirecting
	}

	const fleetStats = calculateFleetStats();

	return (
		<motion.div className="space-y-8" variants={containerVariants} initial="hidden" animate="show">
			<motion.div className="flex justify-between items-center" variants={itemVariants}>
				<div>
					<h1 className="text-3xl font-bold neon-text mb-2">COMMAND CENTER</h1>
					<p className="text-muted-foreground">Welcome, Commander. All systems operational.</p>
				</div>
			</motion.div>

			{/* Stats Grid */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{[
					{
						title: 'FLEET STATUS',
						icon: <Rocket className="h-4 w-4 text-primary" />,
						value: `${fleetStats.total} Ships`,
						subtext: `${fleetStats.inCombat} in combat, ${fleetStats.inOrbit} in orbit, ${fleetStats.stationed} stationed`,
						onClick: undefined,
					},
					{
						title: 'UNREAD MESSAGES',
						icon: <MessageSquare className="h-4 w-4 text-primary" />,
						value: `${unreadMails} Messages`,
						subtext: 'Unread communications',
						onClick: undefined,
					},
					{
						title: 'ACTIVE COMMANDERS',
						icon: <Users className="h-4 w-4 text-primary" />,
						value: state.activePlayers.length,
						subtext: 'Currently online',
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
							className={`bg-card/50 backdrop-blur-sm neon-border hover:shadow-[0_0_20px_rgba(32,224,160,0.3)] transition-all duration-300 ${
								stat.onClick ? 'cursor-pointer' : ''
							}`}
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

			{/* Chat Window */}
			<motion.div variants={itemVariants}>
				<Card className="bg-card/50 backdrop-blur-sm neon-border h-[400px] flex flex-col">
					<CardHeader className="pb-2">
						<CardTitle className="neon-text flex items-center gap-2">
							<MessageSquare className="h-4 w-4" />
							UNIVERSAL COMMS
						</CardTitle>
					</CardHeader>
					<CardContent className="flex-1 flex flex-col overflow-hidden">
						<ScrollArea className="flex-1" ref={scrollAreaRef}>
							<div className="space-y-4 font-mono pr-4">
								{messages.map((msg) => (
									<div key={msg.id} className="text-sm break-words flex items-start gap-2">
										{msg.sender_avatar ? (
											<Image
												src={getPublicImageUrl('avatars', msg.sender_avatar + '.webp')}
												width={100}
												height={100}
												alt={msg.sender_name || 'User'}
												className="w-6 h-6 flex-shrink-0 object-cover"
											/>
										) : (
											<div className="w-6 h-6 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center text-[10px] uppercase">
												{msg.sender_name?.[0] || '?'}
											</div>
										)}
										<div>
											<span className="text-primary whitespace-nowrap">
												[{new Date(msg.created_at).toLocaleTimeString()}]
											</span>{' '}
											<Link
												href={msg.type === 'user_message' ? `/user/${msg.sender_id}` : '#'}
												className={`text-secondary ${
													msg.type === 'system_message' ? 'text-red-500' : ''
												} ${msg.type === 'user_message' ? 'hover:underline' : ''}`}
												onClick={(e) => {
													if (msg.type !== 'user_message') {
														e.preventDefault();
													}
												}}
											>
												{msg.sender_name}:
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
								placeholder="> Enter message..."
								className="w-full bg-transparent border-none focus:outline-none text-primary placeholder:text-primary/50"
							/>
						</form>
					</CardContent>
				</Card>
			</motion.div>

			<OnlineCommandersDialog
				open={showOnlineCommanders}
				onOpenChange={setShowOnlineCommanders}
				commanders={commanders}
			/>
		</motion.div>
	);
}

function OnlineCommandersDialog({
	open,
	onOpenChange,
	commanders,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	commanders: { id: string; name: string; avatar: string | null }[];
}) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Users className="h-5 w-5 text-primary" />
						Online Commanders
					</DialogTitle>
				</DialogHeader>
				<ScrollArea className="max-h-[60vh]">
					<div className="space-y-4 pr-4">
						{commanders.map((commander) => (
							<Link
								key={commander.id}
								href={`/user/${commander.id}`}
								className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary/10 transition-colors"
							>
								{commander.avatar ? (
									<Image
										src={getPublicImageUrl('avatars', commander.avatar + '.webp')}
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
