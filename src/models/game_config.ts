import { StructureConfig } from "./structure_config";
import { ResearchConfig } from "./researchs_config";
import { ShipConfig } from "./ship_config";
import { PlanetBiome } from "./planet";

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
}

// Default configuration values
export const DEFAULT_GAME_CONFIG: GameConfig = {
    speed: {
        resources: 1,
        researchs: 1,
        ships: 1,
        construction: 1,
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
                base_seconds: 10,
                percent_increase_per_level: 75,
                max_seconds: 86400,
            },
            energy_consumption: {
                base: 10,
                percent_increase_per_level: 40,
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
                base_seconds: 30,
                percent_increase_per_level: 25,
                max_seconds: 86400,
            },
            energy_consumption: {
                base: 0,
                percent_increase_per_level: 0,
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
                    metal: 100,
                    deuterium: 0,
                    microchips: 0,
                    science: 0,
                },
                percent_increase_per_level: 70,
            },
            production: {
                base: 0.5,
                percent_increase_per_level: 50,
                resource: "deuterium",
            },
            storage: {
                increase_per_level: null,
                resource: null,
            },
            time: {
                base_seconds: 30,
                percent_increase_per_level: 50,
                max_seconds: 86400,
            },
            energy_consumption: {
                base: 20,
                percent_increase_per_level: 75,
            },
        },
        {
            type: "microchip_factory",
            cost: {
                resources: {
                    metal: 300,
                    deuterium: 0,
                    microchips: 0,
                    science: 25,
                },
                percent_increase_per_level: 50,
            },
            prerequisites: {
                structures: [{
                    type: "research_lab",
                    level: 1,
                }],
                technologies: [],
            },
            production: {
                base: 0.5,
                percent_increase_per_level: 100,
                resource: "microchips",
            },
            storage: {
                increase_per_level: null,
                resource: null,
            },
            time: {
                base_seconds: 300,
                percent_increase_per_level: 500,
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
                    metal: 200,
                    deuterium: 100,
                    microchips: 0,
                    science: 0,
                },
                percent_increase_per_level: 80,
            },
            production: {
                base: 2,
                percent_increase_per_level: 50,
                resource: "science",
            },
            storage: {
                increase_per_level: null,
                resource: null,
            },
            time: {
                base_seconds: 60,
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
                    metal: 1000,
                    deuterium: 200,
                    microchips: 50,
                    science: 50,
                },
                percent_increase_per_level: 60,
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
                base_seconds: 300,
                percent_increase_per_level: 500,
                max_seconds: 86400,
            },
            energy_consumption: {
                base: 100,
                percent_increase_per_level: 50,
            },
        },
        {
            type: "defense_factory",
            cost: {
                resources: {
                    metal: 2000,
                    deuterium: 300,
                    microchips: 150,
                    science: 40,
                },
                percent_increase_per_level: 50,
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
                    metal: 3000,
                    deuterium: 0,
                    microchips: 0,
                    science: 0,
                },
                percent_increase_per_level: 75,
            },
            prerequisites: {
                structures: [{
                    type: "metal_mine",
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
                increase_per_level: 15000,
                resource: "metal",
            },
            time: {
                base_seconds: 60,
                percent_increase_per_level: 100,
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
                    metal: 1500,
                    deuterium: 500,
                    microchips: 0,
                    science: 0,
                },
                percent_increase_per_level: 75,
            },
            prerequisites: {
                structures: [{
                    type: "deuterium_synthesizer",
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
                increase_per_level: 5000,
                resource: "deuterium",
            },
            time: {
                base_seconds: 60,
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
                    metal: 2000,
                    deuterium: 0,
                    microchips: 500,
                    science: 100,
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
                increase_per_level: 2500,
                resource: "microchips",
            },
            time: {
                base_seconds: 1200,
                percent_increase_per_level: 50,
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
                    metal: 2500,
                    deuterium: 1000,
                    microchips: 1000,
                    science: 250,
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
                increase_per_level: 1000,
                resource: "science",
            },
            time: {
                base_seconds: 1500,
                percent_increase_per_level: 50,
                max_seconds: 86400,
            },
            energy_consumption: {
                base: 100,
                percent_increase_per_level: 25,
            },
        },
    ],
    researchs: [
        {
            id: "transport_tech",
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
        {
            id: "deuterium_production_boost",
            category: "resource",
            max_level: 10,
            prerequisites: [],
            cost: {
                base_metal: 100,
                base_deuterium: 40,
                base_science: 20,
                base_microchips: 10,
                percent_increase_per_level: 75,
            },
            time: {
                base_seconds: 30,
                percent_increase_per_level: 50,
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
            id: "metal_production_boost",
            category: "resource",
            max_level: 10,
            prerequisites: [],
            cost: {
                base_metal: 100,
                base_deuterium: 40,
                base_science: 20,
                base_microchips: 10,
                percent_increase_per_level: 75,
            },
            time: {
                base_seconds: 30,
                percent_increase_per_level: 50,
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
            id: "energy_efficiency",
            category: "resource",
            max_level: 10,
            prerequisites: [],
            cost: {
                base_metal: 120,
                base_deuterium: 60,
                base_science: 30,
                base_microchips: 15,
                percent_increase_per_level: 75,
            },
            time: {
                base_seconds: 30,
                percent_increase_per_level: 50,
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
            id: "science_production_boost",
            category: "resource",
            max_level: 10,
            prerequisites: [{
                technology_id: "microchips_production_boost",
                required_level: 3,
            }],
            cost: {
                base_metal: 100,
                base_deuterium: 80,
                base_science: 40,
                base_microchips: 50,
                percent_increase_per_level: 75,
            },
            time: {
                base_seconds: 30,
                percent_increase_per_level: 50,
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
            id: "microchips_production_boost",
            category: "infrastructure",
            max_level: 10,
            prerequisites: [],
            cost: {
                base_metal: 150,
                base_deuterium: 100,
                base_science: 50,
                base_microchips: 10,
                percent_increase_per_level: 50,
            },
            time: {
                base_seconds: 30,
                percent_increase_per_level: 50,
            },
            effects: [{
                type: "research_speed",
                value: 10,
                per_level: true,
            }],
        },
        {
            id: "espionage_tech",
            category: "ship",
            max_level: 1,
            prerequisites: [],
            cost: {
                base_metal: 50,
                base_deuterium: 20,
                base_science: 30,
                base_microchips: 20,
                percent_increase_per_level: 0,
            },
            time: {
                base_seconds: 30,
                percent_increase_per_level: 0,
            },
            effects: [{
                type: "ship",
                target_type: "spy_probe",
                value: 1,
                per_level: false,
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
                base_seconds: 30,
                percent_increase_per_level: 50,
            },
            effects: [{
                type: "construction_speed",
                value: 10, // 10% faster construction per level
                per_level: true,
            }],
        },
    ],
    ships: [
        {
            type: "colony_ship",
            cost: {
                metal: 1000,
                deuterium: 5000,
                microchips: 2000,
                science: 1000,
            },
            stats: {
                speed: { min: 0.5, max: 1 },
                cargo_capacity: { min: 1000, max: 2000 },
                attack_power: { min: 8, max: 12 },
                defense: { min: 45, max: 55 },
            },
            construction_time: 3600, // 1 hour
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
                metal: 6000,
                deuterium: 3000,
                microchips: 1000,
                science: 500,
            },
            stats: {
                speed: { min: 0.5, max: 1.5 },
                cargo_capacity: { min: 3000, max: 10000 },
                attack_power: { min: 4, max: 6 },
                defense: { min: 22, max: 28 },
            },
            construction_time: 3600, // 1 hour
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
                metal: 1000,
                deuterium: 1000,
                microchips: 500,
                science: 250,
            },
            stats: {
                speed: { min: 10, max: 20 },
                cargo_capacity: { min: 0, max: 0 },
                attack_power: { min: 0, max: 0 },
                defense: { min: 1, max: 1 },
            },
            construction_time: 600, // 10 minutes
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
                metal: 8000,
                deuterium: 4000,
                microchips: 1500,
                science: 750,
            },
            stats: {
                speed: { min: 0.5, max: 1 },
                cargo_capacity: { min: 18000, max: 22000 },
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
                metal: 15000,
                deuterium: 7500,
                microchips: 3000,
                science: 1500,
            },
            stats: {
                speed: { min: 3, max: 5 },
                cargo_capacity: { min: 800, max: 1200 },
                attack_power: { min: 380, max: 420 },
                defense: { min: 180, max: 220 },
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
};
