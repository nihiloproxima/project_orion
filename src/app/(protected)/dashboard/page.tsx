'use client';

import { Activity, MessageSquare, Rocket, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { containerVariants, itemVariants } from '@/lib/animations';
import { useEffect, useRef, useState } from 'react';

import { ChatMessage } from '../../../models/chat_message';
import Image from 'next/image';
import Link from 'next/link';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { Ship } from '../../../models/ship';
import { api } from '../../../lib/api';
import { getPublicImageUrl } from '@/lib/images';
import { motion } from 'framer-motion';
import { supabase } from '../../../lib/supabase';
import { useGame } from '../../../contexts/GameContext';
import { useRouter } from 'next/navigation'; // Changed from next/router

export default function Dashboard() {
	const router = useRouter();
	const { state } = useGame();
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [newMessage, setNewMessage] = useState('');
	const scrollAreaRef = useRef<HTMLDivElement>(null);
	const [stationedShips, setStationedShips] = useState<number>(0);
	const [allShips, setAllShips] = useState<Ship[]>([]);

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
					},
					{
						title: 'SYSTEM STATUS',
						icon: <Activity className="h-4 w-4 text-primary" />,
						value: 'OPTIMAL',
						subtext: 'All systems green',
					},
					{
						title: 'ACTIVE COMMANDERS',
						icon: <Users className="h-4 w-4 text-primary" />,
						value: state.activePlayers,
						subtext: 'Currently online',
					},
				].map((stat) => (
					<motion.div
						key={stat.title}
						variants={itemVariants}
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
					>
						<Card className="bg-card/50 backdrop-blur-sm neon-border hover:shadow-[0_0_20px_rgba(32,224,160,0.3)] transition-all duration-300">
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
		</motion.div>
	);
}
