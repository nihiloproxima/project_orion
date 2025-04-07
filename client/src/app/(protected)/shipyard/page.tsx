'use client';
import _ from 'lodash';
import {
	AlertTriangle,
	Anchor,
	ChevronRight,
	Clock,
	FolderOpen,
	Grid,
	Grid2x2,
	Grid3x3,
	Hammer,
	Lock,
	Microchip,
	Minus,
	Plus,
	Rocket,
	Shield,
	Ship,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '../../../components/ui/card';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import { useState } from 'react';

import { Button } from '../../../components/ui/button';
import { ErrorBoundary } from '../../../components/ErrorBoundary';
import Image from 'next/image';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { ShipType, ShipyardQueue } from 'shared-types';
import { Timer } from '../../../components/Timer';
import { api } from '../../../lib/api';
import utils from '../../../lib/utils';
import { motion } from 'framer-motion';
import { db } from '@/lib/firebase';
import { useGame } from '../../../contexts/GameContext';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { doc } from 'firebase/firestore';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { useTranslation } from '@/hooks/useTranslation';

const QUEUE_CAPACITY = 5;

const SHIP_CATEGORIES: Record<string, { name: string; description: string; types: ShipType[] }> = {
	civilian: {
		name: 'CIVILIAN_SHIPS',
		description: 'Non-combat vessels for logistics and expansion',
		types: ['colonizer', 'transporter'] as ShipType[],
	},
	military: {
		name: 'MILITARY_SHIPS',
		description: 'Combat vessels for warfare and defense',
		types: ['cruiser', 'destroyer', 'battleship', 'interceptor', 'death_star'] as ShipType[],
	},
	special: {
		name: 'SPECIAL_SHIPS',
		description: 'Specialized vessels for specific operations',
		types: ['spy_probe', 'recycler_ship'] as ShipType[],
	},
};

const SHIP_ASSETS: Record<ShipType, { name: string; image: string; description: string }> = {
	colonizer: {
		name: 'Colony Ship',
		image: `images/ships/colonizer.webp`,
		description: 'Required for expanding to new planets. Carries necessary equipment and initial colonists.',
	},
	transporter: {
		name: 'Transporter',
		image: `images/ships/transport_ship.webp`,
		description: 'Moves resources between planets. Various sizes available for different cargo capacities.',
	},
	spy_probe: {
		name: 'Spy Probe',
		image: `images/ships/spy_probe.webp`,
		description: 'Gathers intelligence on other planets. Can detect resource levels and structures.',
	},
	recycler: {
		name: 'Recycler',
		image: `images/ships/recycler_ship.webp`,
		description: 'Specialized for collecting debris after battles and mining asteroids.',
	},
	cruiser: {
		name: 'Cruiser',
		image: `images/ships/cruiser.webp`,
		description: 'Fast and powerful combat vessels. Excellent for both attack and defense.',
	},
	destroyer: {
		name: 'Destroyer',
		image: `images/ships/destroyer.webp`,
		description: 'Heavy-duty combat vessels with advanced weaponry and defense systems.',
	},
	battleship: {
		name: 'Battleship',
		image: `images/ships/battleship.webp`,
		description: 'Large and powerful warships for fleet engagements and planetary conquests.',
	},
	interceptor: {
		name: 'Interceptor',
		image: `images/ships/interceptor.webp`,
		description: 'Fast and agile combat vessels for quick engagements and evasion.',
	},
	death_star: {
		name: 'Death Star',
		image: `images/ships/death_star.webp`,
		description: 'The ultimate weapon of destruction, capable of leveling entire planets.',
	},
};

function QueueDisplay({ shipyardQueue }: { shipyardQueue: ShipyardQueue | null }) {
	if (!shipyardQueue || shipyardQueue.commands.length === 0) {
		return <div className="text-muted-foreground text-sm mb-6">No ships currently in production</div>;
	}

	return (
		<div className="mb-6">
			<h2 className="text-xl font-bold mb-4 flex items-center gap-2">
				Production Queue ({shipyardQueue.commands.length}/{shipyardQueue.capacity})
			</h2>
			<div className="grid gap-3">
				{shipyardQueue.commands.map((command, index) => {
					const asset = SHIP_ASSETS[command.ship_type];
					const isInProgress = index === 0;

					return (
						<Card key={index} className="bg-black/30">
							<CardHeader className="flex flex-row items-center p-4">
								<Image
									src={asset.image}
									alt={asset.name}
									width={100}
									height={100}
									className="w-12 h-12 rounded mr-4"
								/>
								<div className="flex-1">
									<div className="font-bold">{asset.name}</div>
									<div className="text-sm text-muted-foreground">
										Remaining ships: {command.count}
									</div>
								</div>
								<div className="flex items-center gap-2 text-primary">
									{isInProgress ? (
										<Timer
											startTime={command.current_item_start_time.toMillis()}
											finishTime={command.current_item_finish_time.toMillis()}
											showProgressBar={true}
										/>
									) : (
										<div className="text-sm">
											Starts in:{' '}
											{utils.formatTimerTime(
												(command.construction_start_time.toMillis() - Date.now()) / 1000
											)}
										</div>
									)}
								</div>
							</CardHeader>
						</Card>
					);
				})}
			</div>
		</div>
	);
}

function ShipCard({ type, shipyardQueue }: { type: ShipType; shipyardQueue: ShipyardQueue | null }) {
	const { state } = useGame();
	const [buildAmount, setBuildAmount] = useState(1);
	const asset = SHIP_ASSETS[type];
	const config = state.gameConfig!.ships.find((s) => s.type === type);

	if (!config) return null;

	// Check if requirements are met
	const meetStructuresRequirements = config.requirements
		.filter((req) => req.type === 'structure')
		.every((req) => {
			const structure = state.selectedPlanet?.structures.find((s) => s.type === req.id);
			return _.toInteger(structure?.level) >= _.toInteger(req.level);
		});
	const meetsTechRequirements = config.requirements
		.filter((req) => req.type === 'technology')
		.every((req: any) => state.userResearchs!.technologies[req.id]?.level >= req.level);

	if (!state.currentResources) return null;

	// Calculate max ships possible with current resources
	const maxShipsPerResource = {
		metal: Math.floor(state.currentResources.metal / config.construction.metal),
		microchips: Math.floor(state.currentResources.microchips / config.construction.microchips),
	};

	const maxPossibleShips = Math.min(...Object.values(maxShipsPerResource));

	const canAfford = buildAmount <= maxPossibleShips;

	// Calculate build time based on shipyard level and amount
	const baseTime = config.construction.seconds;
	const buildTime = baseTime * buildAmount;

	const isQueueFull = (shipyardQueue?.commands?.length || 0) >= (shipyardQueue?.capacity || 0);

	const handleBuild = async () => {
		if (!state.selectedPlanet?.id || isQueueFull) return;
		try {
			await api.buildShip(state.selectedPlanet.id, type, buildAmount);
		} catch (error) {
			console.error('Error building ship:', error);
		}
	};

	const adjustAmount = (delta: number) => {
		const newAmount = Math.max(1, Math.min(buildAmount + delta, maxPossibleShips));
		setBuildAmount(newAmount);
	};

	return (
		<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
			<Card
				className={`bg-card/50 backdrop-blur-sm transition-all duration-300 h-full flex flex-col ${
					meetStructuresRequirements && meetsTechRequirements && canAfford && !isQueueFull
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
								(!meetStructuresRequirements || !meetsTechRequirements || !canAfford || isQueueFull) &&
								'opacity-50'
							}`}
							width={100}
							height={100}
							aria-description={`Ship ${asset.name}`}
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

						{!meetStructuresRequirements && (
							<div className="flex items-center gap-2 text-red-400 text-sm">
								<Lock className="h-4 w-4" />
								<span>
									Requires Shipyard Level{' '}
									{config.requirements.find((req) => req.type === 'structure')?.level}
								</span>
							</div>
						)}

						{!meetsTechRequirements && (
							<div className="flex flex-col gap-1">
								<div className="flex items-center gap-2 text-red-400 text-sm">
									<Lock className="h-4 w-4" />
									<span>Missing Technology Requirements:</span>
								</div>
								{config.requirements
									.filter((req) => req.type === 'technology')
									.map((req: any) => (
										<div key={req.id} className="flex items-center gap-2 text-red-400 text-xs ml-6">
											<span>
												• {req.id} Level {req.level}
											</span>
										</div>
									))}
							</div>
						)}

						<div className="grid grid-cols-2 gap-2 text-sm">
							<div className="flex items-center gap-2">
								<Ship className="h-4 w-4 text-blue-400" />
								<span>Speed: {config.speed}</span>
							</div>
							<div className="flex items-center gap-2">
								<Shield className="h-4 w-4 text-green-400" />
								<span>Defense: {config.defense}</span>
							</div>
							<div className="flex items-center gap-2">
								<Rocket className="h-4 w-4 text-red-400" />
								<span>Attack: {config.attack}</span>
							</div>
							<div className="flex items-center gap-2">
								<Anchor className="h-4 w-4 text-yellow-400" />
								<span>Cargo: {config.capacity}</span>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-2 mt-2">
							<div
								className={`flex items-center gap-2 ${
									state.currentResources.metal < config.construction.metal * buildAmount
										? 'text-red-400'
										: 'text-muted-foreground'
								}`}
							>
								<Hammer className="h-4 w-4" />
								<span>{config.construction.metal * buildAmount}</span>
							</div>

							<div
								className={`flex items-center gap-2 ${
									state.currentResources.microchips < config.construction.microchips * buildAmount
										? 'text-red-400'
										: 'text-muted-foreground'
								}`}
							>
								<Microchip className="h-4 w-4" />
								<span>{config.construction.microchips * buildAmount}</span>
							</div>
						</div>

						<div className="flex flex-col gap-4 mt-4">
							<div className="flex items-center gap-2 text-muted-foreground">
								<Clock className="h-4 w-4" />
								<span>Build Time: {utils.formatTimerTime(buildTime)}</span>
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
										disabled={buildAmount >= maxPossibleShips}
									>
										<Plus className="h-4 w-4" />
									</Button>
								</div>
								<Button
									onClick={handleBuild}
									disabled={
										!meetStructuresRequirements ||
										!meetsTechRequirements ||
										!canAfford ||
										isQueueFull
									}
									className="w-full max-w-[200px]"
								>
									Build Ships
								</Button>
							</div>
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
					{Object.entries(SHIP_CATEGORIES).map(([key, category]) => (
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
				{Object.entries(SHIP_CATEGORIES).map(([key, category]) => (
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

export default function Shipyard() {
	const { state } = useGame();
	const { t } = useTranslation('shipyard');
	const [selectedCategory, setSelectedCategory] = useState<string>('civilian');
	const [shipyardQueue, shipyardQueueLoading] = useDocumentData<ShipyardQueue>(
		doc(
			db,
			`seasons/${state.gameConfig!.season.current}/planets/${state.selectedPlanet!.id}/private/shipyard_queue`
		) as any
	);
	const isMobile = useMediaQuery('(max-width: 768px)');
	const [gridCols, setGridCols] = useState(() => {
		const saved = localStorage.getItem('shipyardGridCols');
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
		localStorage.setItem('shipyardGridCols', cols.toString());
	};

	// Check if shipyard exists
	const hasShipyard = state.selectedPlanet?.structures.some(
		(structure) => structure.type === 'shipyard' && structure.level >= 1
	);

	if (!hasShipyard || (!shipyardQueue && !shipyardQueueLoading)) {
		return (
			<div className="min-h-screen bg-background cyber-grid flex items-center justify-center p-4">
				<div className="max-w-2xl w-full space-y-6 text-center">
					<div className="animate-pulse">
						<h2 className="text-4xl font-bold text-red-500 glitch-text">{t('no_shipyard.title')}</h2>
					</div>

					<div className="bg-black/50 backdrop-blur-sm border-red-500/50 border-2 p-8 rounded-lg space-y-4">
						<div className="text-xl text-red-400 font-mono">{t('no_shipyard.error_code')}</div>

						<div className="text-muted-foreground font-mono">
							<p>{t('no_shipyard.message')}</p>
							<p>{t('no_shipyard.action')}</p>
						</div>

						<div className="animate-blink text-yellow-500 font-mono mt-8">{t('no_shipyard.standby')}</div>
					</div>

					<div className="text-sm text-muted-foreground font-mono">{t('no_shipyard.error_code')}</div>
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
							<Ship className="h-8 w-8" />
							SHIPYARD
						</h1>
						<p className="text-muted-foreground">Construct and manage your fleet of spacecraft</p>
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

				{/* Mobile Categories */}
				{isMobile && (
					<MobileCategories selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />
				)}

				<div className={`${isMobile ? '' : 'grid grid-cols-4 gap-6'}`}>
					{/* Desktop Categories */}
					{!isMobile && (
						<DesktopCategories
							selectedCategory={selectedCategory}
							setSelectedCategory={setSelectedCategory}
						/>
					)}

					{/* Ship Cards Display */}
					<div className={`${isMobile ? 'w-full' : 'col-span-3'} h-[calc(100vh-12rem)]`}>
						<ScrollArea className="h-full pr-4">
							<QueueDisplay shipyardQueue={shipyardQueue!} />
							{selectedCategory ? (
								<div className={`grid ${gridColsClass} gap-6`}>
									{SHIP_CATEGORIES[selectedCategory]!.types.map((type: ShipType) => (
										<ShipCard key={type} type={type} shipyardQueue={shipyardQueue!} />
									))}
								</div>
							) : (
								<div className="text-center text-muted-foreground font-mono">
									<p>{'>'} SELECT A CATEGORY TO VIEW AVAILABLE SHIPS</p>
								</div>
							)}
						</ScrollArea>
					</div>
				</div>
			</div>
		</ErrorBoundary>
	);
}
