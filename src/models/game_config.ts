import { DefenseConfig } from "./defense_config";
import { PlanetBiome } from "./planet";
import { ResearchConfig } from "./researchs_config";
import { ShipConfig } from "./ship_config";
import { StructureConfig } from "./structure_config";

export interface GameConfig {
    planets: {
        count: number;
        grid_size: number;
        size_min: number;
        size_max: number;
        biome_distribution: {
            [key in PlanetBiome]: number;
        };
    };
    speed: {
        resources: number;
        researchs: number;
        ships: number;
        construction: number;
    };
    structures: StructureConfig[];
    researchs: ResearchConfig[];
    ships: ShipConfig[];
    defenses: DefenseConfig[];
}

// Default configuration values
export const DEFAULT_GAME_CONFIG: GameConfig = {
    speed: {
        resources: 10,
        researchs: 10,
        ships: 10,
        construction: 10,
    },
    planets: {
        count: 500,
        grid_size: 10000,
        size_min: 1000,
        size_max: 10000,
        biome_distribution: {
            desert: 1,
            ocean: 1,
            jungle: 1,
            ice: 1,
            volcanic: 1,
        },
    },
    structures: [
        {
            type: "metal_mine",
            cost: {
                resources: {
                    metal: 30,
                    deuterium: 15,
                    microchips: 0,
                    science: 0,
                },
                percent_increase_per_level: 150,
            },
            prerequisites: {
                structures: [],
                technologies: [],
            },
            production: {
                base: 0.0083,
                percent_increase_per_level: 10,
                resource: "metal",
            },
            storage: {
                increase_per_level: null,
                resource: null,
            },
            time: {
                base_seconds: 600, // 10 minutes
                percent_increase_per_level: 200,
                max_seconds: 86400,
            },
            energy_consumption: {
                base: 10,
                percent_increase_per_level: 100,
            },
        },
        {
            type: "deuterium_synthesizer",
            prerequisites: {
                structures: [{
                    type: "metal_mine",
                    level: 1,
                }],
                technologies: [],
            },
            cost: {
                resources: {
                    metal: 50,
                    deuterium: 0,
                    microchips: 0,
                    science: 0,
                },
                percent_increase_per_level: 70,
            },
            production: {
                base: 0.0042,
                percent_increase_per_level: 10,
                resource: "deuterium",
            },
            storage: {
                increase_per_level: null,
                resource: null,
            },
            time: {
                base_seconds: 300,
                percent_increase_per_level: 200,
                max_seconds: 86400,
            },
            energy_consumption: {
                base: 20,
                percent_increase_per_level: 75,
            },
        },
        {
            type: "energy_plant",
            prerequisites: {
                structures: [{
                    type: "deuterium_synthesizer",
                    level: 1,
                }],
                technologies: [],
            },
            cost: {
                resources: {
                    metal: 150,
                    deuterium: 0,
                    microchips: 0,
                    science: 0,
                },
                percent_increase_per_level: 100,
            },
            production: {
                base: 100,
                percent_increase_per_level: 100,
                resource: "energy",
            },
            storage: {
                increase_per_level: null,
                resource: null,
            },
            time: {
                base_seconds: 300, // 5 minutes
                percent_increase_per_level: 500,
                max_seconds: 86400,
            },
            energy_consumption: {
                base: 0,
                percent_increase_per_level: 0,
            },
        },
        {
            type: "microchip_factory",
            cost: {
                resources: {
                    metal: 60,
                    deuterium: 30,
                    microchips: 0,
                    science: 10,
                },
                percent_increase_per_level: 100,
            },
            prerequisites: {
                structures: [{
                    type: "research_lab",
                    level: 1,
                }],
                technologies: [],
            },
            production: {
                base: 0.001,
                percent_increase_per_level: 100,
                resource: "microchips",
            },
            storage: {
                increase_per_level: null,
                resource: null,
            },
            time: {
                base_seconds: 3600,
                percent_increase_per_level: 100,
                max_seconds: 86400,
            },
            energy_consumption: {
                base: 50,
                percent_increase_per_level: 50,
            },
        },
        {
            type: "research_lab",
            prerequisites: {
                structures: [{
                    type: "energy_plant",
                    level: 1,
                }],
                technologies: [],
            },
            cost: {
                resources: {
                    metal: 100,
                    deuterium: 100,
                    microchips: 0,
                    science: 0,
                },
                percent_increase_per_level: 500,
            },
            production: {
                base: 0.004,
                percent_increase_per_level: 10,
                resource: "science",
            },
            storage: {
                increase_per_level: null,
                resource: null,
            },
            time: {
                base_seconds: 3600,
                percent_increase_per_level: 300,
                max_seconds: 86400,
            },
            energy_consumption: {
                base: 15,
                percent_increase_per_level: 200,
            },
        },
        {
            type: "shipyard",
            cost: {
                resources: {
                    metal: 300,
                    deuterium: 100,
                    microchips: 25,
                    science: 25,
                },
                percent_increase_per_level: 300,
            },
            production: {
                base: null,
                percent_increase_per_level: null,
                resource: null,
            },
            prerequisites: {
                structures: [{
                    type: "research_lab",
                    level: 1,
                }],
                technologies: [],
            },
            storage: {
                increase_per_level: null,
                resource: null,
            },
            time: {
                base_seconds: 3600,
                percent_increase_per_level: 200,
                max_seconds: 86400,
            },
            energy_consumption: {
                base: 100,
                percent_increase_per_level: 100,
            },
        },
        {
            type: "defense_factory",
            cost: {
                resources: {
                    metal: 500,
                    deuterium: 100,
                    microchips: 50,
                    science: 25,
                },
                percent_increase_per_level: 100,
            },
            prerequisites: {
                structures: [{
                    type: "research_lab",
                    level: 1,
                }],
                technologies: [],
            },
            production: {
                base: null,
                percent_increase_per_level: null,
                resource: null,
            },
            storage: {
                increase_per_level: null,
                resource: null,
            },
            time: {
                base_seconds: 3600,
                percent_increase_per_level: 500,
                max_seconds: 86400,
            },
            energy_consumption: {
                base: 80,
                percent_increase_per_level: 50,
            },
        },
        {
            type: "metal_hangar",
            cost: {
                resources: {
                    metal: 200,
                    deuterium: 0,
                    microchips: 0,
                    science: 0,
                },
                percent_increase_per_level: 200,
            },
            prerequisites: {
                structures: [{
                    type: "metal_mine",
                    level: 3,
                }],
                technologies: [],
            },
            production: {
                base: null,
                percent_increase_per_level: null,
                resource: null,
            },
            storage: {
                increase_per_level: 2000,
                resource: "metal",
            },
            time: {
                base_seconds: 600, // 10 minutes
                percent_increase_per_level: 300,
                max_seconds: 86400,
            },
            energy_consumption: {
                base: 5,
                percent_increase_per_level: 25,
            },
        },
        {
            type: "deuterium_tank",
            cost: {
                resources: {
                    metal: 200,
                    deuterium: 100,
                    microchips: 0,
                    science: 0,
                },
                percent_increase_per_level: 200,
            },
            prerequisites: {
                structures: [{
                    type: "deuterium_synthesizer",
                    level: 3,
                }],
                technologies: [],
            },
            production: {
                base: null,
                percent_increase_per_level: null,
                resource: null,
            },
            storage: {
                increase_per_level: 500,
                resource: "deuterium",
            },
            time: {
                base_seconds: 600, // 10 minutes
                percent_increase_per_level: 100,
                max_seconds: 86400,
            },
            energy_consumption: {
                base: 10,
                percent_increase_per_level: 25,
            },
        },
        {
            type: "microchip_vault",
            cost: {
                resources: {
                    metal: 300,
                    deuterium: 0,
                    microchips: 100,
                    science: 50,
                },
                percent_increase_per_level: 75,
            },
            prerequisites: {
                structures: [{
                    type: "microchip_factory",
                    level: 5,
                }],
                technologies: [],
            },
            production: {
                base: null,
                percent_increase_per_level: null,
                resource: null,
            },
            storage: {
                increase_per_level: 250,
                resource: "microchips",
            },
            time: {
                base_seconds: 600, // 10 minutes
                percent_increase_per_level: 300,
                max_seconds: 86400,
            },
            energy_consumption: {
                base: 15,
                percent_increase_per_level: 25,
            },
        },
        {
            type: "data_center",
            cost: {
                resources: {
                    metal: 200,
                    deuterium: 100,
                    microchips: 50,
                    science: 25,
                },
                percent_increase_per_level: 75,
            },
            prerequisites: {
                structures: [{
                    type: "research_lab",
                    level: 3,
                }],
                technologies: [],
            },
            production: {
                base: 0,
                percent_increase_per_level: 0,
                resource: null,
            },
            storage: {
                increase_per_level: 100,
                resource: "science",
            },
            time: {
                base_seconds: 600, // 10 minutes
                percent_increase_per_level: 300,
                max_seconds: 86400,
            },
            energy_consumption: {
                base: 100,
                percent_increase_per_level: 200,
            },
        },
    ],
    researchs: [
        {
            id: "metal_production_boost",
            category: "resource",
            max_level: 50,
            prerequisites: [],
            cost: {
                base_metal: 100,
                base_deuterium: 40,
                base_science: 20,
                base_microchips: 10,
                percent_increase_per_level: 75,
            },
            time: {
                base_seconds: 600, // 10 minutes
                percent_increase_per_level: 100,
            },
            effects: [{
                type: "resource_boost",
                target_type: "metal_mine",
                resource_type: "metal",
                value: 5,
                per_level: true,
            }],
        },
        {
            id: "deuterium_production_boost",
            category: "resource",
            max_level: 50,
            prerequisites: [],
            cost: {
                base_metal: 100,
                base_deuterium: 40,
                base_science: 20,
                base_microchips: 10,
                percent_increase_per_level: 75,
            },
            time: {
                base_seconds: 600, // 10 minutes
                percent_increase_per_level: 100,
            },
            effects: [{
                type: "resource_boost",
                target_type: "deuterium_synthesizer",
                resource_type: "deuterium",
                value: 5,
                per_level: true,
            }],
        },
        {
            id: "energy_efficiency",
            category: "resource",
            max_level: 50,
            prerequisites: [],
            cost: {
                base_metal: 120,
                base_deuterium: 60,
                base_science: 30,
                base_microchips: 15,
                percent_increase_per_level: 100,
            },
            time: {
                base_seconds: 600, // 10 minutes
                percent_increase_per_level: 100,
            },
            effects: [{
                type: "resource_boost",
                target_type: "energy_plant",
                resource_type: "energy",
                value: 5,
                per_level: true,
            }],
        },
        {
            id: "microchips_production_boost",
            category: "infrastructure",
            max_level: 50,
            prerequisites: [],
            cost: {
                base_metal: 150,
                base_deuterium: 100,
                base_science: 50,
                base_microchips: 10,
                percent_increase_per_level: 100,
            },
            time: {
                base_seconds: 600, // 10 minutes
                percent_increase_per_level: 100,
            },
            effects: [{
                type: "research_speed",
                value: 10,
                per_level: true,
            }],
        },
        {
            id: "science_production_boost",
            category: "resource",
            max_level: 50,
            prerequisites: [{
                technology_id: "microchips_production_boost",
                required_level: 3,
            }],
            cost: {
                base_metal: 100,
                base_deuterium: 80,
                base_science: 40,
                base_microchips: 50,
                percent_increase_per_level: 100,
            },
            time: {
                base_seconds: 600, // 10 minutes
                percent_increase_per_level: 100,
            },
            effects: [{
                type: "resource_boost",
                target_type: "research_lab",
                resource_type: "science",
                value: 8,
                per_level: true,
            }],
        },

        {
            id: "structures_construction_speed",
            category: "infrastructure",
            max_level: 50,
            prerequisites: [],
            cost: {
                base_metal: 80,
                base_deuterium: 40,
                base_science: 30,
                base_microchips: 20,
                percent_increase_per_level: 50,
            },
            time: {
                base_seconds: 600, // 10 minutes
                percent_increase_per_level: 100,
            },
            effects: [{
                type: "construction_speed",
                value: 5, // 5% faster construction per level
                per_level: true,
            }],
        },
        {
            id: "espionage_tech",
            category: "ship",
            max_level: 10,
            prerequisites: [],
            cost: {
                base_metal: 50,
                base_deuterium: 20,
                base_science: 30,
                base_microchips: 20,
                percent_increase_per_level: 100,
            },
            time: {
                base_seconds: 600, // 10 minutes
                percent_increase_per_level: 100,
            },
            effects: [{
                type: "ship",
                target_type: "spy_probe",
                value: 1,
                per_level: false,
            }],
        },
        {
            id: "transport_tech",
            category: "ship",
            max_level: 10,
            prerequisites: [],
            cost: {
                base_metal: 100,
                base_deuterium: 50,
                base_science: 40,
                base_microchips: 30,
                percent_increase_per_level: 0,
            },
            time: {
                base_seconds: 60,
                percent_increase_per_level: 0,
            },
            effects: [{
                type: "ship",
                target_type: "transport_ship",
                value: 1,
                per_level: false,
            }],
        },
        {
            id: "colonization_tech",
            category: "ship",
            max_level: 1,
            prerequisites: [],
            cost: {
                base_metal: 100,
                base_deuterium: 50,
                base_science: 40,
                base_microchips: 30,
                percent_increase_per_level: 0,
            },
            time: {
                base_seconds: 60,
                percent_increase_per_level: 0,
            },
            effects: [{
                type: "ship",
                target_type: "colony_ship",
                value: 1,
                per_level: false,
            }],
        },
        {
            id: "combat_tech",
            category: "ship",
            max_level: 1,
            prerequisites: [],
            cost: {
                base_metal: 150,
                base_deuterium: 75,
                base_science: 60,
                base_microchips: 45,
                percent_increase_per_level: 0,
            },
            time: {
                base_seconds: 60,
                percent_increase_per_level: 0,
            },
            effects: [{
                type: "ship",
                target_type: "cruiser",
                value: 1,
                per_level: false,
            }],
        },
    ],
    ships: [
        {
            type: "colony_ship",
            cost: {
                metal: 1000,
                deuterium: 500,
                microchips: 200,
                science: 100,
            },
            stats: {
                speed: { min: 0.5, max: 1 },
                cargo_capacity: { min: 500, max: 1000 },
                attack_power: { min: 5, max: 10 },
                defense: { min: 30, max: 40 },
            },
            construction_time: 300, // 5 minutes
            requirements: {
                shipyard_level: 4,
                technologies: [{
                    id: "colonization_tech",
                    level: 1,
                }],
            },
        },
        {
            type: "transport_ship",
            cost: {
                metal: 500,
                deuterium: 250,
                microchips: 100,
                science: 100,
            },
            stats: {
                speed: { min: 1, max: 1.5 },
                cargo_capacity: { min: 1000, max: 3000 },
                attack_power: { min: 4, max: 6 },
                defense: { min: 10, max: 30 },
            },
            construction_time: 300, // 5 minutes
            requirements: {
                shipyard_level: 2,
                technologies: [{
                    id: "transport_tech",
                    level: 1,
                }],
            },
        },
        {
            type: "spy_probe",
            cost: {
                metal: 50,
                deuterium: 50,
                microchips: 10,
                science: 5,
            },
            stats: {
                speed: { min: 20, max: 30 },
                cargo_capacity: { min: 0, max: 0 },
                attack_power: { min: 0, max: 0 },
                defense: { min: 1, max: 1 },
            },
            construction_time: 60, // 1 minute
            requirements: {
                shipyard_level: 1,
                technologies: [{
                    id: "espionage_tech",
                    level: 1,
                }],
            },
        },
        {
            type: "recycler_ship",
            cost: {
                metal: 200,
                deuterium: 150,
                microchips: 10,
                science: 5,
            },
            stats: {
                speed: { min: 0.5, max: 1 },
                cargo_capacity: { min: 1000, max: 2000 },
                attack_power: { min: 1, max: 1 },
                defense: { min: 18, max: 22 },
            },
            construction_time: 600, // 10 minutes
            requirements: {
                shipyard_level: 3,
                technologies: [],
            },
        },
        {
            type: "cruiser",
            cost: {
                metal: 500,
                deuterium: 250,
                microchips: 50,
                science: 10,
            },
            stats: {
                speed: { min: 2, max: 3 },
                cargo_capacity: { min: 10, max: 50 },
                attack_power: { min: 50, max: 100 },
                defense: { min: 50, max: 100 },
            },
            construction_time: 600, // 10 minutes
            requirements: {
                shipyard_level: 5,
                technologies: [{
                    id: "combat_tech",
                    level: 1,
                }],
            },
        },
    ],
    defenses: [
        {
            type: "missile_launcher",
            cost: {
                metal: 200,
                deuterium: 50,
                microchips: 10,
                science: 0,
            },
            stats: {
                attack_power: 80,
                defense: 20,
                shield: 0,
            },
            construction_time: 200,
            requirements: {
                defense_factory_level: 1,
                technologies: [],
            },
        },
        {
            type: "light_laser",
            cost: {
                metal: 300,
                deuterium: 100,
                microchips: 25,
                science: 10,
            },
            stats: {
                attack_power: 100,
                defense: 25,
                shield: 10,
            },
            construction_time: 400,
            requirements: {
                defense_factory_level: 2,
                technologies: [],
            },
        },
        {
            type: "heavy_laser",
            cost: {
                metal: 600,
                deuterium: 200,
                microchips: 50,
                science: 20,
            },
            stats: {
                attack_power: 250,
                defense: 100,
                shield: 25,
            },
            construction_time: 800,
            requirements: {
                defense_factory_level: 4,
                technologies: [],
            },
        },
        {
            type: "gauss_cannon",
            cost: {
                metal: 1000,
                deuterium: 400,
                microchips: 100,
                science: 50,
            },
            stats: {
                attack_power: 500,
                defense: 200,
                shield: 50,
            },
            construction_time: 1200,
            requirements: {
                defense_factory_level: 6,
                technologies: [],
            },
        },
        {
            type: "ion_cannon",
            cost: {
                metal: 1000,
                deuterium: 500,
                microchips: 100,
                science: 50,
            },
            stats: {
                attack_power: 500,
                defense: 200,
                shield: 50,
            },
            construction_time: 1200,
            requirements: {
                defense_factory_level: 6,
                technologies: [],
            },
        },
        {
            type: "plasma_turret",
            cost: {
                metal: 1000,
                deuterium: 500,
                microchips: 100,
                science: 50,
            },
            stats: {
                attack_power: 500,
                defense: 200,
                shield: 50,
            },
            construction_time: 1200,
            requirements: {
                defense_factory_level: 6,
                technologies: [],
            },
        },
        {
            type: "small_shield_dome",
            cost: {
                metal: 1000,
                deuterium: 500,
                microchips: 100,
                science: 50,
            },
            stats: {
                attack_power: 0,
                defense: 200,
                shield: 50,
            },
            construction_time: 1200,
            requirements: {
                defense_factory_level: 6,
                technologies: [],
            },
        },
        {
            type: "large_shield_dome",
            cost: {
                metal: 1000,
                deuterium: 500,
                microchips: 100,
                science: 50,
            },
            stats: {
                attack_power: 0,
                defense: 200,
                shield: 50,
            },
            construction_time: 1200,
            requirements: {
                defense_factory_level: 6,
                technologies: [],
            },
        },
    ],
};
