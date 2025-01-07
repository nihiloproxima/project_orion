import { useGame } from '../contexts/GameContext';
import millify from 'millify';
import { Beaker, Flame, Hammer, Microchip, Zap } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { calculateHourlyRates, calculateStorageCapacities } from '@/utils/resources_calculations';

export function ResourceBar() {
	const { state, selectPlanet } = useGame();

	if (state.selectedPlanet === null || !state.resources) {
		return null;
	}

	if (!state.gameConfig) return null;
	if (!state.planetStructures) return null;
	if (!state.userResearchs) return null;
	if (!state.resources) return null;

	const hourlyGenerationRate = calculateHourlyRates(
		state.planetStructures.structures,
		state.gameConfig,
		state.resources,
		state.userResearchs
	);

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
					<div className="flex items-center gap-2">
						<div className="flex flex-col items-end">
							<span className="text-xs text-secondary/70">METAL</span>
							<div className="flex items-center gap-2">
								<span
									className={`font-mono font-bold ${
										state.resources.metal >= storageCapacities.metal
											? 'text-red-400'
											: 'text-secondary'
									}`}
								>
									{millify(state.resources.metal)}

									<span className="text-xs text-secondary ml-1">
										/{millify(storageCapacities.metal)}
									</span>
								</span>
								<Hammer className="h-4 w-4 text-secondary" />
							</div>
							<span className="text-xs text-secondary font-medium">
								+
								{hourlyGenerationRate.metal >= 10000
									? millify(hourlyGenerationRate.metal)
									: Math.floor(hourlyGenerationRate.metal)}
								/h
							</span>
						</div>
					</div>

					<div className="flex items-center gap-2">
						<div className="flex flex-col items-end">
							<span className="text-xs text-primary/70">DEUTERIUM</span>
							<div className="flex items-center gap-2">
								<span
									className={`font-mono font-bold ${
										state.resources.deuterium >= storageCapacities.deuterium
											? 'text-red-400'
											: 'text-primary'
									}`}
								>
									{millify(state.resources.deuterium)}
									<span className="text-xs text-primary ml-1">
										/{millify(storageCapacities.deuterium)}
									</span>
								</span>
								<Flame className="h-4 w-4 text-primary" />
							</div>
							<span className="text-xs text-primary font-medium">
								+
								{hourlyGenerationRate.deuterium >= 10000
									? millify(hourlyGenerationRate.deuterium)
									: Math.floor(hourlyGenerationRate.deuterium)}
								/h
							</span>
						</div>
					</div>

					<div className="flex items-center gap-2">
						<div className="flex flex-col items-end">
							<span className="text-xs text-accent/70">MICROCHIPS</span>
							<div className="flex items-center gap-2">
								<span
									className={`font-mono font-bold ${
										state.resources.microchips >= storageCapacities.microchips
											? 'text-red-400'
											: 'text-accent'
									}`}
								>
									{millify(state.resources.microchips)}
									<span className="text-xs text-accent ml-1">
										/{millify(storageCapacities.microchips)}
									</span>
								</span>
								<Microchip className="h-4 w-4 text-accent" />
							</div>
							<span className="text-xs text-accent font-medium">
								+
								{hourlyGenerationRate.microchips >= 10000
									? millify(hourlyGenerationRate.microchips)
									: Math.floor(hourlyGenerationRate.microchips)}
								/h
							</span>
						</div>
					</div>

					<div className="flex items-center gap-2">
						<div className="flex flex-col items-end">
							<span className="text-xs text-blue-400/70">SCIENCE</span>
							<div className="flex items-center gap-2">
								<span
									className={`font-mono font-bold ${
										state.resources.science >= storageCapacities.science
											? 'text-red-400'
											: 'text-blue-400'
									}`}
								>
									{millify(state.resources.science)}
									<span className="text-xs text-blue-400 ml-1">
										/{millify(storageCapacities.science)}
									</span>
								</span>
								<Beaker className="h-4 w-4 text-blue-400" />
							</div>
							<span className="text-xs text-blue-400 font-medium">
								+
								{hourlyGenerationRate.science >= 10000
									? millify(hourlyGenerationRate.science)
									: Math.floor(hourlyGenerationRate.science)}
								/h
							</span>
						</div>
					</div>

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
