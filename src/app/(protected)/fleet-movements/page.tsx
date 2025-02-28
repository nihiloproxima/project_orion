'use client';

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { AlertTriangle, ArrowRight, Flame, Gift, Hammer, Microchip, Rocket, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { useState } from 'react';

import { Button } from '../../../components/ui/button';
import { FleetMovement } from '../../../models/fleet_movement';
import Image from 'next/image';
import { Timer } from '../../../components/Timer';

import { useGame } from '../../../contexts/GameContext';
import { useToast } from '@/hooks/use-toast';
import { withIdConverter } from '@/lib/firebase';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const FleetMovements = () => {
	const { state } = useGame();
	const [movements] = useCollectionData(
		state.gameConfig && state.currentUser
			? query(
					collection(db, `seasons/${state.gameConfig.season.current}/fleet_movements`).withConverter(
						withIdConverter
					),
					where('owner_id', '==', state.currentUser?.id)
			  )
			: null
	);
	const [hostileMovements] = useCollectionData(
		state.gameConfig && state.currentUser
			? query(
					collection(db, `seasons/${state.gameConfig.season.current}/fleet_movements`).withConverter(
						withIdConverter
					),
					where('destination.user_id', '==', state.currentUser?.id)
			  )
			: null
	);
	const [allyMovements] = useCollectionData(
		state.gameConfig && state.currentUser
			? query(
					collection(db, `seasons/${state.gameConfig.season.current}/fleet_movements`).withConverter(
						withIdConverter
					),
					where('destination.user_id', '==', state.currentUser?.id)
			  )
			: null
	);
	const [expandedMovement, setExpandedMovement] = useState<string | null>(null);
	const [missionFilter, setMissionFilter] = useState<string>('all');
	const [sortBy, setSortBy] = useState<string>('arrival');
	const [displayMode, setDisplayMode] = useState<'grid' | 'rows'>('grid');
	const { toast } = useToast();

	// Add controls component
	const MovementControls = () => (
		<div className="flex flex-wrap gap-4 mb-4" onClick={(e) => e.stopPropagation()}>
			<Select
				value={missionFilter}
				onValueChange={(value) => {
					setMissionFilter(value);
				}}
			>
				<SelectTrigger className="w-[180px]">
					<SelectValue placeholder="Filter by mission" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">All Missions</SelectItem>
					<SelectItem value="attack">Attack</SelectItem>
					<SelectItem value="transport">Transport</SelectItem>
					<SelectItem value="colonize">Colonize</SelectItem>
				</SelectContent>
			</Select>

			<Select
				value={sortBy}
				onValueChange={(value) => {
					setSortBy(value);
				}}
			>
				<SelectTrigger className="w-[180px]">
					<SelectValue placeholder="Sort by" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="arrival">Arrival Time</SelectItem>
					<SelectItem value="departure">Departure Time</SelectItem>
					<SelectItem value="ships">Ship Count</SelectItem>
					<SelectItem value="resources">Resource Amount</SelectItem>
				</SelectContent>
			</Select>

			<Select
				value={displayMode}
				onValueChange={(value: 'grid' | 'rows') => {
					setDisplayMode(value);
				}}
			>
				<SelectTrigger className="w-[180px]">
					<SelectValue placeholder="Display mode" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="grid">Grid View</SelectItem>
					<SelectItem value="rows">Row View</SelectItem>
				</SelectContent>
			</Select>
		</div>
	);

	const handleCancelMission = async (movementId: string, e: React.MouseEvent) => {
		e.stopPropagation();

		try {
			// TODO: Implement cancelMission in API
			// await api.cancelMission(movementId);
			toast({
				title: 'Success',
				description: 'Mission cancelled successfully.',
			});
		} catch (error) {
			console.error('Failed to cancel mission:', error);
			toast({
				title: 'Error',
				description: 'Failed to cancel mission. Please try again.',
				variant: 'destructive',
			});
		}
	};

	const getPlanetName = (x: number, y: number) => {
		return `[${x}:${y}]`;
	};

	const filterMovements = (movementsToFilter: FleetMovement[] | undefined) => {
		if (!movementsToFilter) return [];
		if (missionFilter === 'all') return movementsToFilter;
		return movementsToFilter.filter((m) => m.mission_type === missionFilter);
	};

	const sortMovements = (movementsToSort: FleetMovement[]) => {
		return [...movementsToSort].sort((a, b) => {
			switch (sortBy) {
				case 'arrival':
					return a.arrival_time.toMillis() - b.arrival_time.toMillis();
				case 'departure':
					return a.departure_time.toMillis() - b.departure_time.toMillis();
				// Add other sort methods as needed
				default:
					return a.arrival_time.toMillis() - b.arrival_time.toMillis();
			}
		});
	};

	const renderMovementCard = (movement: FleetMovement, type: 'own' | 'hostile' | 'ally' = 'own') => {
		const canCancel = type === 'own' && movement.status === 'traveling';

		return (
			<Card
				key={movement.id}
				className={`${
					type === 'hostile'
						? 'border-red-500/50 bg-red-950/10'
						: type === 'ally'
						? 'border-green-500/50 bg-green-950/10'
						: 'border-primary/20'
				} cursor-pointer transition-all hover:scale-[1.02]`}
				onClick={() => setExpandedMovement(expandedMovement === movement.id ? null : movement.id)}
			>
				<CardHeader>
					<CardTitle className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							{type === 'hostile' && <AlertTriangle className="h-5 w-5 text-red-500" />}
							{type === 'ally' && <Gift className="h-5 w-5 text-green-500" />}
							<Rocket className="h-5 w-5" />
							{movement.mission_type.charAt(0).toUpperCase() + movement.mission_type.slice(1)} Mission
						</div>
						{canCancel && (
							<AlertDialog>
								<AlertDialogTrigger asChild>
									<Button
										variant="ghost"
										size="sm"
										className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
										onClick={(e) => e.stopPropagation()}
										title="Cancel Mission"
									>
										<X className="h-4 w-4" />
									</Button>
								</AlertDialogTrigger>
								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle>Cancel Mission</AlertDialogTitle>
										<AlertDialogDescription>
											Are you sure you want to cancel this fleet movement? This action cannot be
											undone.
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel onClick={(e) => e.stopPropagation()}>
											Cancel
										</AlertDialogCancel>
										<AlertDialogAction onClick={(e) => handleCancelMission(movement.id, e)}>
											Confirm
										</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
						)}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid gap-2">
						<div className="flex items-center justify-between">
							<div className="text-sm">
								Origin: {getPlanetName(movement.origin.coordinates.x, movement.origin.coordinates.y)}
							</div>
							<ArrowRight className="h-4 w-4" />
							<div className="text-sm">
								Destination:{' '}
								{getPlanetName(movement.destination.coordinates.x, movement.destination.coordinates.y)}
							</div>
						</div>

						<div className="text-sm">
							Status: {movement.status.charAt(0).toUpperCase() + movement.status.slice(1)}
						</div>

						<div className="text-sm">
							<Timer
								startTime={movement.departure_time.toMillis()}
								finishTime={movement.arrival_time.toMillis()}
							/>
						</div>

						{expandedMovement === movement.id && (
							<>
								{movement.ships && movement.ships.length > 0 && (
									<div className="text-sm mt-2">
										<div className="font-semibold mb-1">Fleet:</div>
										<div className="grid grid-cols-2 gap-2">
											{movement.ships.map((ship, index) => (
												<div key={index} className="flex items-center gap-2">
													<Image
														src={`/images/ships/${ship.type || 'default'}.webp`}
														width={24}
														height={24}
														alt={ship.type || 'Ship'}
														className="w-6 h-6"
													/>
													{ship.type}: {ship.count || 1}
												</div>
											))}
										</div>
									</div>
								)}

								{/* Expanded resources section */}
								{movement.resources && (
									<div className="text-sm mt-2">
										<div className="font-semibold mb-1">Cargo:</div>
										<div className="grid grid-cols-2 gap-2">
											{Object.entries(movement.resources).map(([resource, amount]) => {
												const resourceConfig = {
													metal: {
														icon: <Hammer className="h-6 w-6 text-secondary" />,
														color: 'text-secondary',
													},
													microchips: {
														icon: <Microchip className="h-6 w-6 text-accent" />,
														color: 'text-accent',
													},
													deuterium: {
														icon: <Flame className="h-6 w-6 text-primary" />,
														color: 'text-primary',
													},
												}[resource.toLowerCase()];

												return (
													amount > 0 && (
														<div key={resource} className="flex items-center gap-2">
															{resourceConfig?.icon}
															<span className={resourceConfig?.color}>
																{resource}: {amount}
															</span>
														</div>
													)
												);
											})}
										</div>
									</div>
								)}
							</>
						)}
					</div>
				</CardContent>
			</Card>
		);
	};

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold neon-text mb-2 flex items-center gap-2">
					<Rocket className="h-8 w-8" />
					FLEET MOVEMENTS
				</h1>
				<p className="text-muted-foreground">Track your fleet operations and monitor hostile activity</p>
			</div>

			{hostileMovements && hostileMovements.length > 0 && (
				<div className="space-y-4">
					<h2 className="text-xl font-bold text-red-500">⚠️ Hostile Fleet Movements</h2>
					<MovementControls />
					<div className={displayMode === 'grid' ? 'grid gap-4 md:grid-cols-2' : 'space-y-4'}>
						{sortMovements(filterMovements(hostileMovements)).map((movement) =>
							renderMovementCard(movement, 'hostile')
						)}
					</div>
				</div>
			)}

			{allyMovements && allyMovements.length > 0 && (
				<div className="space-y-4">
					<h2 className="text-xl font-bold text-green-500">🤝 Incoming Allied Support</h2>
					<MovementControls />
					<div className={displayMode === 'grid' ? 'grid gap-4 md:grid-cols-2' : 'space-y-4'}>
						{sortMovements(filterMovements(allyMovements)).map((movement) =>
							renderMovementCard(movement, 'ally')
						)}
					</div>
				</div>
			)}

			<div className="space-y-4">
				<h2 className="text-xl font-bold">Your Fleet Movements</h2>
				<MovementControls />
				{movements && movements.length > 0 ? (
					<div className={displayMode === 'grid' ? 'grid gap-4 md:grid-cols-2' : 'space-y-4'}>
						{sortMovements(filterMovements(movements)).map((movement) =>
							renderMovementCard(movement, 'own')
						)}
					</div>
				) : (
					<p className="text-muted-foreground">No active fleet movements</p>
				)}
			</div>
		</div>
	);
};

export default FleetMovements;
