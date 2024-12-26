import { ResourceType } from "./planets_resources";

export interface StructureConfig {
    // Base costs to build the structure
    initial_cost: {
        metal: number;
        deuterium: number;
        microchips: number;
        science: number;
    };

    // How much each upgrade costs (multiplied by level)
    upgrade_cost: {
        metal: number;
        deuterium: number;
        microchips: number;
        science: number;
    };

    // Multiplier for upgrade costs (exponential growth)
    upgrade_cost_multiplier: number;

    // Produced resource
    produced_resource: ResourceType | null;

    // Base production rate per second at level 1
    base_production_rate: number | null;

    // How much production increases per level (linear growth)
    production_rate_increase_per_level: number | null;

    // Initial construction time in seconds
    construction_time_seconds: number;

    // How much construction time increases per level
    construction_time_multiplier: number;

    // Maximum construction time in seconds
    construction_time_max_seconds: number;

    // Base upgrade time in seconds
    upgrade_time_seconds: number;

    // How much upgrade time increases per level
    upgrade_time_multiplier: number;

    // Maximum upgrade time in seconds
    upgrade_time_max_seconds: number;

    // Base energy consumption at level 1
    base_energy_consumption: number | null;

    // How much energy consumption increases per level
    energy_consumption_increase_per_level: number | null;
}

export interface GameStructuresConfig {
    metal_mine: StructureConfig;
    energy_plant: StructureConfig;
    deuterium_synthesizer: StructureConfig;
    research_lab: StructureConfig;
    shipyard: StructureConfig;
    defense_factory: StructureConfig;
    microchip_factory: StructureConfig;
}

// Default configuration values
export const DEFAULT_STRUCTURES_CONFIG: GameStructuresConfig = {
    metal_mine: {
        initial_cost: {
            metal: 400, // Affordable with starting 500 metal
            deuterium: 0,
            microchips: 0,
            science: 0,
        },
        upgrade_cost: {
            metal: 200,
            deuterium: 0,
            microchips: 0,
            science: 0,
        },
        upgrade_cost_multiplier: 1.5,
        produced_resource: "metal",
        base_production_rate: 0.0333, // 2 metal per minute at level 1
        production_rate_increase_per_level: 0.0167, // +1 metal per minute per level
        construction_time_seconds: 30, // 30 seconds initially
        construction_time_multiplier: 1.5,
        construction_time_max_seconds: 86400, // Max 24 hours
        upgrade_time_seconds: 60, // 1 minute base upgrade time
        upgrade_time_multiplier: 1.5,
        upgrade_time_max_seconds: 86400,
        base_energy_consumption: 10,
        energy_consumption_increase_per_level: 8,
    },
    energy_plant: {
        initial_cost: {
            metal: 100, // Affordable after building metal mine
            deuterium: 0,
            microchips: 0,
            science: 0,
        },
        upgrade_cost: {
            metal: 150,
            deuterium: 0,
            microchips: 0,
            science: 0,
        },
        upgrade_cost_multiplier: 1.6,
        produced_resource: "energy",
        base_production_rate: 0.0222, // 1.33 energy per minute at level 1
        production_rate_increase_per_level: 0.0111,
        construction_time_seconds: 45,
        construction_time_multiplier: 1.5,
        construction_time_max_seconds: 86400,
        upgrade_time_seconds: 90,
        upgrade_time_multiplier: 1.5,
        upgrade_time_max_seconds: 86400,
        base_energy_consumption: 0,
        energy_consumption_increase_per_level: 0,
    },
    deuterium_synthesizer: {
        initial_cost: {
            metal: 300,
            deuterium: 0,
            microchips: 0, // Removed initial microchip requirement
            science: 0,
        },
        upgrade_cost: {
            metal: 200,
            deuterium: 0,
            microchips: 0,
            science: 0,
        },
        upgrade_cost_multiplier: 1.7,
        produced_resource: "deuterium",
        base_production_rate: 0.0083,
        production_rate_increase_per_level: 0.0042,
        construction_time_seconds: 120,
        construction_time_multiplier: 1.5,
        construction_time_max_seconds: 86400,
        upgrade_time_seconds: 180,
        upgrade_time_multiplier: 1.5,
        upgrade_time_max_seconds: 86400,
        base_energy_consumption: 20,
        energy_consumption_increase_per_level: 15,
    },
    research_lab: {
        initial_cost: {
            metal: 2500,
            deuterium: 500, // Requires deuterium synthesizer
            microchips: 0,
            science: 0,
        },
        upgrade_cost: {
            metal: 1250,
            deuterium: 250,
            microchips: 0,
            science: 0,
        },
        upgrade_cost_multiplier: 1.8,
        produced_resource: "science",
        base_production_rate: 0.0014,
        production_rate_increase_per_level: 0.0008,
        construction_time_seconds: 1800,
        construction_time_multiplier: 1.5,
        construction_time_max_seconds: 86400,
        upgrade_time_seconds: 2100,
        upgrade_time_multiplier: 1.6,
        upgrade_time_max_seconds: 86400,
        base_energy_consumption: 15,
        energy_consumption_increase_per_level: 10,
    },
    shipyard: {
        initial_cost: {
            metal: 5000,
            deuterium: 1000, // Requires deuterium synthesizer
            microchips: 2000,
            science: 500, // Requires research lab
        },
        upgrade_cost: {
            metal: 2500,
            deuterium: 500,
            microchips: 1000,
            science: 250,
        },
        upgrade_cost_multiplier: 1.6,
        produced_resource: null,
        base_production_rate: 0,
        production_rate_increase_per_level: 0,
        construction_time_seconds: 2400,
        construction_time_multiplier: 1.4,
        construction_time_max_seconds: 86400,
        upgrade_time_seconds: 2700,
        upgrade_time_multiplier: 1.5,
        upgrade_time_max_seconds: 86400,
        base_energy_consumption: 100,
        energy_consumption_increase_per_level: 50,
    },
    defense_factory: {
        initial_cost: {
            metal: 4000,
            deuterium: 750, // Requires deuterium synthesizer
            microchips: 1500,
            science: 400, // Requires research lab
        },
        upgrade_cost: {
            metal: 2000,
            deuterium: 375,
            microchips: 750,
            science: 200,
        },
        upgrade_cost_multiplier: 1.5,
        produced_resource: null,
        base_production_rate: 0,
        production_rate_increase_per_level: 0,
        construction_time_seconds: 2100,
        construction_time_multiplier: 1.4,
        construction_time_max_seconds: 86400,
        upgrade_time_seconds: 2400,
        upgrade_time_multiplier: 1.5,
        upgrade_time_max_seconds: 86400,
        base_energy_consumption: 80,
        energy_consumption_increase_per_level: 40,
    },
    microchip_factory: {
        initial_cost: {
            metal: 1000,
            deuterium: 0,
            microchips: 0,
            science: 100,
        },
        upgrade_cost: {
            metal: 500,
            deuterium: 0,
            microchips: 0,
            science: 50,
        },
        upgrade_cost_multiplier: 1.5,
        produced_resource: "microchips",
        base_production_rate: 0.005,
        production_rate_increase_per_level: 0.0025,
        construction_time_seconds: 600,
        construction_time_multiplier: 1.5,
        construction_time_max_seconds: 86400,
        upgrade_time_seconds: 900,
        upgrade_time_multiplier: 1.5,
        upgrade_time_max_seconds: 86400,
        base_energy_consumption: 50,
        energy_consumption_increase_per_level: 25,
    },
};
