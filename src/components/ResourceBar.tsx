import { useGame } from '../contexts/GameContext';
import millify from 'millify';
import { Beaker, Flame, Hammer, Microchip, Zap } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
	calculateBaseRates,
	calculateStorageCapacities,
	ResourceGenerationRates,
} from '@/utils/resources_calculations';
import { ResourceType } from '@/models';

// First, define a resource config object
type ResourceConfig = {
	[key in ResourceType]?: {
		label: string;
		icon: React.ElementType<{ className?: string }>;
		textColor: string;
		iconColor: string;
	};
};

const RESOURCE_CONFIG: ResourceConfig = {
	metal: {
		label: 'METAL',
		icon: Hammer,
		textColor: 'text-secondary',
		iconColor: 'text-secondary',
	},
	deuterium: {
		label: 'DEUTERIUM',
		icon: Flame,
		textColor: 'text-primary',
		iconColor: 'text-primary',
	},
	microchips: {
		label: 'MICROCHIPS',
		icon: Microchip,
		textColor: 'text-accent',
		iconColor: 'text-accent',
	},
	science: {
		label: 'SCIENCE',
		icon: Beaker,
		textColor: 'text-blue-400',
		iconColor: 'text-blue-400',
	},
} as const;

export function ResourceBar() {
	const { state, selectPlanet } = useGame();

	if (state.selectedPlanet === null || !state.resources) {
		return null;
	}

	if (!state.gameConfig) return null;
	if (!state.planetStructures) return null;
	if (!state.userResearchs) return null;
	if (!state.resources) return null;

	const baseRates = calculateBaseRates(state.gameConfig, state.planetStructures.structures, state.userResearchs);
	const hourlyRates: ResourceGenerationRates = {
		metal: baseRates.metal * 3600,
		deuterium: baseRates.deuterium * 3600,
		microchips: baseRates.microchips * 3600,
		science: baseRates.science * 3600,
	};

	const storageCapacities = calculateStorageCapacities(state.gameConfig, state.planetStructures.structures);

	return (
		<div className="w-full bg-black/80 border-b border-primary/30 backdrop-blur-sm py-2 px-4 sticky top-0 z-50">
			<div className="flex justify-between items-center">
				<div className="w-72">
					<Select
						value={state.selectedPlanet?.id || ''}
						onValueChange={(value) => {
							const planet = state.userPlanets.find((p) => p.id === value);
							if (planet) selectPlanet(planet);
						}}
					>
						<SelectTrigger className="w-full bg-black border-primary/30 text-primary hover:border-primary/60 transition-colors">
							<SelectValue placeholder="Select Planet" />
						</SelectTrigger>
						<SelectContent className="bg-black/95 border-primary/30">
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
				<div className="flex justify-end gap-6">
					{Object.entries(RESOURCE_CONFIG).map(([resource, config]) => (
						<div key={resource} className="flex items-center gap-2">
							<div className="flex flex-col items-end">
								<span className={`text-xs ${config.textColor}/70`}>{config.label}</span>
								<div className="flex items-center gap-2">
									<span
										className={`font-mono font-bold ${
											state.resources![resource as ResourceType] >=
											storageCapacities[resource as ResourceType]
												? 'text-red-400'
												: config.textColor
										}`}
									>
										{millify(Math.floor(state.resources![resource as ResourceType]))}
										<span className={`text-xs ${config.textColor} ml-1`}>
											/{millify(storageCapacities[resource as ResourceType])}
										</span>
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
						</div>
					))}

					<div className="flex items-center gap-2">
						<div className="flex flex-col items-end">
							<span className="text-xs text-violet-400/70">ENERGY</span>
							<div className="flex items-center gap-2">
								<span
									className={`font-mono font-bold ${
										state.resources.energy_production >= state.resources.energy_consumption
											? 'text-violet-400'
											: 'text-red-400'
									}`}
								>
									{millify(state.resources.energy_production - state.resources.energy_consumption)}
								</span>
								<Zap
									className={`h-4 w-4 ${
										state.resources.energy_production >= state.resources.energy_consumption
											? 'text-violet-400'
											: 'text-red-400'
									}`}
								/>
							</div>
							<span className="text-xs font-medium">
								{Number(state.resources.energy_production / state.resources.energy_consumption).toFixed(
									2
								)}
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
