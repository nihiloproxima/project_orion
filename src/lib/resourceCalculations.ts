import { Structure } from "../models/structure";
import { GameStructuresConfig } from "../models/structures_config";
import { ResourceType } from "../models/planets_resources";
import { PlanetBiome } from "../models/planet";

const BIOME_BONUSES: Record<
  PlanetBiome,
  { primary: [ResourceType, number]; secondary: [ResourceType, number] }
> = {
  ocean: { primary: ["deuterium", 0.2], secondary: ["energy", 0.1] },
  desert: { primary: ["metal", 0.15], secondary: ["science", 0.1] },
  jungle: { primary: ["energy", 0.2], secondary: ["metal", 0.05] },
  ice: { primary: ["deuterium", 0.25], secondary: ["science", 0.05] },
  volcanic: { primary: ["energy", 0.3], secondary: ["deuterium", 0.15] },
};

interface ResourceGenerationRates {
  metal: number;
  microchips: number;
  deuterium: number;
  energy_production: number;
  energy_consumption: number;
  science: number;
}

export function calculateResourceGeneration(
  structures: Structure[],
  structuresConfig: GameStructuresConfig,
  planetBiome: PlanetBiome,
  elapsedTimeSeconds: number
): ResourceGenerationRates {
  const rates: ResourceGenerationRates = {
    metal: 0,
    microchips: 0,
    deuterium: 0,
    science: 0,
    energy_production: 0,
    energy_consumption: 0,
  };

  let totalEnergyProduction = 0;
  let totalEnergyConsumption = 0;

  // Calculate energy production and consumption first
  structures.forEach((structure) => {
    const config =
      structuresConfig[structure.type as keyof GameStructuresConfig];

    // Calculate energy production from energy plants
    if (structure.type === "energy_plant") {
      const baseProduction = config.base_production_rate || 0;
      const productionIncrease =
        (config.production_rate_increase_per_level || 0) *
        (structure.level - 1);
      totalEnergyProduction += baseProduction + productionIncrease;
    }

    // Calculate energy consumption for all structures
    if (config.base_energy_consumption) {
      const consumption =
        config.base_energy_consumption +
        (config.energy_consumption_increase_per_level || 0) *
          (structure.level - 1);
      totalEnergyConsumption += consumption;
    }
  });

  // Set energy as the balance between production and consumption
  rates.energy_production = totalEnergyProduction;
  rates.energy_consumption = totalEnergyConsumption;

  // Calculate other resources generation
  structures.forEach((structure) => {
    const config =
      structuresConfig[structure.type as keyof GameStructuresConfig];
    if (
      !config.produced_resource ||
      !config.base_production_rate ||
      config.produced_resource === "energy"
    )
      return;

    let productionRate = config.base_production_rate;
    productionRate +=
      (config.production_rate_increase_per_level || 0) * (structure.level - 1);

    // Apply biome bonuses
    const biomeBonuses = BIOME_BONUSES[planetBiome];
    if (biomeBonuses.primary[0] === config.produced_resource) {
      productionRate *= 1 + biomeBonuses.primary[1];
    } else if (biomeBonuses.secondary[0] === config.produced_resource) {
      productionRate *= 1 + biomeBonuses.secondary[1];
    }

    // Only generate resources if we have positive energy balance
    if (rates.energy_production >= rates.energy_consumption) {
      const totalProduction = productionRate * elapsedTimeSeconds;
      rates[config.produced_resource as keyof ResourceGenerationRates] +=
        totalProduction;
    }
  });

  return rates;
}

export function calculateHourlyRates(
  structures: Structure[],
  structuresConfig: GameStructuresConfig,
  planetBiome: PlanetBiome
): ResourceGenerationRates {
  // Calculate for one hour (3600 seconds)
  return calculateResourceGeneration(
    structures,
    structuresConfig,
    planetBiome,
    3600
  );
}

export function calculateCurrentResources(
  baseResources: ResourceGenerationRates,
  structures: Structure[],
  structuresConfig: GameStructuresConfig,
  planetBiome: PlanetBiome,
  lastUpdateTimestamp: number
): ResourceGenerationRates {
  const elapsedSeconds = (Date.now() - lastUpdateTimestamp) / 1000;
  const generatedResources = calculateResourceGeneration(
    structures,
    structuresConfig,
    planetBiome,
    elapsedSeconds
  );

  return {
    metal: baseResources.metal + generatedResources.metal,
    microchips: baseResources.microchips + generatedResources.microchips,
    deuterium: baseResources.deuterium + generatedResources.deuterium,
    energy_production:
      baseResources.energy_production + generatedResources.energy_production,
    energy_consumption:
      baseResources.energy_consumption + generatedResources.energy_consumption,
    science: baseResources.science + generatedResources.science,
  };
}
