'use client';
import _ from 'lodash';
import {
	AlertTriangle,
	ChevronRight,
	Clock,
	Flame,
	FolderOpen,
	Hammer,
	Lock,
	Microchip,
	Minus,
	Plus,
	Shield,
	Swords,
	ChevronDown,
	Grid,
	Grid2x2,
	Grid3x3,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '../../../components/ui/card';

import { useEffect, useState } from 'react';

import { Button } from '../../../components/ui/button';
import { DefenseQueue } from '../../../models/defense_queue';
import { Defense, DefenseType, PlanetDefenses } from '../../../models/defense';
import { ErrorBoundary } from '../../../components/ErrorBoundary';
import Image from 'next/image';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { Timer } from '../../../components/Timer';
import { api } from '../../../lib/api';
import { formatTimerTime } from '../../../lib/utils';
import { getPublicImageUrl } from '@/lib/images';
import { motion } from 'framer-motion';
import { supabase } from '../../../lib/supabase';
import { useGame } from '../../../contexts/GameContext';
import { calculateDefenseConstructionTimeSeconds } from '@/utils/defenses_calculations';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../../components/ui/collapsible';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';

const QUEUE_CAPACITY = 5;

const DEFENSE_CATEGORIES: Record<string, { name: string; description: string; types: DefenseType[] }> = {
	basic: {
		name: 'BASIC_DEFENSES',
		description: 'Standard defensive structures',
		types: ['light_laser', 'missile_launcher', 'heavy_laser'] as DefenseType[],
	},
	advanced: {
		name: 'ADVANCED_DEFENSES',
		description: 'Advanced weapon systems',
		types: ['gauss_cannon', 'ion_cannon', 'plasma_turret'] as DefenseType[],
	},
	shields: {
		name: 'SHIELD_SYSTEMS',
		description: 'Planetary shield protection',
		types: ['small_shield_dome', 'large_shield_dome'] as DefenseType[],
	},
};

const DEFENSE_ASSETS: Record<DefenseType, { name: string; image: string; description: string }> = {
	missile_launcher: {
		name: 'Missile Launcher',
		image: getPublicImageUrl('defenses', 'missile_launcher.webp'),
		description: 'Basic defensive structure capable of launching conventional missiles at attacking ships.',
	},
	light_laser: {
		name: 'Light Laser',
		image: getPublicImageUrl('defenses', 'light_laser.webp'),
		description:
			'Portable quick-firing laser turret that can be rapidly deployed with ground troops, effective against smaller ships.',
	},
	heavy_laser: {
		name: 'Heavy Laser',
		image: getPublicImageUrl('defenses', 'heavy_laser.webp'),
		description: 'Powerful laser cannon capable of dealing significant damage to medium-sized vessels.',
	},
	gauss_cannon: {
		name: 'Gauss Cannon',
		image: getPublicImageUrl('defenses', 'gauss_cannon.webp'),
		description: 'Electromagnetic weapon that fires high-velocity projectiles.',
	},
	ion_cannon: {
		name: 'Ion Cannon',
		image: getPublicImageUrl('defenses', 'ion_cannon.webp'),
		description: 'Advanced weapon that disrupts ship systems with ionic energy.',
	},
	plasma_turret: {
		name: 'Plasma Turret',
		image: getPublicImageUrl('defenses', 'plasma_turret.webp'),
		description: 'High-energy plasma weapon effective against heavily armored targets.',
	},
	small_shield_dome: {
		name: 'Small Shield Dome',
		image: getPublicImageUrl('defenses', 'small_shield_dome.webp'),
		description: 'Protective energy field that absorbs a portion of incoming damage.',
	},
	large_shield_dome: {
		name: 'Large Shield Dome',
		image: getPublicImageUrl('defenses', 'large_shield_dome.webp'),
		description: 'Advanced shield system providing comprehensive planetary protection.',
	},
};

function QueueDisplay({ queue }: { queue: DefenseQueue | null }) {
	if (!queue?.commands || queue.commands.length === 0) {
		return <div className="text-muted-foreground text-sm mb-6">No defenses currently in production</div>;
	}

	return (
		<div className="mb-6">
			<h2 className="text-xl font-bold mb-4 flex items-center gap-2">
				Production Queue ({queue.commands.length}/{queue.capacity})
			</h2>
			<div className="grid gap-3">
				{queue.commands.map((command, index) => {
					const asset = DEFENSE_ASSETS[command.type];
					const isInProgress = index === 0;

					return (
						<Card key={index} className="bg-black/30">
							<CardHeader className="p-4">
								<div className="flex flex-col md:flex-row md:items-center md:justify-between w-full gap-4">
									<div className="flex items-center gap-4">
										<Image
											src={asset.image}
											alt={asset.name}
											width={100}
											height={100}
											className="w-12 h-12 rounded flex-shrink-0"
										/>
										<div className="flex-1 min-w-0">
											<div className="font-bold">{asset.name}</div>
											<div className="text-sm text-muted-foreground">
												Remaining units: {command.remaining_amount}
											</div>
											<div className="text-sm text-muted-foreground">
												Total units: {command.total_amount}
											</div>
										</div>
									</div>

									<div className="w-full md:w-auto text-primary">
										{isInProgress ? (
											<Timer
												startTime={command.current_item_start_time}
												finishTime={command.current_item_finish_time}
												showProgressBar={true}
											/>
										) : (
											<div className="text-sm">
												Starts in:{' '}
												{formatTimerTime(
													(queue.commands[index - 1].construction_finish_time - Date.now()) /
														1000
												)}
											</div>
										)}
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

function DefenseCard({
	type,
	queue,
	currentCount,
}: {
	type: DefenseType;
	queue: DefenseQueue | null;
	currentCount: number;
}) {
	const { state } = useGame();
	const [buildAmount, setBuildAmount] = useState(1);

	if (
		!state.planetStructures?.structures ||
		!state.gameConfig?.defenses ||
		!state.currentResources ||
		!state.userResearchs
	) {
		return null;
	}

	const asset = DEFENSE_ASSETS[type];
	const defenseFactory = state.planetStructures?.structures.find((s) => s.type === 'defense_factory');
	const config = state.gameConfig!.defenses.find((d) => d.type === type);

	if (!config) return null;

	// Check if requirements are met
	const meetsFactoryLevel = defenseFactory && defenseFactory.level >= config.requirements.defense_factory_level;
	const meetsTechRequirements = config.requirements.technologies.every(
		(req) => state.userResearchs!.technologies[req.id]?.level >= req.level
	);

	// Calculate max defenses possible with current resources
	const maxDefensesPerResource = {
		metal: Math.floor(state.currentResources.metal / config.cost.metal),
		deuterium: Math.floor(state.currentResources.deuterium / config.cost.deuterium),
		microchips: Math.floor(state.currentResources.microchips / config.cost.microchips),
	};
	const maxPossibleDefenses = Math.min(...Object.values(maxDefensesPerResource));

	const canAfford = buildAmount <= maxPossibleDefenses;

	// Calculate build time
	const buildTime = calculateDefenseConstructionTimeSeconds(
		state.gameConfig!,
		type,
		defenseFactory!.level,
		buildAmount
	);

	const isQueueFull = (queue?.commands?.length || 0) >= (queue?.capacity || 0);

	const handleBuild = async () => {
		if (!state.selectedPlanet?.id || isQueueFull) return;
		try {
			await api.defenses.buildDefense(type, state.selectedPlanet.id, buildAmount);
		} catch (error) {
			console.error('Error building defense:', error);
		}
	};

	const adjustAmount = (delta: number) => {
		const newAmount = Math.max(1, Math.min(buildAmount + delta, maxPossibleDefenses));
		setBuildAmount(newAmount);
	};

	return (
		<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
			<Card
				className={`bg-card/50 backdrop-blur-sm transition-all duration-300 h-full flex flex-col ${
					meetsFactoryLevel && meetsTechRequirements && canAfford && !isQueueFull
						? 'neon-border hover:shadow-[0_0_20px_rgba(32,224,160,0.3)]'
						: 'border-red-500/50'
				}`}
			>
				<CardHeader className="flex flex-col md:flex-row items-start gap-6 pb-2 flex-1">
					<motion.div
						initial={{ opacity: 0, scale: 0.8 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.5 }}
						className="w-full md:w-2/5 aspect-square relative"
					>
						<Image
							src={asset.image}
							alt={asset.name}
							className={`w-full h-full object-cover rounded-lg ${
								(!meetsFactoryLevel || !meetsTechRequirements || !canAfford || isQueueFull) &&
								'opacity-50'
							}`}
							width={100}
							height={100}
							aria-description={`Defense ${asset.name}`}
						/>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.5, delay: 0.2 }}
						className="flex flex-col gap-2 w-full md:w-3/5"
					>
						<CardTitle className="text-xl font-bold neon-text tracking-wide uppercase">
							{asset.name}
						</CardTitle>
						<p className="text-sm text-muted-foreground">{asset.description}</p>

						{isQueueFull && (
							<div className="flex items-center gap-2 text-red-400 text-sm">
								<AlertTriangle className="h-4 w-4" />
								<span>Build queue is full ({QUEUE_CAPACITY} max)</span>
							</div>
						)}

						{!meetsFactoryLevel && (
							<div className="flex items-center gap-2 text-red-400 text-sm">
								<Lock className="h-4 w-4" />
								<span>Requires Defense Factory Level {config.requirements.defense_factory_level}</span>
							</div>
						)}
						{!meetsTechRequirements && (
							<div className="flex flex-col gap-1">
								<div className="flex items-center gap-2 text-red-400 text-sm">
									<Lock className="h-4 w-4" />
									<span>Missing Technology Requirements:</span>
								</div>
								{config.requirements.technologies.map((req) => (
									<div key={req.id} className="flex items-center gap-2 text-red-400 text-xs ml-6">
										<span>
											• {req.id} Level {req.level}
										</span>
									</div>
								))}
							</div>
						)}

						<div className="grid grid-cols-3 gap-2 text-sm">
							<div className="flex items-center gap-2">
								<Swords className="h-4 w-4 text-red-400" />
								<span>Attack: {config.stats.attack_power}</span>
							</div>
							<div className="flex items-center gap-2">
								<Shield className="h-4 w-4 text-blue-400" />
								<span>Shield: {config.stats.shield}</span>
							</div>
							<div className="flex items-center gap-2">
								<Shield className="h-4 w-4 text-green-400" />
								<span>Defense: {config.stats.defense}</span>
							</div>
						</div>
						<div className="grid grid-cols-2 gap-2 mt-2">
							<div
								className={`flex items-center gap-2 ${
									state.currentResources.metal < config.cost.metal * buildAmount
										? 'text-red-400'
										: 'text-muted-foreground'
								}`}
							>
								<Hammer className="h-4 w-4" />
								<span>{config.cost.metal * buildAmount}</span>
							</div>
							<div
								className={`flex items-center gap-2 ${
									state.currentResources.deuterium < config.cost.deuterium * buildAmount
										? 'text-red-400'
										: 'text-muted-foreground'
								}`}
							>
								<Flame className="h-4 w-4" />
								<span>{config.cost.deuterium * buildAmount}</span>
							</div>
							<div
								className={`flex items-center gap-2 ${
									state.currentResources.microchips < config.cost.microchips * buildAmount
										? 'text-red-400'
										: 'text-muted-foreground'
								}`}
							>
								<Microchip className="h-4 w-4" />
								<span>{config.cost.microchips * buildAmount}</span>
							</div>
						</div>
						<div className="flex flex-col gap-4 mt-4">
							<div className="flex items-center gap-2 text-muted-foreground">
								<Clock className="h-4 w-4" />
								<span>Build Time: {buildTime > 0 ? formatTimerTime(buildTime) : '0s'}</span>
							</div>

							<div className="flex flex-col items-center gap-4">
								<div className="flex items-center gap-2 bg-black/30 rounded-lg p-2">
									<Button
										size="icon"
										variant="ghost"
										onClick={() => adjustAmount(-1)}
										disabled={buildAmount <= 1}
									>
										<Minus className="h-4 w-4" />
									</Button>
									<span className="w-12 text-center">{buildAmount}</span>
									<Button
										size="icon"
										variant="ghost"
										onClick={() => adjustAmount(1)}
										disabled={buildAmount >= maxPossibleDefenses}
									>
										<Plus className="h-4 w-4" />
									</Button>
								</div>
								<Button
									onClick={handleBuild}
									disabled={!meetsFactoryLevel || !meetsTechRequirements || !canAfford || isQueueFull}
									className="w-full max-w-[200px]"
								>
									Build Defense
								</Button>
							</div>
						</div>

						<div className="flex items-center gap-2 text-primary mb-2">
							<Shield className="h-4 w-4" />
							<span>Current Count: {currentCount}</span>
						</div>
					</motion.div>
				</CardHeader>
			</Card>
		</motion.div>
	);
}

function MobileCategories({ selectedCategory, setSelectedCategory }: any) {
	return (
		<div className="mb-6">
			<Select value={selectedCategory} onValueChange={setSelectedCategory}>
				<SelectTrigger className="w-full">
					<SelectValue placeholder="Select category" />
				</SelectTrigger>
				<SelectContent>
					{Object.entries(DEFENSE_CATEGORIES).map(([key, category]) => (
						<SelectItem key={key} value={key}>
							<div className="flex items-center gap-2">
								<FolderOpen className="h-4 w-4" />
								<span className="font-mono">{category.name}</span>
							</div>
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}

function DesktopCategories({ selectedCategory, setSelectedCategory }: any) {
	return (
		<div className="col-span-1 bg-black/50 p-4 rounded-lg border border-primary/30 h-[calc(100vh-12rem)]">
			<div className="font-mono text-sm space-y-2">
				<div className="text-primary/70 mb-4">{'>'} SELECT_CATEGORY:</div>
				{Object.entries(DEFENSE_CATEGORIES).map(([key, category]) => (
					<Button
						key={key}
						variant="ghost"
						className={`w-full justify-start ${selectedCategory === key ? 'bg-primary/20' : ''}`}
						onClick={() => setSelectedCategory(key)}
					>
						<FolderOpen className="mr-2 h-4 w-4" />
						<span className="font-mono">{category.name}</span>
						<ChevronRight className="ml-auto h-4 w-4" />
					</Button>
				))}
			</div>
		</div>
	);
}

function CurrentDefensesOverview({ planetDefenses }: { planetDefenses: Defense[] }) {
	const totalDefenses = _.sum(planetDefenses.map((d) => d.amount));

	// Calculate total defenses

	return (
		<Collapsible className="mb-6">
			<Card className="bg-black/30">
				<CardHeader className="p-4">
					<CollapsibleTrigger className="flex items-center justify-between w-full">
						<div>
							<h2 className="text-xl font-bold">Current Defenses</h2>
							<p className="text-sm text-muted-foreground">Total Defense Units: {totalDefenses}</p>
						</div>
						<ChevronDown className="h-5 w-5 transition-transform duration-200 collapsible-chevron" />
					</CollapsibleTrigger>
				</CardHeader>
			</Card>

			<CollapsibleContent>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
					{Object.entries(DEFENSE_ASSETS).map(([type, asset]) => {
						const entry = planetDefenses.find((d) => d.type === type);

						const count = entry?.amount || 0;
						if (count === 0) return null; // Only show defenses that exist
						return (
							<Card key={type} className="bg-black/30">
								<CardHeader className="p-4">
									<div className="flex items-center gap-4">
										<Image
											src={asset.image}
											alt={asset.name}
											width={64}
											height={64}
											className="rounded"
										/>
										<div>
											<h3 className="font-bold">{asset.name}</h3>
											<p className="text-sm text-muted-foreground">Count: {count}</p>
										</div>
									</div>
								</CardHeader>
							</Card>
						);
					})}
				</div>
			</CollapsibleContent>
		</Collapsible>
	);
}

export default function Defenses() {
	const { state } = useGame();
	const [selectedCategory, setSelectedCategory] = useState<string>('basic');
	const [queue, setQueue] = useState<DefenseQueue | null>(null);
	const [planetDefenses, setPlanetDefenses] = useState<Defense[]>([]);
	const isMobile = useMediaQuery('(max-width: 768px)');
	const [gridCols, setGridCols] = useState(() => {
		const saved = localStorage.getItem('defensesGridCols');
		return saved ? parseInt(saved) : 1;
	});

	const gridColsClass = {
		1: 'grid-cols-1',
		2: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2',
		3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3',
		4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
	}[gridCols];

	const updateGridCols = (cols: number) => {
		setGridCols(cols);
		localStorage.setItem('defensesGridCols', cols.toString());
	};

	useEffect(() => {
		if (!state.selectedPlanet) return;

		// Fetch current defenses
		const fetchDefenses = async () => {
			const { data } = await supabase
				.from('planet_defenses')
				.select('*')
				.eq('planet_id', state.selectedPlanet!.id)
				.single();

			if (data) {
				setPlanetDefenses(data.defenses);
			}
		};

		// Fetch queue (existing code)
		const fetchQueue = async () => {
			const { data } = await supabase
				.from('defense_queues')
				.select('*')
				.eq('planet_id', state.selectedPlanet!.id)
				.single();

			if (data) {
				setQueue(data as DefenseQueue);
			}
		};

		fetchDefenses();
		fetchQueue();

		// Subscribe to both defenses and queue changes
		const defenseSubscription = supabase
			.channel(`planet_defenses_${state.selectedPlanet.id}`)
			.on(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'planet_defenses',
					filter: `planet_id=eq.${state.selectedPlanet.id}`,
				},
				(payload) => {
					setPlanetDefenses((payload.new as PlanetDefenses).defenses);
				}
			)
			.subscribe();

		const queueSubscription = supabase
			.channel(`defense_queue_${state.selectedPlanet.id}`)
			.on(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'defense_queues',
					filter: `planet_id=eq.${state.selectedPlanet.id}`,
				},
				(payload) => {
					setQueue(payload.new as DefenseQueue);
				}
			)
			.subscribe();

		return () => {
			defenseSubscription.unsubscribe();
			queueSubscription.unsubscribe();
		};
	}, [state.selectedPlanet]);

	// Check if defense factory exists
	const hasDefenseFactory = state.planetStructures?.structures.some(
		(structure) => structure.type === 'defense_factory' && structure.level >= 1
	);

	if (!hasDefenseFactory) {
		return (
			<div className="flex flex-col items-center justify-center h-[80vh] space-y-6 text-center">
				<AlertTriangle className="w-16 h-16 text-red-500 animate-pulse" />
				<div className="space-y-2">
					<h2 className="text-2xl font-bold text-red-500">ACCESS DENIED</h2>
					<div className="font-mono text-sm text-muted-foreground max-w-md">
						<p className="mb-2">[ERROR CODE: NO_DEFENSE_FACTORY_DETECTED]</p>
						<p>Defense Factory required for planetary defense construction.</p>
						<p>Please construct a defense factory to access defense building capabilities.</p>
					</div>
				</div>
			</div>
		);
	}

	if (!state.planetStructures || !state.gameConfig) {
		return (
			<div className="flex items-center justify-center h-screen">
				<div className="text-center text-muted-foreground font-mono">
					<p>{'>'} LOADING DEFENSE SYSTEMS...</p>
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
							<Shield className="h-8 w-8" />
							PLANETARY DEFENSES
						</h1>
						<p className="text-muted-foreground">Construct and manage your planetary defense systems</p>
					</div>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" size="icon">
								<Grid className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={() => updateGridCols(1)}>
								<Grid className="mr-2 h-4 w-4" /> Single Column
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => updateGridCols(2)}>
								<Grid2x2 className="mr-2 h-4 w-4" /> Two Columns
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => updateGridCols(3)}>
								<Grid3x3 className="mr-2 h-4 w-4" /> Three Columns
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => updateGridCols(4)}>
								<Grid className="mr-2 h-4 w-4" /> Four Columns
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				{/* Current Defenses Overview */}
				<div className="mb-8">
					<h2 className="text-xl font-bold mb-4">Current Defenses</h2>
					<CurrentDefensesOverview planetDefenses={planetDefenses} />
				</div>

				{/* Categories and Defense Cards */}
				{isMobile && (
					<MobileCategories selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />
				)}

				<div className={`${isMobile ? '' : 'grid grid-cols-4 gap-6'}`}>
					{!isMobile && (
						<DesktopCategories
							selectedCategory={selectedCategory}
							setSelectedCategory={setSelectedCategory}
						/>
					)}

					<div className={`${isMobile ? 'w-full' : 'col-span-3'} h-[calc(100vh-12rem)]`}>
						<ScrollArea className="h-full pr-4">
							{/* Queue Display */}
							<QueueDisplay queue={queue} />

							{selectedCategory ? (
								<div className={`grid ${gridColsClass} gap-6`}>
									{DEFENSE_CATEGORIES[selectedCategory]!.types.map((type: DefenseType) => (
										<DefenseCard
											key={type}
											type={type}
											queue={queue}
											currentCount={planetDefenses.find((d) => d.type === type)?.amount || 0}
										/>
									))}
								</div>
							) : (
								<div className="text-center text-muted-foreground font-mono">
									<p>{'>'} SELECT A CATEGORY TO VIEW AVAILABLE DEFENSES</p>
								</div>
							)}
						</ScrollArea>
					</div>
				</div>
			</div>
		</ErrorBoundary>
	);
}
