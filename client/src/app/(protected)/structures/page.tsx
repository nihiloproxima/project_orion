'use client';
import _ from 'lodash';
import { AlertTriangle, Grid, Grid2x2, Grid3x3, Hammer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';

import { Structure, StructureType } from 'shared-types';

import { Button } from '../../../components/ui/button';
import { ErrorBoundary } from '../../../components/ErrorBoundary';
import Image from 'next/image';
import { LoadingScreen } from '@/components/LoadingScreen';
import { StructureConfig } from 'shared-types';
import { STRUCTURE_INFO, TECHNOLOGIES } from '@/lib/constants';
import { Timer } from '../../../components/Timer';
import { api } from '../../../lib/api';
import utils from '@/lib/utils';
import millify from 'millify';
import { motion } from 'framer-motion';
import { useGame } from '../../../contexts/GameContext';
import { useEffect, useState } from 'react';
import structuresCalculations from '@/utils/structures_calculations';
import { useTranslation } from '@/hooks/useTranslation';

function StructureCard({ structure }: { structure: Structure }) {
	const { state } = useGame();
	const { t } = useTranslation('structures');
	const [selectedLevels, setSelectedLevels] = useState(1);

	if (!state.currentResources || !state.gameConfig || !state.userResearchs || !state.selectedPlanet) {
		return <LoadingScreen message={t('loading')} />;
	}

	const onUpgrade = async (structure: Structure, amount: number = 1) => {
		try {
			await api.upgradeStructure(state.selectedPlanet!.id, structure.type, amount);
		} catch (error) {
			console.error('Error upgrading structure:', error);
		}
	};

	const structureConfig = utils.getStructureConfig(state.gameConfig!, structure.type);
	if (!structureConfig) {
		console.error(`Structure config not found for type: ${structure.type}`);
		return null;
	}

	const info = STRUCTURE_INFO[structure.type];

	const currentHourlyProduction = structuresCalculations.structureHourlyProduction({
		gameConfig: state.gameConfig!,
		planet: state.selectedPlanet!,
		userResearchs: state.userResearchs!,
		structureType: structure.type,
		structureLevel: structure.level,
	});

	const futureHourlyProduction = structuresCalculations.structureHourlyProduction({
		gameConfig: state.gameConfig!,
		planet: state.selectedPlanet!,
		userResearchs: state.userResearchs!,
		structureType: structure.type,
		structureLevel: structure.level + selectedLevels,
	});

	const energyConsumption = structuresCalculations.structureEnergyConsumption({
		gameConfig: state.gameConfig!,
		structureType: structure.type,
		structureLevel: structure.level,
	});
	const futureEnergyConsumption = Math.floor(
		structuresCalculations.structureEnergyConsumption({
			gameConfig: state.gameConfig!,
			structureType: structure.type,
			structureLevel: structure.level + selectedLevels,
		})
	);

	const currentEnergyProduction = Math.floor(
		structuresCalculations.structureEnergyProduction({
			gameConfig: state.gameConfig!,
			planet: state.selectedPlanet!,
			userResearchs: state.userResearchs!,
			structureType: structure.type,
			structureLevel: structure.level,
		})
	);

	const futureEnergyProduction = Math.floor(
		structuresCalculations.structureEnergyProduction({
			gameConfig: state.gameConfig!,
			planet: state.selectedPlanet!,
			userResearchs: state.userResearchs!,
			structureType: structure.type,
			structureLevel: structure.level + selectedLevels,
		})
	);

	const storageCapacities = structuresCalculations.structureStorageCapacities({
		gameConfig: state.gameConfig!,
		structureType: structure.type,
		structureLevel: structure.level,
	});

	const futureStorageCapacities = structuresCalculations.structureStorageCapacities({
		gameConfig: state.gameConfig!,
		structureType: structure.type,
		structureLevel: structure.level + selectedLevels,
	});

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
						src={`/images/structures/${info.type}.webp`}
						alt={info.nameKey}
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
						{t(info.nameKey)}
					</CardTitle>

					<p className="text-sm text-muted-foreground">{t(info.descriptionKey)}</p>

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
											<span className={'text-emerald-400'}>
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
							{info.hasStorage && storageCapacities && futureStorageCapacities && (
								<div className="flex items-center gap-2">
									<span>Storage: {millify(storageCapacities.capacity)}</span>

									<span className="text-muted-foreground">→</span>
									<span className="text-emerald-400">
										{millify(futureStorageCapacities.capacity)}
									</span>
								</div>
							)}
							{energyConsumption !== 0 && (
								<div className="flex items-center gap-2">
									<span className="text-violet-400/70">
										Energy:{' '}
										{energyConsumption > 10000 ? millify(energyConsumption) : energyConsumption}
									</span>
									{structure && (
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
					onUpgrade={onUpgrade}
					config={structureConfig!}
					energyConsumption={energyConsumption}
					selectedLevels={selectedLevels}
					setSelectedLevels={setSelectedLevels}
				/>
			</CardContent>
		</Card>
	);
}

function StructureContent({
	structure,
	onUpgrade,
	config,
	energyConsumption,
	selectedLevels,
	setSelectedLevels,
}: {
	structure: Structure;
	info: (typeof STRUCTURE_INFO)[StructureType];
	onUpgrade: (structure: Structure, amount: number) => Promise<void>;
	config: StructureConfig;
	energyConsumption: number;
	selectedLevels: number;
	setSelectedLevels: React.Dispatch<React.SetStateAction<number>>;
}) {
	const { state } = useGame();
	const { t } = useTranslation('structures');
	const [maxAffordableLevels, setMaxAffordableLevels] = useState(0);

	const calculateMultiLevelCosts = (levels: number) => {
		if (!state.gameConfig) return { cost: 0, time: 0 };

		const structureConfig = utils.getStructureConfig(state.gameConfig, structure.type);
		if (!structureConfig) return { cost: 0, time: 0 };

		const targetLevels = _.range(structure.level + 1, structure.level + levels + 1);
		const metalCost = targetLevels.reduce((total: number, targetLevel: number) => {
			return (
				total +
				structuresCalculations.upgradeStructureCost({
					base: structureConfig.cost.base,
					per_level: structureConfig.cost.per_level,
					power: structureConfig.cost.power,
					level: targetLevel,
					reductionCoef: 1,
				})
			);
		}, 0);

		const totalTime = config.construction_time.seconds * levels;

		return { cost: metalCost, time: totalTime };
	};

	useEffect(() => {
		if (!state.currentResources) return;

		let levels = 0;
		while (true) {
			if (levels >= 10000) break;

			const { cost } = calculateMultiLevelCosts(levels + 1);
			if (cost > state.currentResources.metal) break;
			levels++;
		}

		setMaxAffordableLevels(levels);
	}, [state.currentResources]);

	const { cost: multiLevelCost, time: multiLevelTime } = calculateMultiLevelCosts(selectedLevels);
	const canAfford = state.currentResources!.metal >= multiLevelCost;

	// Only check prerequisites if structure is level 0
	let prerequisitesMet = true;
	if (structure.level === 0) {
		for (const prereq of config.prerequisites.structures) {
			const existingStructure = state.selectedPlanet?.structures.find((s) => s.type === prereq.type);
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

	const isMaxLevel = config.max_level !== null && structure.level >= config.max_level;

	const handleUpgradeClick = (levels: number) => {
		setSelectedLevels(Math.min(levels, maxAffordableLevels));
	};

	const handleConfirmUpgrade = async () => {
		try {
			await onUpgrade(structure, selectedLevels);

			setSelectedLevels(1);
		} catch (error) {
			console.error('Error upgrading structure:', error);
		}
	};

	if (structure.construction_start_time) {
		return (
			<div className="space-y-4">
				<div className="text-sm text-primary/70">
					{t('card.level')} {structure.level} - {t('card.under_construction')}
				</div>
				<Timer
					startTime={structure.construction_start_time!.toMillis()}
					finishTime={structure.construction_finish_time!.toMillis()}
					variant="primary"
				/>
			</div>
		);
	}

	const getPrerequisitesMessage = () => {
		if (structure.level > 0) return '';

		const missingStructures = config.prerequisites.structures
			.filter((prereq) => {
				const structure = state.selectedPlanet?.structures.find((s) => s.type === prereq.type);
				return !structure || structure.level < prereq.level;
			})
			.map(
				(prereq) =>
					`${t(STRUCTURE_INFO[prereq.type as StructureType].nameKey)} ${t('card.level')} ${prereq.level}`
			);

		const missingTechnologies = config.prerequisites.technologies
			.filter((prereq) => {
				const tech = state.userResearchs?.technologies[prereq.id];
				return !tech || tech.level < prereq.level;
			})
			.map((prereq) => `${TECHNOLOGIES[prereq.id].nameKey} ${t('card.level')} ${prereq.level}`);

		const missing = [...missingStructures, ...missingTechnologies];
		return missing.length > 0 ? `${t('card.prerequisites.required')}: ${missing.join(', ')}` : '';
	};

	return (
		<div className="space-y-4">
			<div className="text-sm text-primary/70">
				{t('card.level')} {structure.level}
				{config.max_level && <span> / {config.max_level}</span>}
			</div>

			<div className="space-y-2">
				<div className="text-sm font-medium">
					{structure.level === 0 ? t('card.construction') : t('card.upgrade_costs')}
					{selectedLevels > 1 ? ` (${selectedLevels} ${t('card.levels')})` : ''}:
				</div>
				<div className="grid grid-cols-2 gap-2 text-sm">
					{multiLevelCost >= 0 && (
						<div className={`flex items-center gap-2 ${!canAfford ? 'text-red-500' : 'text-secondary'}`}>
							<Hammer className="h-4 w-4" />
							<span>{multiLevelCost}</span>
						</div>
					)}
				</div>
			</div>

			<div className="text-sm">
				{t('card.construction_time')}: {utils.formatTimerTime(multiLevelTime)}
			</div>

			{structure.level === 0 && (
				<div className="text-sm text-violet-400/70">
					{t('card.energy.consumption')}: {energyConsumption}
				</div>
			)}

			{!prerequisitesMet && (
				<div className="text-sm text-red-400 flex items-center gap-2">
					<AlertTriangle className="h-4 w-4" />
					<span>{getPrerequisitesMessage()}</span>
				</div>
			)}

			{isMaxLevel && (
				<div className="text-sm text-amber-400 flex items-center gap-2">
					<AlertTriangle className="h-4 w-4" />
					<span>{t('card.max_level_reached')}</span>
				</div>
			)}

			<div className="flex gap-2">
				{_.uniq([1, 10, maxAffordableLevels].filter((n) => n <= maxAffordableLevels && n > 0)).map((n) => (
					<Button
						key={n}
						onClick={() => handleUpgradeClick(_.isNumber(n) ? n : maxAffordableLevels)}
						disabled={!prerequisitesMet || isMaxLevel}
						className={`flex-1 transition-all duration-200 border ${
							selectedLevels === n
								? 'bg-primary/30 border-primary text-primary hover:bg-primary/40'
								: 'bg-background/80 hover:bg-background/90 border-primary/30 text-primary/80 hover:text-primary'
						}`}
					>
						+{n}
					</Button>
				))}
			</div>

			<Button
				onClick={handleConfirmUpgrade}
				disabled={!canAfford || !prerequisitesMet || isMaxLevel}
				className={`w-full px-4 py-2 rounded-lg font-medium transition-colors border ${
					!canAfford || !prerequisitesMet || isMaxLevel
						? 'bg-gray-800/50 text-gray-500 border-gray-700 cursor-not-allowed'
						: 'bg-primary/20 hover:bg-primary/30 text-primary border-primary/50 hover:border-primary/80 neon-border'
				}`}
			>
				{!prerequisitesMet
					? t('card.button.prerequisites_not_met')
					: !canAfford
					? t('card.button.not_enough_resources')
					: isMaxLevel
					? t('card.button.max_level_reached')
					: `${t('card.button.confirm_upgrade')} (${selectedLevels} ${
							selectedLevels === 1 ? t('card.button.level') : t('card.button.levels')
					  })`}
			</Button>
		</div>
	);
}

export default function Structures() {
	const { state } = useGame();
	const { t } = useTranslation('structures');
	const [gridCols, setGridCols] = useState(() => {
		if (typeof window !== 'undefined') {
			const saved = localStorage.getItem('structuresGridCols');
			return saved ? parseInt(saved) : 2;
		}
		return 2;
	});

	const currentEnergyRatio =
		state.currentResources?.energy_production && state.currentResources?.energy_consumption
			? state.currentResources.energy_production / state.currentResources.energy_consumption
			: 1;

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

	if (!state.selectedPlanet || !state.gameConfig) {
		return <LoadingScreen message={t('loading')} />;
	}

	return (
		<ErrorBoundary>
			<div className="space-y-6">
				<div className="flex justify-between items-center">
					<div>
						<h1 className="text-3xl font-bold neon-text mb-2">{t('title')}</h1>
						<p className="text-muted-foreground">{t('subtitle')}</p>
					</div>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" size="icon">
								<Grid className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={() => updateGridCols(1)}>
								<Grid className="mr-2 h-4 w-4" /> {t('grid_view.single')}
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => updateGridCols(2)}>
								<Grid2x2 className="mr-2 h-4 w-4" /> {t('grid_view.two')}
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => updateGridCols(3)}>
								<Grid3x3 className="mr-2 h-4 w-4" /> {t('grid_view.three')}
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => updateGridCols(4)}>
								<Grid className="mr-2 h-4 w-4" /> {t('grid_view.four')}
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				{currentEnergyRatio < 1 && (
					<div className="flex items-center gap-2 p-4 border rounded-lg bg-yellow-500/10 border-yellow-500/50">
						<AlertTriangle className="h-5 w-5 text-yellow-500" />
						<div className="flex flex-col">
							<p className="text-sm text-yellow-500">{t('energy_warning.title')}</p>
							<p className="text-sm text-muted-foreground">{t('energy_warning.subtitle')}</p>
						</div>
					</div>
				)}

				<div className={`grid ${gridColsClass} gap-6`}>
					{state.selectedPlanet?.structures.map((structure) => (
						<StructureCard key={structure.type} structure={structure} />
					))}
				</div>
			</div>
		</ErrorBoundary>
	);
}
