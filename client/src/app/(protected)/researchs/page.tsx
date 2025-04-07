'use client';

import {
	Beaker,
	Clock,
	Flame,
	FolderTree,
	Grid,
	Grid2x2,
	Grid3x3,
	Hammer,
	Lock,
	Microchip,
	Shield,
	Ship,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../components/ui/tooltip';

import { Button } from '../../../components/ui/button';
import { ErrorBoundary } from '../../../components/ErrorBoundary';
import Image from 'next/image';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ResearchConfig, TechnologyId, Technology } from 'shared-types';
import { TECHNOLOGIES } from '../../../lib/constants';
import { Timer } from '../../../components/Timer';
import { api } from '../../../lib/api';
import researchsCalculations from '@/utils/researchs_calculations';
import { motion } from 'framer-motion';
import { useGame } from '../../../contexts/GameContext';
import { useState } from 'react';
import utils from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';

interface ResearchCardProps {
	id: TechnologyId;
	config: ResearchConfig;
	tech: Technology;
	onStartResearch: (id: TechnologyId) => void;
	canStartNewResearch: boolean;
	isPlanetResearching: boolean;
	researchCapacityInfo: {
		current: number;
		max: number;
	};
}

function ResearchCard({
	id,
	config,
	tech,
	onStartResearch,
	canStartNewResearch,
	isPlanetResearching,
	researchCapacityInfo,
}: ResearchCardProps) {
	const { state } = useGame();
	const { t } = useTranslation('technologies');
	const { t: tResearchs } = useTranslation('researchs');

	if (!state.currentResources) return null;

	const assetConfig = TECHNOLOGIES[id as keyof typeof TECHNOLOGIES];
	const costMultiplier = Math.pow(2, tech.level);
	const researchTime = researchsCalculations.calculateResearchTimeMs(state.gameConfig!, state.userResearchs!, id);

	const costs = {
		metal: config.cost.base_metal * costMultiplier,
		deuterium: config.cost.base_deuterium * costMultiplier,
		microchips: config.cost.base_microchips * costMultiplier,
	};

	const hasEnoughResources =
		state.currentResources.metal >= costs.metal &&
		state.currentResources.deuterium >= costs.deuterium &&
		state.currentResources.microchips >= costs.microchips;

	const prerequisitesMet =
		!config.prerequisites ||
		config.prerequisites.every(
			(prereq) => (state.userResearchs?.technologies[prereq.technology_id]?.level || 0) >= prereq.required_level
		);

	const getButtonText = () => {
		if (tech.level >= config.max_level) return tResearchs('card.button.max_level');
		if (tech.is_researching) return tResearchs('card.button.researching');
		if (isPlanetResearching) return tResearchs('card.button.planet_researching');
		if (!canStartNewResearch && researchCapacityInfo.current >= researchCapacityInfo.max) {
			return tResearchs('card.button.capacity_reached');
		}
		if (!prerequisitesMet) return tResearchs('card.button.prerequisites_not_met');
		if (!hasEnoughResources) return tResearchs('card.button.resources');
		return tResearchs('card.button.research');
	};

	const getEffectDescription = () => {
		let description = t(assetConfig?.descriptionKey);

		config.effects.forEach((effect) => {
			if (effect.per_level) {
				if (effect.type === 'resource_boost') {
					description += ` Each level increases ${effect.resource_type} production by ${effect.value}%.`;
				}
			}
		});

		return description;
	};

	return (
		<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
			<Card
				className={`bg-card/50 backdrop-blur-sm transition-all duration-300 ${
					prerequisitesMet && hasEnoughResources && !isPlanetResearching
						? 'neon-border hover:shadow-[0_0_20px_rgba(32,224,160,0.3)]'
						: isPlanetResearching && !tech.is_researching
						? 'border-amber-500/50 opacity-50'
						: 'border-red-500/50'
				}`}
			>
				<CardHeader className="flex flex-row items-start gap-6 pb-2">
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.5 }}
						className="w-2/5 aspect-square"
					>
						<Image
							width={100}
							height={100}
							src={`/images/researchs/${id}.webp`}
							alt={assetConfig?.nameKey}
							className={`w-full h-full object-cover rounded-lg ${
								(!prerequisitesMet ||
									!hasEnoughResources ||
									(isPlanetResearching && !tech.is_researching)) &&
								'opacity-50'
							}`}
						/>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.5, delay: 0.2 }}
						className="flex flex-col gap-2 w-3/5"
					>
						<div className="flex flex-col gap-2">
							<CardTitle className="text-xl font-bold neon-text tracking-wide uppercase hover:scale-105 transition-transform">
								{t(assetConfig?.nameKey)}
							</CardTitle>
							<div className="flex flex-col gap-1 text-sm">
								{assetConfig.unlocks?.ships && (
									<div className="flex items-center gap-2">
										<Ship className="h-4 w-4 text-blue-400" />
										<span>Unlocks ships: {assetConfig.unlocks.ships.join(', ')}</span>
									</div>
								)}
								{assetConfig.unlocks?.defense && (
									<div className="flex items-center gap-2">
										<Shield className="h-4 w-4 text-green-400" />
										<span>Unlocks defense: {assetConfig.unlocks.defense.join(', ')}</span>
									</div>
								)}
							</div>
						</div>

						<div className="flex items-center space-x-2 text-sm">
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger className="text-primary font-medium">
										Level {tech.level}/{config.max_level}
									</TooltipTrigger>
									<TooltipContent>
										<p>Maximum level: {config.max_level}</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
							<span className="text-primary/50">•</span>
							<div className="text-secondary uppercase">{assetConfig?.category}</div>
						</div>

						<p className="text-sm text-gray-200 text-left">{getEffectDescription()}</p>

						{!prerequisitesMet && (
							<div className="flex items-center gap-2 text-red-400 text-sm">
								<Lock className="h-4 w-4" />
								<div>
									Requires:{' '}
									{config.prerequisites
										.map(
											(prereq) =>
												`${t(TECHNOLOGIES[prereq.technology_id as TechnologyId].nameKey)} ${
													prereq.required_level
												}`
										)
										.join(', ')}
								</div>
							</div>
						)}

						{isPlanetResearching && !tech.is_researching && (
							<div className="flex items-center gap-2 text-amber-400 text-sm">
								<Clock className="h-4 w-4" />
								<div>Another technology is currently being researched</div>
							</div>
						)}
					</motion.div>
				</CardHeader>

				<CardContent className="space-y-4 pt-4 border-t border-primary/20">
					{tech.is_researching ? (
						<Timer
							startTime={tech.research_start_time!.toMillis()}
							finishTime={tech.research_finish_time!.toMillis()}
							variant="primary"
						/>
					) : (
						<div className="p-3 bg-black/30 rounded-lg border border-primary/20">
							<h4 className="font-medium text-primary mb-2">{tResearchs('card.research_time')}</h4>
							<div className="text-gray-200 text-sm">{utils.formatTimerTime(researchTime / 1000)}</div>
						</div>
					)}

					{tech.level < config.max_level && (
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<div className="w-full p-3 bg-black/30 rounded-lg border border-primary/20">
										<h4 className="font-medium text-primary mb-2">
											{tResearchs('card.resource_cost')}
										</h4>
										<div className="grid grid-cols-2 gap-4">
											{config.cost.base_metal > 0 && (
												<div className="flex items-center gap-2">
													<Hammer className="h-4 w-4 text-secondary" />
													<span
														className={`text-sm truncate ${
															state.currentResources.metal < costs.metal
																? 'text-red-400'
																: 'text-gray-200'
														}`}
													>
														{Math.floor(costs.metal).toLocaleString()}
													</span>
												</div>
											)}
											{config.cost.base_deuterium > 0 && (
												<div className="flex items-center gap-2">
													<Flame className="h-4 w-4 text-primary" />
													<span
														className={`text-sm truncate ${
															state.currentResources.deuterium < costs.deuterium
																? 'text-red-400'
																: 'text-gray-200'
														}`}
													>
														{Math.floor(costs.deuterium).toLocaleString()}
													</span>
												</div>
											)}
											{config.cost.base_microchips > 0 && (
												<div className="flex items-center gap-2">
													<Microchip className="h-4 w-4 text-accent" />
													<span
														className={`text-sm truncate ${
															state.currentResources.microchips < costs.microchips
																? 'text-red-400'
																: 'text-gray-200'
														}`}
													>
														{Math.floor(costs.microchips).toLocaleString()}
													</span>
												</div>
											)}
										</div>
									</div>
								</TooltipTrigger>
							</Tooltip>
						</TooltipProvider>
					)}

					<button
						onClick={() => onStartResearch(id)}
						disabled={
							tech.is_researching ||
							tech.level >= config.max_level ||
							!prerequisitesMet ||
							!hasEnoughResources ||
							(isPlanetResearching && !tech.is_researching)
						}
						className={`w-full px-4 py-2 rounded-lg font-medium transition-colors border ${
							tech.is_researching ||
							tech.level >= config.max_level ||
							!prerequisitesMet ||
							!hasEnoughResources ||
							(isPlanetResearching && !tech.is_researching)
								? 'bg-gray-800/50 text-gray-400 border-gray-600 cursor-not-allowed'
								: 'bg-primary/20 hover:bg-primary/30 text-primary border-primary/50 hover:border-primary/80 neon-border'
						}`}
					>
						{getButtonText()}
					</button>
				</CardContent>
			</Card>
		</motion.div>
	);
}

export default function Researchs() {
	const { state } = useGame();
	const { t } = useTranslation('researchs');
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

	if (!state.gameConfig || !state.userResearchs) {
		return <LoadingScreen message={t('loading')} />;
	}

	// Check if laboratory exists
	const hasLaboratory = state.selectedPlanet?.structures.some((s) => s.type === 'research_lab' && s.level >= 1);

	if (!hasLaboratory) {
		// Early return with cyberpunk "coming soon" message
		return (
			<div className="min-h-screen bg-background cyber-grid flex items-center justify-center p-4">
				<div className="max-w-2xl w-full space-y-6 text-center">
					<div className="animate-pulse">
						<h2 className="text-4xl font-bold text-red-500 glitch-text">{t('no_laboratory.title')}</h2>
					</div>

					<div className="bg-black/50 backdrop-blur-sm border-red-500/50 border-2 p-8 rounded-lg space-y-4">
						<div className="text-xl text-red-400 font-mono">{t('no_laboratory.error_code')}</div>

						<div className="text-muted-foreground font-mono">
							<p>{t('no_laboratory.message')}</p>
							<p>{t('no_laboratory.action')}</p>
						</div>

						<div className="animate-blink text-yellow-500 font-mono mt-8">{t('no_laboratory.standby')}</div>
					</div>

					<div className="text-sm text-muted-foreground font-mono">{t('no_laboratory.error_code')}</div>
				</div>
			</div>
		);
	}

	const startResearch = async (technologyId: TechnologyId) => {
		if (!state.selectedPlanet?.id) return;

		try {
			await api.startResearch(technologyId, state.selectedPlanet.id);
		} catch (error) {
			console.error('Error starting research:', error);
		}
	};

	const getResearchStatus = () => {
		if (!state.userResearchs)
			return { canStartNewResearch: false, activeResearchCount: 0, isPlanetResearching: false };

		const activeResearches = Object.values(state.userResearchs.technologies).filter((tech) => tech.is_researching);

		// Count active researches
		const activeResearchCount = activeResearches.length;

		// Check if current planet is already researching
		const isPlanetResearching = activeResearches.some(
			(tech) => tech.researching_planet_id === state.selectedPlanet?.id
		);

		// Can start new research if:
		// 1. We haven't reached capacity limit
		// 2. Current planet isn't already researching
		const canStartNewResearch = activeResearchCount < state.userResearchs.capacity && !isPlanetResearching;

		return { canStartNewResearch, activeResearchCount, isPlanetResearching };
	};

	const { canStartNewResearch, activeResearchCount, isPlanetResearching } = getResearchStatus();

	return (
		<ErrorBoundary>
			<div className="space-y-6">
				<div className="flex justify-between items-center">
					<div>
						<h1 className="text-3xl font-bold neon-text mb-2 flex items-center gap-2">
							<Beaker className="h-8 w-8" />
							{t('title')}
						</h1>
						<div className="flex items-center gap-2 text-gray-200">
							<FolderTree className="h-5 w-5" />
							<p>{t('subtitle')}</p>
						</div>
					</div>

					<div className="flex items-center gap-4">
						<div className="text-sm text-primary">
							{t('research_capacity')}: {activeResearchCount}/{state.userResearchs.capacity}
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
				</div>

				<motion.div
					layout
					className={`grid ${gridColsClass} gap-6`}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.5 }}
				>
					{state.gameConfig.researchs.map((config) => {
						const tech = state.userResearchs!.technologies[config.id];
						if (!tech) return null;

						return (
							<ResearchCard
								key={config.id}
								id={config.id}
								config={config}
								tech={tech}
								onStartResearch={startResearch}
								canStartNewResearch={canStartNewResearch}
								isPlanetResearching={isPlanetResearching}
								researchCapacityInfo={{
									current: activeResearchCount,
									max: state.userResearchs!.capacity,
								}}
							/>
						);
					})}
				</motion.div>
			</div>
		</ErrorBoundary>
	);
}
