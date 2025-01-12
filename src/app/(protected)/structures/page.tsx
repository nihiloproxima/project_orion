'use client';

import { AlertTriangle, Building2, Flame, Grid, Grid2x2, Grid3x3, Hammer, Microchip } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import {
	StorageCapacities,
	calculateConstructionTime,
	calculateStructureEnergyConsumption,
	calculateStructureEnergyProduction,
	calculateStructureHourlyProduction,
	calculateStructureStorageCapacities,
	calculateUpgradeCost,
} from '@/utils/structures_calculations';
import { Structure, StructureType } from '../../../models/';

import { Button } from '../../../components/ui/button';
import { ErrorBoundary } from '../../../components/ErrorBoundary';
import Image from 'next/image';
import { LoadingScreen } from '@/components/LoadingScreen';
import { StructureConfig } from '@/models';
import { TECHNOLOGIES } from '@/lib/constants';
import { Timer } from '../../../components/Timer';
import { api } from '../../../lib/api';
import { formatTimerTime } from '@/lib/utils';
import { getPublicImageUrl } from '@/lib/images';
import millify from 'millify';
import { motion } from 'framer-motion';
import { useGame } from '../../../contexts/GameContext';
import { useState, useEffect } from 'react';

interface StructureInfo {
	type: StructureType;
	name: string;
	description: string;
	productionType: string;
	icon: React.ReactNode;
	hasStorage: boolean;
}

const STRUCTURE_INFO: Record<StructureType, StructureInfo> = {
	metal_mine: {
		type: 'metal_mine',
		name: 'Metal Mine',
		description: 'Mines and processes metal ore from planetary deposits. Each level increases metal production.',
		productionType: 'metal',
		icon: <Building2 className="h-5 w-5" />,
		hasStorage: false,
	},
	deuterium_synthesizer: {
		type: 'deuterium_synthesizer',
		name: 'Deuterium Synthesizer',
		description: 'Extracts hydrogen and synthesizes deuterium fuel. Each level increases deuterium production.',
		productionType: 'deuterium',
		icon: <Building2 className="h-5 w-5" />,
		hasStorage: false,
	},
	energy_plant: {
		type: 'energy_plant',
		name: 'Energy Plant',
		description: 'Generates power to fuel your planetary operations. Each level increases energy output.',
		productionType: 'energy',
		icon: <Building2 className="h-5 w-5" />,
		hasStorage: false,
	},
	research_lab: {
		type: 'research_lab',
		name: 'Research Laboratory',
		description: 'Conducts scientific research to unlock new technologies. Each level increases research speed.',
		productionType: 'none',
		icon: <Building2 className="h-5 w-5" />,
		hasStorage: false,
	},
	microchip_factory: {
		type: 'microchip_factory',
		name: 'Microchip Factory',
		description: 'Manufactures advanced microprocessors and circuitry. Each level increases microchip production.',
		productionType: 'microchips',
		icon: <Building2 className="h-5 w-5" />,
		hasStorage: false,
	},
	shipyard: {
		type: 'shipyard',
		name: 'Shipyard',
		description:
			'Builds and maintains your fleet of spacecraft. Each level unlocks new ship types and increases ship production speed.',
		productionType: 'none',
		icon: <Building2 className="h-5 w-5" />,
		hasStorage: false,
	},
	defense_factory: {
		type: 'defense_factory',
		name: 'Defense Factory',
		description:
			'Manufactures planetary defense systems and weaponry. Each level reduces defense construction time and unlocks new defense types.',
		productionType: 'none',
		icon: <Building2 className="h-5 w-5" />,
		hasStorage: false,
	},
	metal_hangar: {
		type: 'metal_hangar',
		name: 'Metal Hangar',
		description: 'Large-scale storage facility for processed metal. Each level increases metal storage capacity.',
		productionType: 'metal',
		icon: <Building2 className="h-5 w-5" />,
		hasStorage: true,
	},
	deuterium_tank: {
		type: 'deuterium_tank',
		name: 'Deuterium Tank',
		description:
			'Pressurized storage facility for deuterium fuel. Each level increases deuterium storage capacity.',
		productionType: 'deuterium',
		icon: <Building2 className="h-5 w-5" />,
		hasStorage: true,
	},
	microchip_vault: {
		type: 'microchip_vault',
		name: 'Microchip Vault',
		description:
			'Secure storage facility for sensitive microelectronics. Each level increases microchip storage capacity.',
		productionType: 'microchips',
		icon: <Building2 className="h-5 w-5" />,
		hasStorage: true,
	},
};

function StructureCard({ structure }: { structure: Structure }) {
	const { state } = useGame();

	useEffect(() => {
		if (structure.is_under_construction && structure.construction_finish_time) {
			const finishTime = new Date(structure.construction_finish_time).getTime();
			const now = Date.now();

			if (finishTime < now - 5000) {
				api.structures.resolvePendingConstructions(state.selectedPlanet!.id).catch(console.error);
			}
		}
	}, [structure, state.selectedPlanet]);

	if (!state.currentResources || !state.gameConfig || !state.planetStructures || !state.userResearchs) {
		return <LoadingScreen message="Loading structures..." />;
	}

	const onUpgrade = async (structure: Structure) => {
		try {
			await api.structures.startConstruction(state.selectedPlanet!.id, structure.type);
		} catch (error) {
			console.error('Error upgrading structure:', error);
		}
	};

	const structureConfig = state.gameConfig!.structures.find((s) => s.type === structure.type);
	const info = STRUCTURE_INFO[structure.type];

	const currentHourlyProduction = calculateStructureHourlyProduction(
		state.gameConfig!,
		state.userResearchs!,
		structure.type,
		structure.level
	);
	const futureHourlyProduction = calculateStructureHourlyProduction(
		state.gameConfig!,
		state.userResearchs!,
		structure.type,
		structure.level + 1
	);
	const upgradeCost = calculateUpgradeCost(state.gameConfig!, structure.type, structure.level);
	const upgradeTime = calculateConstructionTime(
		state.gameConfig!,
		state.userResearchs!,
		structure.type,
		structure.level
	);

	const energyConsumption = calculateStructureEnergyConsumption(state.gameConfig!, structure.type, structure.level);
	const futureEnergyConsumption = calculateStructureEnergyConsumption(
		state.gameConfig!,
		structure.type,
		structure.level + 1
	);

	const currentEnergyProduction = calculateStructureEnergyProduction(
		state.gameConfig!,
		state.userResearchs!,
		structure.type,
		structure.level
	);
	const futureEnergyProduction = calculateStructureEnergyProduction(
		state.gameConfig!,
		state.userResearchs!,
		structure.type,
		structure.level + 1
	);

	const storageCapacities = calculateStructureStorageCapacities(state.gameConfig!, structure.type, structure.level);

	const futureEnergyRatio =
		(state.currentResources.energy_production - currentEnergyProduction + futureEnergyProduction) /
		(state.currentResources.energy_consumption - energyConsumption + futureEnergyConsumption);
	const currentEnergyRatio = state.currentResources.energy_production / state.currentResources.energy_consumption;

	// Skip rendering if structure has no production and no storage
	return (
		<Card className="bg-card/50 backdrop-blur-sm neon-border hover:shadow-[0_0_20px_rgba(32,224,160,0.3)] transition-all duration-300">
			<CardHeader className="flex flex-row items-start gap-6 pb-2">
				<motion.div
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.5 }}
					className="w-2/5 aspect-square"
				>
					<Image
						src={getPublicImageUrl('structures', info.type + '.webp')}
						alt={info.name}
						width={100}
						height={100}
						className="w-full h-full object-cover rounded-lg"
					/>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, x: 20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.5, delay: 0.2 }}
					className="flex flex-col gap-2 w-3/5"
				>
					<CardTitle className="text-xl font-bold neon-text tracking-wide uppercase hover:scale-105 transition-transform">
						{info.name}
					</CardTitle>

					<p className="text-sm text-muted-foreground">{info.description}</p>

					{structure && (info.productionType !== 'none' || info.hasStorage) && (
						<div className="text-sm text-primary/70 font-medium">
							{structureConfig?.production.resource && (
								<div className="flex items-center gap-2">
									<span
										className={
											state.currentResources.energy_production <
											state.currentResources.energy_consumption
												? 'text-red-400'
												: ''
										}
									>
										Production:{' '}
										{info.type === 'energy_plant'
											? currentEnergyProduction
											: millify(currentHourlyProduction.amount)}
										{info.type === 'energy_plant' ? (
											` ${info.productionType}`
										) : (
											<span className="text-muted-foreground">/h</span>
										)}
									</span>
									{structure && (
										<>
											<span className="text-muted-foreground">→</span>
											<span
												className={futureEnergyRatio < 1 ? 'text-red-400' : 'text-emerald-400'}
											>
												{info.type === 'energy_plant'
													? futureEnergyProduction
													: millify(futureHourlyProduction.amount)}
												{info.type === 'energy_plant' ? (
													` ${info.productionType}`
												) : (
													<span className="text-muted-foreground">/h</span>
												)}
											</span>
										</>
									)}
								</div>
							)}
							{info.hasStorage && (
								<div className="flex items-center gap-2">
									<span>
										Storage:{' '}
										{millify(
											storageCapacities[
												structureConfig?.storage.resource as keyof StorageCapacities
											] || 0
										)}
									</span>
									{!structure.is_under_construction && (
										<>
											<span className="text-muted-foreground">→</span>
											<span className="text-emerald-400">
												{millify(
													calculateStructureStorageCapacities(
														state.gameConfig!,
														structure.type,
														structure.level + 1
													)[info.productionType as keyof StorageCapacities] || 0
												)}
											</span>
										</>
									)}
								</div>
							)}
							{energyConsumption !== 0 && (
								<div className="flex items-center gap-2">
									<span className="text-violet-400/70">
										Energy:{' '}
										{energyConsumption > 10000 ? millify(energyConsumption) : energyConsumption}
									</span>
									{structure && !structure.is_under_construction && (
										<>
											<span className="text-muted-foreground">→</span>
											<span className="text-violet-400/70">
												{futureEnergyConsumption > 10000
													? millify(futureEnergyConsumption)
													: futureEnergyConsumption}
											</span>
										</>
									)}
								</div>
							)}
						</div>
					)}
				</motion.div>
			</CardHeader>

			<CardContent className="space-y-4 pt-4 border-t border-primary/20">
				<StructureContent
					structure={structure}
					info={info}
					upgradeCosts={upgradeCost}
					upgradeTime={upgradeTime}
					onUpgrade={onUpgrade}
					futureEnergyRatio={futureEnergyRatio}
					currentEnergyRatio={currentEnergyRatio}
					config={structureConfig!}
					energyConsumption={energyConsumption}
				/>
			</CardContent>
		</Card>
	);
}

interface StructureContentProps {
	structure: Structure;
	info: StructureInfo;
	upgradeCosts: {
		metal: number;
		deuterium: number;
		microchips: number;
	};
	upgradeTime: number;
	onUpgrade: (structure: Structure) => void;
	futureEnergyRatio: number;
	currentEnergyRatio: number;
	config: StructureConfig;
	energyConsumption: number;
}

function StructureContent({
	structure,
	info,
	upgradeCosts,
	upgradeTime,
	onUpgrade,
	currentEnergyRatio,
	futureEnergyRatio,
	config,
	energyConsumption,
}: StructureContentProps) {
	const { state } = useGame();

	const canAfford =
		state.currentResources!.metal >= upgradeCosts.metal &&
		state.currentResources!.deuterium >= upgradeCosts.deuterium &&
		state.currentResources!.microchips >= upgradeCosts.microchips;

	// Only check prerequisites if structure is level 0
	let prerequisitesMet = true;
	if (structure.level === 0) {
		for (const prereq of config.prerequisites.structures) {
			const existingStructure = state.planetStructures?.structures.find((s) => s.type === prereq.type);
			if (!existingStructure || existingStructure.level < prereq.level) {
				prerequisitesMet = false;
				break;
			}
		}

		for (const prereq of config.prerequisites.technologies) {
			const tech = state.userResearchs?.technologies[prereq.id];
			if (!tech || tech.level < prereq.level) {
				prerequisitesMet = false;
				break;
			}
		}
	}

	const handleUpgrade = async () => {
		try {
			await onUpgrade(structure);
		} catch (error) {
			console.error('Error upgrading structure:', error);
		}
	};

	if (structure.is_under_construction) {
		return (
			<div className="space-y-4">
				<div className="text-sm text-primary/70">Level {structure.level} - Under Construction</div>
				<Timer
					startTime={structure.construction_start_time!}
					finishTime={structure.construction_finish_time!}
					variant="primary"
				/>
			</div>
		);
	}

	const getPrerequisitesMessage = () => {
		if (structure.level > 0) return '';

		const missingStructures = config.prerequisites.structures
			.filter((prereq) => {
				const structure = state.planetStructures?.structures.find((s) => s.type === prereq.type);
				return !structure || structure.level < prereq.level;
			})
			.map((prereq) => `${STRUCTURE_INFO[prereq.type as StructureType].name} Level ${prereq.level}`);

		const missingTechnologies = config.prerequisites.technologies
			.filter((prereq) => {
				const tech = state.userResearchs?.technologies[prereq.id];
				return !tech || tech.level < prereq.level;
			})
			.map((prereq) => `${TECHNOLOGIES[prereq.id].name} Level ${prereq.level}`);

		const missing = [...missingStructures, ...missingTechnologies];
		return missing.length > 0 ? `Required: ${missing.join(', ')}` : '';
	};

	return (
		<div className="space-y-4">
			<div className="text-sm text-primary/70">Level {structure.level}</div>

			<div className="space-y-2">
				<div className="text-sm font-medium">{structure.level === 0 ? 'Construction' : 'Upgrade'} Costs:</div>
				<div className="grid grid-cols-2 gap-2 text-sm">
					{upgradeCosts.metal > 0 && (
						<div
							className={`flex items-center gap-2 ${
								state.currentResources!.metal < upgradeCosts.metal ? 'text-red-500' : 'text-secondary'
							}`}
						>
							<Hammer className="h-4 w-4" />
							<span>{Math.floor(upgradeCosts.metal)}</span>
						</div>
					)}
					{upgradeCosts.deuterium > 0 && (
						<div
							className={`flex items-center gap-2 ${
								state.currentResources!.deuterium < upgradeCosts.deuterium
									? 'text-red-500'
									: 'text-primary'
							}`}
						>
							<Flame className="h-4 w-4" />
							<span>{Math.floor(upgradeCosts.deuterium)}</span>
						</div>
					)}
					{upgradeCosts.microchips > 0 && (
						<div
							className={`flex items-center gap-2 ${
								state.currentResources!.microchips < upgradeCosts.microchips
									? 'text-red-500'
									: 'text-accent'
							}`}
						>
							<Microchip className="h-4 w-4" />
							<span>{Math.floor(upgradeCosts.microchips)}</span>
						</div>
					)}
				</div>
			</div>

			<div className="text-sm">Construction Time: {formatTimerTime(upgradeTime / 1000)}</div>

			{structure.level === 0 && (
				<div className="text-sm text-violet-400/70">
					Energy {info.type === 'energy_plant' ? 'Production' : 'Consumption'}:{' '}
					{info.type === 'energy_plant' ? -energyConsumption : energyConsumption}
				</div>
			)}

			{!prerequisitesMet && (
				<div className="text-sm text-red-400 flex items-center gap-2">
					<AlertTriangle className="h-4 w-4" />
					<span>{getPrerequisitesMessage()}</span>
				</div>
			)}

			{/* Energy ratio warnings */}
			{futureEnergyRatio < currentEnergyRatio && futureEnergyRatio < 1 ? (
				<div className="text-sm text-amber-400">
					Warning: This will result in an energy ratio of {futureEnergyRatio.toFixed(2)}, reducing production
					efficiency
				</div>
			) : futureEnergyRatio > currentEnergyRatio ? (
				<div className="text-sm text-emerald-400">
					This will improve energy ratio from {currentEnergyRatio.toFixed(2)} to{' '}
					{futureEnergyRatio.toFixed(2)}
					{futureEnergyRatio >= 1 && currentEnergyRatio < 1
						? ', restoring full production efficiency'
						: ', which have no effect on production efficiency'}
				</div>
			) : null}

			<Button
				onClick={handleUpgrade}
				disabled={!canAfford || !prerequisitesMet}
				className={`w-full px-4 py-2 rounded-lg font-medium transition-colors border ${
					!canAfford || !prerequisitesMet
						? 'bg-gray-800/50 text-gray-500 border-gray-700 cursor-not-allowed'
						: 'bg-primary/20 hover:bg-primary/30 text-primary border-primary/50 hover:border-primary/80 neon-border'
				}`}
			>
				{!prerequisitesMet
					? 'Prerequisites Not Met'
					: !canAfford
					? 'Not Enough Resources'
					: structure.level === 0
					? 'Construct'
					: `Upgrade to Level ${structure.level + 1}`}
			</Button>
		</div>
	);
}

export default function Structures() {
	const { state } = useGame();
	const [gridCols, setGridCols] = useState(() => {
		const saved = localStorage.getItem('structuresGridCols');
		return saved ? parseInt(saved) : 2;
	});

	const gridColsClass = {
		1: 'grid-cols-1',
		2: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2',
		3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3',
		4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
	}[gridCols];

	const updateGridCols = (cols: number) => {
		setGridCols(cols);
		localStorage.setItem('structuresGridCols', cols.toString());
	};

	if (!state.planetStructures || !state.gameConfig) {
		return <LoadingScreen message="Loading structures..." />;
	}

	return (
		<ErrorBoundary>
			<div className="space-y-6">
				<div className="flex justify-between items-center">
					<div>
						<h1 className="text-3xl font-bold neon-text mb-2">PLANETARY STRUCTURES</h1>
						<p className="text-muted-foreground">Manage and upgrade your planetary infrastructure</p>
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

				<div className={`grid ${gridColsClass} gap-6`}>
					{state.planetStructures.structures.map((structure) => (
						<StructureCard key={structure.type} structure={structure} />
					))}
				</div>
			</div>
		</ErrorBoundary>
	);
}
