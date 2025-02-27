'use client';

import { AlertTriangle, Factory, Plus, Hammer, Flame } from 'lucide-react';
import { Card, CardHeader } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';

import { ErrorBoundary } from '../../../components/ErrorBoundary';
import Image from 'next/image';

import { ShipyardQueue } from '../../../models/shipyard_queue';
import { Timer } from '../../../components/Timer';
import utils from '../../../lib/utils';
import { useGame } from '../../../contexts/GameContext';

import { useDocumentData } from 'react-firebase-hooks/firestore';
import { doc, DocumentReference } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useEffect, useState } from 'react';
import { ComponentType, ShipBlueprint, ShipComponent, ShipStats } from '@/models/ship';
import { UserInventory } from '@/models/user_inventory';
import { api } from '@/lib/api';

const rarityColors = {
	common: 'border-gray-400',
	rare: 'border-blue-400',
	epic: 'border-purple-400',
	legendary: 'border-amber-400',
};
const rarityTextColors = {
	common: 'text-gray-400',
	rare: 'text-blue-400',
	epic: 'text-purple-400',
	legendary: 'text-amber-400',
};

function QueueDisplay({ queue }: { queue: ShipyardQueue | undefined }) {
	if (!queue || queue.commands.length === 0) {
		return <div className="text-muted-foreground text-sm mb-6">No ships currently in production</div>;
	}

	return (
		<div className="mb-6">
			<h2 className="text-xl font-bold mb-4 flex items-center gap-2">
				Production Queue ({queue.commands.length}/{queue.capacity})
			</h2>
			<div className="grid gap-3">
				{queue.commands.map((command, index) => {
					const asset = `/images/ships/${command.ship.asset}.webp`;
					const isInProgress = index === 0;
					const previousCommand = index > 0 ? queue.commands[index - 1] : null;

					return (
						<Card key={index} className="bg-black/30">
							<CardHeader className="flex flex-row items-center p-4">
								<Image
									src={asset}
									alt={command.ship.name || ''}
									width={100}
									height={100}
									className="w-12 h-12 rounded mr-4"
								/>
								<div className="flex-1">
									<div className="font-bold">{command.ship.name}</div>
								</div>
								<div className="flex items-center gap-2 text-primary">
									{isInProgress ? (
										<Timer
											startTime={command.construction_start_time.toMillis()}
											finishTime={command.construction_finish_time.toMillis()}
											showProgressBar={true}
										/>
									) : previousCommand ? (
										<div className="text-sm">
											Starts in:{' '}
											{utils.formatTimerTime(
												(previousCommand.construction_finish_time.toMillis() - Date.now()) /
													1000
											)}
										</div>
									) : null}
								</div>
							</CardHeader>
						</Card>
					);
				})}
			</div>
		</div>
	);
}

function ShipBuilder({ onClose }: { onClose: () => void }) {
	const { state } = useGame();
	const [inventory] = useDocumentData(
		state.gameConfig
			? (doc(db, `users/${state.currentUser?.id}/private/inventory`) as DocumentReference<UserInventory>)
			: null
	);
	const [selectedBlueprint, setSelectedBlueprint] = useState<ShipBlueprint | null>(null);
	const [selectedComponents, setSelectedComponents] = useState<Partial<Record<ComponentType, ShipComponent>>>({});

	// Track component stat contributions
	const [componentStats, setComponentStats] = useState<Partial<Record<keyof ShipStats, number>>>({});

	useEffect(() => {
		const newComponentStats: Partial<Record<keyof ShipStats, number>> = {};

		for (const [, component] of Object.entries(selectedComponents)) {
			if (component) {
				Object.entries(component.stats).forEach(([stat, value]) => {
					newComponentStats[stat as keyof ShipStats] =
						(newComponentStats[stat as keyof ShipStats] || 0) + value;
				});
			}
		}

		setComponentStats(newComponentStats);
	}, [selectedComponents]);

	const handleComponentSelect = (type: ComponentType, component: ShipComponent | null) => {
		setSelectedComponents((prev) => {
			// If component is null, remove it from selection
			if (!component) {
				const newSelection = { ...prev };
				delete newSelection[type];
				return newSelection;
			}

			return {
				...prev,
				[type]: component,
			};
		});
	};

	const isValidBuild =
		selectedBlueprint &&
		Object.entries(selectedBlueprint.required_components).every(
			([type, required]) => !required || selectedComponents[type as ComponentType]
		);

	// Calculate resource requirements
	const resourceRequirements = selectedBlueprint
		? {
				credits: selectedBlueprint.base_cost.credits,
				metal: selectedBlueprint.base_cost.resources.metal || 0,
				deuterium: selectedBlueprint.base_cost.resources.deuterium || 0,
		  }
		: { credits: 0, metal: 0, deuterium: 0 };

	// Check if player can afford the ship
	const canAfford =
		inventory &&
		inventory.credits >= resourceRequirements.credits &&
		state.currentResources?.metal >= resourceRequirements.metal &&
		state.currentResources?.deuterium >= resourceRequirements.deuterium;

	// Calculate combined stats
	const baseStats: ShipStats = selectedBlueprint
		? {
				speed: selectedBlueprint.base_stats.speed,
				capacity: selectedBlueprint.base_stats.capacity,
				attack: selectedBlueprint.base_stats.attack,
				defense: selectedBlueprint.base_stats.defense,
				shield: selectedBlueprint.base_stats.shield,
				evasion: selectedBlueprint.base_stats.evasion,
				accuracy: selectedBlueprint.base_stats.accuracy,
				crew_capacity: selectedBlueprint.base_stats.crew_capacity,
				critical_chance: selectedBlueprint.base_stats.critical_chance,
				fire_rate: selectedBlueprint.base_stats.fire_rate,
				initiative: selectedBlueprint.base_stats.initiative,
		  }
		: {
				speed: 0,
				capacity: 0,
				attack: 0,
				defense: 0,
				shield: 0,
				evasion: 0,
				accuracy: 0,
				crew_capacity: 0,
				critical_chance: 0,
				fire_rate: 0,
				initiative: 0,
		  };

	const handleBuild = async () => {
		try {
			if (!selectedBlueprint) return;
			if (!isValidBuild) return;
			if (!canAfford) return;

			await api.buildShip(
				state.selectedPlanet!.id,
				selectedBlueprint.id,
				Object.values(selectedComponents).map((c) => c.id)
			);

			onClose();
		} catch (error) {
			console.error(error);
		}
	};

	if (!selectedBlueprint) {
		return (
			<div className="space-y-6">
				<h2 className="text-2xl font-bold">Select Blueprint</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{(inventory?.ship_blueprints || []).map((blueprint) => {
						return (
							<Card
								key={blueprint.id}
								className={`cursor-pointer hover:bg-accent/50 transition-colors border-2 ${
									rarityColors[blueprint.rarity]
								}`}
								onClick={() => setSelectedBlueprint(blueprint)}
							>
								<CardHeader className="p-4">
									<div className="flex items-center gap-4">
										<Image
											src={`/images/ships/${blueprint.asset}.webp`}
											alt={blueprint.name}
											width={80}
											height={80}
											className="rounded"
										/>
										<div>
											<div className="font-bold">{blueprint.name}</div>
											<div
												className={`text-sm ${
													rarityTextColors[blueprint.rarity]
												} font-semibold`}
											>
												{blueprint.rarity.charAt(0).toUpperCase() + blueprint.rarity.slice(1)}
											</div>
											<div className="text-sm text-muted-foreground">{blueprint.ship_type}</div>
										</div>
									</div>
								</CardHeader>
							</Card>
						);
					})}
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Crafting Interface */}
				<div>
					<div className="relative h-[500px] lg:h-[600px]">
						{/* Central Blueprint */}
						<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 lg:w-64">
							<Card className="bg-accent/30 border-2 border-primary">
								<CardHeader>
									<Image
										src={`/images/ships/${selectedBlueprint.asset}.webp`}
										alt={selectedBlueprint.name}
										width={200}
										height={200}
										className="mx-auto"
									/>
									<div className="text-center">
										<h3 className="font-bold">{selectedBlueprint.name}</h3>
										<p className="text-sm text-muted-foreground">{selectedBlueprint.ship_type}</p>
									</div>
								</CardHeader>
							</Card>
						</div>

						{/* Component Slots - Only show required or already selected components */}
						{(['hull', 'weapon', 'shield_generator', 'engine'] as ComponentType[])
							.filter((type) => selectedBlueprint.required_components[type] || selectedComponents[type])
							.map((type, index, filteredArray) => {
								// Recalculate angle based on number of visible components
								const angle = (Math.PI * 2 * index) / filteredArray.length;
								const radius = window.innerWidth < 1024 ? 160 : 200; // Smaller radius on mobile
								const x = Math.cos(angle) * radius;
								const y = Math.sin(angle) * radius;
								const isRequired = selectedBlueprint.required_components[type] === true;

								// Find components of this type
								const availableComponents = (inventory?.ship_components || []).filter(
									(c) => c.type === type
								);

								// Get currently selected component
								const selectedComponent = selectedComponents[type];

								return (
									<div
										key={type}
										className="absolute w-32 lg:w-48"
										style={{
											top: `calc(50% + ${y}px)`,
											left: `calc(50% + ${x}px)`,
											transform: 'translate(-50%, -50%)',
										}}
									>
										<div className="relative">
											{/* Connection line */}
											<div
												className="absolute w-px h-px bg-primary"
												style={{
													width: '2px',
													height: `${radius}px`,
													transformOrigin: '50% 0',
													transform: `rotate(${angle + Math.PI / 2}rad)`,
												}}
											/>

											<Select
												value={selectedComponent?.id || ''}
												onValueChange={(value) => {
													if (value === '') {
														handleComponentSelect(type, null);
														return;
													}

													const component = inventory?.ship_components.find(
														(c) => c.id === value
													);
													if (component) handleComponentSelect(type, component);
												}}
											>
												<SelectTrigger className={isRequired ? 'border-primary' : ''}>
													<SelectValue
														placeholder={`Select ${type}${isRequired ? ' *' : ''}`}
													/>
												</SelectTrigger>
												<SelectContent>
													{!isRequired && <SelectItem value="">None</SelectItem>}
													{availableComponents.map((component) => (
														<SelectItem key={component.id} value={component.id}>
															{component.name} ({component.rarity})
														</SelectItem>
													))}
												</SelectContent>
											</Select>

											{/* Component stats preview */}
											{selectedComponent && (
												<Card className="mt-2 p-2 bg-black/50 text-xs">
													<div
														className={`text-${
															rarityTextColors[selectedComponent.rarity]
														} font-semibold mb-1`}
													>
														{selectedComponent.effect && (
															<div className="text-accent">
																Effect: {selectedComponent.effect}
															</div>
														)}
													</div>
													{Object.entries(selectedComponent.stats)
														.filter(([, value]) => value !== 0)
														.map(([stat, value]) => (
															<div key={stat} className="flex justify-between">
																<span className="capitalize">
																	{stat.replace(/_/g, ' ')}:
																</span>
																<span
																	className={
																		value > 0 ? 'text-green-400' : 'text-red-400'
																	}
																>
																	{value > 0 ? '+' : ''}
																	{value}
																</span>
															</div>
														))}
												</Card>
											)}
										</div>
									</div>
								);
							})}
					</div>
				</div>

				{/* Stats Preview and Actions */}
				<div className="space-y-6">
					{/* Resource Requirements */}
					<Card className="bg-black/30">
						<CardHeader>
							<h3 className="font-bold text-sm mb-2">Resource Requirements</h3>
							<div className="space-y-2 text-sm">
								<div className="flex justify-between items-center">
									<span className="text-muted-foreground">Credits:</span>
									<span
										className={`font-mono ${
											inventory && inventory.credits < resourceRequirements.credits
												? 'text-red-400'
												: ''
										}`}
									>
										{resourceRequirements.credits.toLocaleString()}
									</span>
								</div>
								{resourceRequirements.metal > 0 && (
									<div className="flex justify-between items-center">
										<span className="text-muted-foreground flex items-center">
											<Hammer className="h-4 w-4 mr-1 text-secondary" /> Metal:
										</span>
										<span
											className={`font-mono ${
												state.currentResources &&
												state.currentResources.metal < resourceRequirements.metal
													? 'text-red-400'
													: ''
											}`}
										>
											{resourceRequirements.metal.toLocaleString()}
										</span>
									</div>
								)}
								{resourceRequirements.deuterium > 0 && (
									<div className="flex justify-between items-center">
										<span className="text-muted-foreground flex items-center">
											<Flame className="h-4 w-4 mr-1 text-primary" /> Deuterium:
										</span>
										<span
											className={`font-mono ${
												state.currentResources &&
												state.currentResources.deuterium < resourceRequirements.deuterium
													? 'text-red-400'
													: ''
											}`}
										>
											{resourceRequirements.deuterium.toLocaleString()}
										</span>
									</div>
								)}
							</div>
						</CardHeader>
					</Card>

					{/* Ship Stats Preview */}
					<Card className="bg-black/30">
						<CardHeader>
							<h3 className="font-bold text-sm mb-2">Ship Statistics Preview</h3>
							<div className="space-y-1 text-sm">
								{Object.entries(baseStats).map(([stat, value]) => {
									const componentBonus = componentStats[stat as keyof ShipStats] || 0;
									const showBonus = componentBonus !== 0;

									return (
										<div key={stat} className="flex justify-between">
											<span className="text-muted-foreground capitalize">
												{stat.replace(/_/g, ' ')}:
											</span>
											<span className="font-mono">
												{value}
												{showBonus && (
													<span
														className={
															componentBonus > 0
																? 'text-green-400 ml-1'
																: 'text-red-400 ml-1'
														}
													>
														({componentBonus > 0 ? '+' : ''}
														{componentBonus})
													</span>
												)}
												{(stat === 'critical_chance' || stat === 'fire_rate') && '%'}
											</span>
										</div>
									);
								})}
							</div>
						</CardHeader>
					</Card>

					{/* Action Buttons */}
					<div className="flex justify-end gap-4">
						<Button variant="outline" onClick={onClose}>
							Cancel
						</Button>
						<Button
							disabled={!isValidBuild || !canAfford}
							onClick={handleBuild}
							title={
								!isValidBuild
									? 'Missing required components'
									: !canAfford
									? 'Not enough resources'
									: 'Add to construction queue'
							}
						>
							<Plus className="w-4 h-4 mr-2" />
							Add to Construction Queue
						</Button>
					</div>

					{!canAfford && isValidBuild && (
						<div className="text-red-400 text-sm text-center">Not enough resources to build this ship</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default function Shipyard() {
	const { state } = useGame();
	const [showBuilder, setShowBuilder] = useState(false);
	const [shipyardQueue] = useDocumentData(
		state.gameConfig && state.selectedPlanet
			? (doc(
					db,
					`seasons/${state.gameConfig.season.current}/planets/${state.selectedPlanet.id}/private/shipyard_queue`
			  ) as DocumentReference<ShipyardQueue>)
			: null
	);

	// Check if shipyard exists
	const hasShipyard = state.selectedPlanet?.structures.some(
		(structure) => structure.type === 'shipyard' && structure.level >= 1
	);

	if (!hasShipyard) {
		return (
			<div className="flex flex-col items-center justify-center h-[80vh] space-y-6 text-center">
				<AlertTriangle className="w-16 h-16 text-red-500 animate-pulse" />
				<div className="space-y-2">
					<h2 className="text-2xl font-bold text-red-500">ACCESS DENIED</h2>
					<div className="font-mono text-sm text-muted-foreground max-w-md">
						<p className="mb-2">[ERROR CODE: NO_SHIPYARD_DETECTED]</p>
						<p>Shipyard structure required for spacecraft construction.</p>
						<p>Please construct a shipyard to access ship building capabilities.</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<ErrorBoundary>
			<div className="space-y-6">
				<div className="flex justify-between items-center">
					<div>
						<h1 className="text-3xl font-bold neon-text mb-2 flex items-center gap-2">
							<Factory className="h-8 w-8" />
							SHIPYARD
						</h1>
						<p className="text-muted-foreground">Construct and manage your fleet of spacecraft</p>
					</div>
					<Button onClick={() => setShowBuilder(true)}>
						<Plus className="w-4 h-4 mr-2" />
						Build New Ship
					</Button>
				</div>

				{showBuilder ? (
					<ShipBuilder onClose={() => setShowBuilder(false)} />
				) : (
					<QueueDisplay queue={shipyardQueue} />
				)}
			</div>
		</ErrorBoundary>
	);
}
