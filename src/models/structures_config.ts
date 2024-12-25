export interface StructuresConfig {
    // Base costs to build the structure
    initial_cost: {
        metal: number;
        energy: number;
        deuterium: number;
    };

    // How much each upgrade costs (multiplied by level)
    upgrade_cost: {
        metal: number;
        energy: number;
        deuterium: number;
    };

    // Multiplier for upgrade costs (exponential growth)
    upgrade_cost_multiplier: number;

    // Produced resource
    produced_resource: "metal" | "energy" | "deuterium" | "science" | null;

    // Base production rate per hour at level 1
    base_production_rate: number;

    // How much production increases per level (linear growth)
    production_rate_increase_per_level: number;

    // Initial construction time in seconds
    construction_time_seconds: number;

    // How much construction time increases per level
    construction_time_multiplier: number;

    // Maximum construction time in seconds
    construction_time_max_seconds: number;
}

export interface GameStructuresConfig {
    metal_mine: StructuresConfig;
    energy_plant: StructuresConfig;
    deuterium_synthesizer: StructuresConfig;
    research_lab: StructuresConfig;
    shipyard: StructuresConfig;
    defense_factory: StructuresConfig;
}

// Default configuration values
export const DEFAULT_STRUCTURES_CONFIG: GameStructuresConfig = {
    metal_mine: {
        initial_cost: {
            metal: 1000,
            energy: 0,
            deuterium: 0,
        },
        upgrade_cost: {
            metal: 500,
            energy: 50,
            deuterium: 0,
        },
        upgrade_cost_multiplier: 1.5,
        produced_resource: "metal",
        base_production_rate: 30, // 30 metal per hour at level 1
        production_rate_increase_per_level: 20, // +20 metal per hour per level
        construction_time_seconds: 600, // 10 minutes
        construction_time_multiplier: 1.3,
        construction_time_max_seconds: 86400, // Max 24 hours
    },
    energy_plant: {
        initial_cost: {
            metal: 1500,
            energy: 0,
            deuterium: 0,
        },
        upgrade_cost: {
            metal: 750,
            energy: 0,
            deuterium: 50,
        },
        upgrade_cost_multiplier: 1.6,
        produced_resource: "energy",
        base_production_rate: 20, // 20 energy per hour at level 1
        production_rate_increase_per_level: 15, // +15 energy per hour per level
        construction_time_seconds: 900, // 15 minutes
        construction_time_multiplier: 1.3,
        construction_time_max_seconds: 86400,
    },
    deuterium_synthesizer: {
        initial_cost: {
            metal: 2000,
            energy: 1000,
            deuterium: 0,
        },
        upgrade_cost: {
            metal: 1000,
            energy: 500,
            deuterium: 0,
        },
        upgrade_cost_multiplier: 1.7,
        produced_resource: "deuterium",
        base_production_rate: 10, // 10 deuterium per hour at level 1
        production_rate_increase_per_level: 5, // +5 deuterium per hour per level
        construction_time_seconds: 1200, // 20 minutes
        construction_time_multiplier: 1.4,
        construction_time_max_seconds: 86400,
    },
    research_lab: {
        initial_cost: {
            metal: 2500,
            energy: 1500,
            deuterium: 500,
        },
        upgrade_cost: {
            metal: 1250,
            energy: 750,
            deuterium: 250,
        },
        upgrade_cost_multiplier: 1.8,
        produced_resource: "science",
        base_production_rate: 5, // 5 research points per hour at level 1
        production_rate_increase_per_level: 3, // +3 research points per hour per level
        construction_time_seconds: 1800, // 30 minutes
        construction_time_multiplier: 1.5,
        construction_time_max_seconds: 86400,
    },
    shipyard: {
        initial_cost: {
            metal: 5000,
            energy: 2000,
            deuterium: 1000,
        },
        upgrade_cost: {
            metal: 2500,
            energy: 1000,
            deuterium: 500,
        },
        upgrade_cost_multiplier: 1.6,
        produced_resource: null,
        base_production_rate: 0, // Shipyards don't produce resources
        production_rate_increase_per_level: 0,
        construction_time_seconds: 2400, // 40 minutes
        construction_time_multiplier: 1.4,
        construction_time_max_seconds: 86400,
    },
    defense_factory: {
        initial_cost: {
            metal: 4000,
            energy: 1500,
            deuterium: 750,
        },
        upgrade_cost: {
            metal: 2000,
            energy: 750,
            deuterium: 375,
        },
        upgrade_cost_multiplier: 1.5,
        produced_resource: null,
        base_production_rate: 0, // Defense factories don't produce resources
        production_rate_increase_per_level: 0,
        construction_time_seconds: 2100, // 35 minutes
        construction_time_multiplier: 1.4,
        construction_time_max_seconds: 86400,
    },
};
