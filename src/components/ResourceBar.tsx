import { useGame } from '../contexts/GameContext';
import { useLanguage } from '../contexts/LanguageContext';
import millify from 'millify';
import { Flame, Hammer, Microchip, Zap, Menu, Coins } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

import { ResourceType } from '@/models';
import { useEffect, useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '../components/ui/button';
import planetCalculations, { ResourceGenerationRates } from '@/utils/planet_calculations';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { db } from '@/lib/firebase';
import { doc } from 'firebase/firestore';

// First, define a resource config object
type ResourceConfig = {
	[key in ResourceType]?: {
		label: string;
		icon: React.ElementType<{ className?: string }>;
		textColor: string;
		iconColor: string;
	};
};

interface ResourceBarProps {
	showMobileSidebar: boolean;
	setShowMobileSidebar: (show: boolean) => void;
}

type Resources = {
	[key in ResourceType]: number;
};

export function ResourceBar({ showMobileSidebar, setShowMobileSidebar }: ResourceBarProps) {
	const { state, selectPlanet } = useGame();
	const { t } = useLanguage();
	const [isExpanded, setIsExpanded] = useState(false);
	const [userInventory] = useDocumentData(
		state.currentUser ? doc(db, 'users', state.currentUser.id, 'private', 'inventory') : null
	);
	const [resources, setResources] = useState<Resources>({
		metal: 0,
		microchips: 0,
		deuterium: 0,
		energy: 0,
	});
	const [credits, setCredits] = useState(0);

	useEffect(() => {
		if (state.selectedPlanet === null || !state.currentResources) {
			return;
		}

		setResources(state.currentResources);
	}, [state.selectedPlanet, state.currentResources]);

	useEffect(() => {
		if (userInventory && userInventory.credits !== undefined) {
			setCredits(userInventory.credits);
		}
	}, [userInventory]);

	if (state.selectedPlanet === null || !state.currentResources || !state.gameConfig || !state.userResearchs) {
		return null;
	}

	const baseRates = planetCalculations.calculateBaseRates(
		state.gameConfig,
		state.selectedPlanet.structures,
		state.userResearchs,
		state.selectedPlanet.biome
	);
	const hourlyRates: ResourceGenerationRates = {
		metal: (baseRates.metal || 0) * 3600,
		deuterium: (baseRates.deuterium || 0) * 3600,
		microchips: (baseRates.microchips || 0) * 3600,
	};

	const storageCapacities = planetCalculations.calculateStorageCapacities(
		state.gameConfig,
		state.selectedPlanet.structures
	);

	// Update resource config to use translations
	const RESOURCE_CONFIG: ResourceConfig = {
		metal: {
			label: t('common', 'resources.metal'),
			icon: Hammer,
			textColor: 'text-secondary',
			iconColor: 'text-secondary',
		},
		deuterium: {
			label: t('common', 'resources.deuterium'),
			icon: Flame,
			textColor: 'text-primary',
			iconColor: 'text-primary',
		},
		microchips: {
			label: t('common', 'resources.microchips'),
			icon: Microchip,
			textColor: 'text-accent',
			iconColor: 'text-accent',
		},
	} as const;

	return (
		<div className="w-full bg-black/80 border-b border-primary/30 backdrop-blur-sm py-2 px-4 sticky top-0 z-[55]">
			<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
				<Button
					variant="ghost"
					size="icon"
					className="absolute left-4 top-[14px] md:hidden"
					onClick={() => setShowMobileSidebar(!showMobileSidebar)}
				>
					<Menu className="h-6 w-6" />
				</Button>

				<div className="w-full sm:w-72 pl-12 md:pl-0">
					<Select
						value={state.selectedPlanet?.id || ''}
						onValueChange={(value) => {
							const planet = state.userPlanets.find((p) => p.id === value);
							if (planet) selectPlanet(planet);
						}}
					>
						<SelectTrigger className="w-full h-8 sm:h-10 text-sm sm:text-base bg-black border-primary/30 text-primary hover:border-primary/60 transition-colors">
							<SelectValue placeholder="Select Planet" />
						</SelectTrigger>
						<SelectContent className="bg-black/95 border-primary/30 z-[60]">
							{state.userPlanets.map((planet) => (
								<SelectItem
									key={planet.id}
									value={planet.id}
									className="text-primary hover:bg-primary/20"
								>
									{`> ${planet.name}${planet.is_homeworld ? ' (Homeworld)' : ''}`}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="hidden sm:flex sm:justify-end sm:gap-6">
					<div className="flex flex-col items-end">
						<span className="text-xs text-yellow-400/70">CREDITS</span>
						<div className="flex items-center gap-2">
							<span className={`font-mono font-bold text-base  text-yellow-400 `}>
								{millify(Math.floor(userInventory?.credits || 0))}
							</span>
							<Coins className={`h-4 w-4 text-yellow-400`} />
						</div>
					</div>

					{Object.entries(RESOURCE_CONFIG).map(([resource, config]) => (
						<div key={resource} className="flex flex-col items-end">
							<span className="text-xs ${config.textColor}/70">{config.label}</span>
							<div className="flex items-center gap-2">
								<span
									className={`font-mono font-bold text-base ${
										resources[resource as ResourceType] >=
										storageCapacities[resource as ResourceType]!
											? 'text-red-400'
											: config.textColor
									}`}
								>
									{millify(Math.floor(resources[resource as ResourceType]))}/
									{millify(storageCapacities[resource as ResourceType]!)}
								</span>
								<config.icon className={`h-4 w-4 ${config.iconColor}`} />
							</div>
							<span className={`text-xs ${config.textColor} font-medium`}>
								+
								{hourlyRates[resource as ResourceType]! >= 10000
									? millify(hourlyRates[resource as ResourceType]!)
									: Math.floor(hourlyRates[resource as ResourceType]!)}
								/h
							</span>
						</div>
					))}

					<div className="flex flex-col items-end">
						<span className="text-xs text-violet-400/70">{t('common', 'resources.energy')}</span>
						<div className="flex items-center gap-2">
							<span
								className={`font-mono font-bold text-base ${
									state.currentResources.energy_production >=
									state.currentResources.energy_consumption
										? 'text-violet-400'
										: 'text-red-400'
								}`}
							>
								{millify(
									state.currentResources.energy_production - state.currentResources.energy_consumption
								)}
							</span>
							<Zap
								className={`h-4 w-4 ${
									state.currentResources.energy_production >=
									state.currentResources.energy_consumption
										? 'text-violet-400'
										: 'text-red-400'
								}`}
							/>
						</div>
					</div>
				</div>

				<div className="block sm:hidden relative">
					<div className="flex justify-between items-center gap-1">
						<button
							onClick={() => setIsExpanded(!isExpanded)}
							className="flex-1 flex flex-col items-center min-w-0"
						>
							<div className="flex items-center gap-1">
								<Coins className="h-3 w-3 text-yellow-400" />
								<span className="font-mono font-bold text-xs truncate text-yellow-400">
									{millify(credits)}
								</span>
							</div>
						</button>

						{Object.entries(RESOURCE_CONFIG).map(([resource, config]) => (
							<button
								key={resource}
								onClick={() => setIsExpanded(!isExpanded)}
								className="flex-1 flex flex-col items-center min-w-0"
							>
								<div className="flex items-center gap-1">
									<config.icon className={`h-3 w-3 ${config.iconColor}`} />
									<span
										className={`font-mono font-bold text-xs truncate ${
											resources[resource as ResourceType] >=
											storageCapacities[resource as ResourceType]!
												? 'text-red-400'
												: config.textColor
										}`}
									>
										{millify(Math.floor(resources[resource as ResourceType]))}/
										{millify(storageCapacities[resource as ResourceType]!)}
									</span>
								</div>
								{isExpanded && (
									<span className={`text-[10px] ${config.textColor} font-medium`}>
										+
										{hourlyRates[resource as ResourceType]! >= 10000
											? millify(hourlyRates[resource as ResourceType]!)
											: Math.floor(hourlyRates[resource as ResourceType]!)}
										/h
									</span>
								)}
							</button>
						))}

						<button
							onClick={() => setIsExpanded(!isExpanded)}
							className="flex-1 flex flex-col items-center min-w-0"
						>
							<div className="flex items-center gap-1">
								<Zap
									className={`h-3 w-3 ${
										state.currentResources.energy_production >=
										state.currentResources.energy_consumption
											? 'text-violet-400'
											: 'text-red-400'
									}`}
								/>
								<span
									className={`font-mono font-bold text-xs truncate ${
										state.currentResources.energy_production >=
										state.currentResources.energy_consumption
											? 'text-violet-400'
											: 'text-red-400'
									}`}
								>
									{millify(
										state.currentResources.energy_production -
											state.currentResources.energy_consumption
									)}
								</span>
							</div>
							{isExpanded && (
								<span className="text-[10px] font-medium">
									{Number(
										state.currentResources.energy_production /
											state.currentResources.energy_consumption
									).toFixed(2)}
								</span>
							)}
						</button>
					</div>

					<button
						onClick={() => setIsExpanded(!isExpanded)}
						className="absolute right-0 -bottom-4 bg-black/80 border border-primary/30 rounded-full p-1"
					>
						{isExpanded ? (
							<ChevronUp className="h-3 w-3 text-primary" />
						) : (
							<ChevronDown className="h-3 w-3 text-primary" />
						)}
					</button>
				</div>
			</div>
		</div>
	);
}
