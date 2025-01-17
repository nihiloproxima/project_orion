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
    "ships": [
        {
            "cost": {
                "metal": 1000,
                "deuterium": 500,
                "microchips": 50,
            },
            "type": "colony_ship",
            "stats": {
                "speed": {
                    "max": 1,
                    "min": 0.5,
                },
                "defense": {
                    "max": 40,
                    "min": 30,
                },
                "attack_power": {
                    "max": 10,
                    "min": 5,
                },
                "cargo_capacity": {
                    "max": 1000,
                    "min": 500,
                },
            },
            "requirements": {
                "technologies": [
                    {
                        "id": "colonization_tech",
                        "level": 1,
                    },
                ],
                "shipyard_level": 4,
            },
            "construction_time": 3600,
        },
        {
            "cost": {
                "metal": 500,
                "deuterium": 250,
                "microchips": 25,
            },
            "type": "transport_ship",
            "stats": {
                "speed": {
                    "max": 1.5,
                    "min": 1,
                },
                "defense": {
                    "max": 50,
                    "min": 10,
                },
                "attack_power": {
                    "max": 3,
                    "min": 1,
                },
                "cargo_capacity": {
                    "max": 3000,
                    "min": 1000,
                },
            },
            "requirements": {
                "technologies": [
                    {
                        "id": "transport_tech",
                        "level": 1,
                    },
                ],
                "shipyard_level": 2,
            },
            "construction_time": 600,
        },
        {
            "cost": {
                "metal": 100,
                "deuterium": 50,
                "microchips": 10,
            },
            "type": "spy_probe",
            "stats": {
                "speed": {
                    "max": 30,
                    "min": 20,
                },
                "defense": {
                    "max": 1,
                    "min": 1,
                },
                "attack_power": {
                    "max": 0,
                    "min": 0,
                },
                "cargo_capacity": {
                    "max": 0,
                    "min": 0,
                },
            },
            "requirements": {
                "technologies": [
                    {
                        "id": "espionage_tech",
                        "level": 1,
                    },
                ],
                "shipyard_level": 1,
            },
            "construction_time": 300,
        },
        {
            "cost": {
                "metal": 200,
                "deuterium": 150,
                "microchips": 10,
            },
            "type": "recycler_ship",
            "stats": {
                "speed": {
                    "max": 1,
                    "min": 0.5,
                },
                "defense": {
                    "max": 22,
                    "min": 18,
                },
                "attack_power": {
                    "max": 1,
                    "min": 1,
                },
                "cargo_capacity": {
                    "max": 2000,
                    "min": 1000,
                },
            },
            "requirements": {
                "technologies": [],
                "shipyard_level": 3,
            },
            "construction_time": 600,
        },
        {
            "cost": {
                "metal": 500,
                "deuterium": 250,
                "microchips": 50,
            },
            "type": "cruiser",
            "stats": {
                "speed": {
                    "max": 3,
                    "min": 2,
                },
                "defense": {
                    "max": 100,
                    "min": 50,
                },
                "attack_power": {
                    "max": 100,
                    "min": 50,
                },
                "cargo_capacity": {
                    "max": 50,
                    "min": 10,
                },
            },
            "requirements": {
                "technologies": [
                    {
                        "id": "combat_tech",
                        "level": 1,
                    },
                ],
                "shipyard_level": 5,
            },
            "construction_time": 1500, // 25 minutes
        },
        {
            "cost": {
                "metal": 3000,
                "deuterium": 500,
                "microchips": 80,
            },
            "type": "destroyer",
            "stats": {
                "speed": {
                    "max": 2,
                    "min": 1.5,
                },
                "defense": {
                    "max": 500,
                    "min": 250,
                },
                "attack_power": {
                    "max": 125,
                    "min": 75,
                },
                "cargo_capacity": {
                    "max": 1000,
                    "min": 250,
                },
            },
            "requirements": {
                "technologies": [
                    {
                        "id": "combat_tech",
                        "level": 5,
                    },
                ],
                "shipyard_level": 7,
            },
            "construction_time": 3600, // 1 hour
        },
    ],
    "speed": {
        "ships": 1,
        "researchs": 1,
        "resources": 1,
        "construction": 1,
    },
    "planets": {
        "count": 500,
        "size_max": 10000,
        "size_min": 1000,
        "grid_size": 10000,
        "biome_distribution": {
            "ice": 1,
            "ocean": 1,
            "desert": 1,
            "jungle": 1,
            "volcanic": 1,
        },
    },
    "defenses": [
        {
            "cost": {
                "metal": 100,
                "deuterium": 25,
                "microchips": 10,
            },
            "type": "light_laser",
            "stats": {
                "shield": 0,
                "defense": 1,
                "attack_power": 5,
            },
            "requirements": {
                "technologies": [],
                "defense_factory_level": 1,
            },
            "construction_time": 300, // 5 minutes
        },
        {
            "cost": {
                "metal": 500,
                "deuterium": 50,
                "microchips": 10,
            },
            "type": "missile_launcher",
            "stats": {
                "shield": 0,
                "defense": 10,
                "attack_power": 5,
            },
            "requirements": {
                "technologies": [],
                "defense_factory_level": 2,
            },
            "construction_time": 600, // 10 minutes
        },
        {
            "cost": {
                "metal": 600,
                "deuterium": 200,
                "microchips": 25,
            },

            "type": "heavy_laser",
            "stats": {
                "shield": 10,
                "defense": 30,
                "attack_power": 15,
            },
            "requirements": {
                "technologies": [],
                "defense_factory_level": 4,
            },
            "construction_time": 900, // 15 minutes
        },
        {
            "cost": {
                "metal": 1000,
                "deuterium": 400,
                "microchips": 100,
            },
            "type": "gauss_cannon",
            "stats": {
                "shield": 25,
                "defense": 1,
                "attack_power": 25,
            },
            "requirements": {
                "technologies": [],
                "defense_factory_level": 6,
            },
            "construction_time": 1200, // 20 minutes
        },
        {
            "cost": {
                "metal": 2000,
                "deuterium": 500,
                "microchips": 100,
            },
            "type": "ion_cannon",
            "stats": {
                "shield": 25,
                "defense": 10,
                "attack_power": 50,
            },
            "requirements": {
                "technologies": [],
                "defense_factory_level": 6,
            },
            "construction_time": 1200, // 20 minutes
        },
        {
            "cost": {
                "metal": 1000,
                "deuterium": 500,
                "microchips": 100,
            },
            "type": "plasma_turret",
            "stats": {
                "shield": 0,
                "defense": 20,
                "attack_power": 100,
            },
            "requirements": {
                "technologies": [],
                "defense_factory_level": 7,
            },
            "construction_time": 2100, // 35 minutes
        },
        {
            "cost": {
                "metal": 1000,
                "deuterium": 500,
                "microchips": 100,
            },
            "type": "small_shield_dome",
            "stats": {
                "shield": 200,
                "defense": 0,
                "attack_power": 0,
            },
            "requirements": {
                "technologies": [],
                "defense_factory_level": 8,
            },
            "construction_time": 2100, // 35 minutes
        },
        {
            "cost": {
                "metal": 0,
                "deuterium": 1000,
                "microchips": 500,
            },
            "type": "large_shield_dome",
            "stats": {
                "shield": 500,
                "defense": 0,
                "attack_power": 0,
            },
            "requirements": {
                "technologies": [],
                "defense_factory_level": 10,
            },
            "construction_time": 3600, // 1 hour
        },
    ],
    "researchs": [
        {
            "id": "metal_production_boost",
            "cost": {
                "base_metal": 0,
                "base_deuterium": 60,
                "base_microchips": 5,
                "percent_increase_per_level": 50,
            },
            "time": {
                "base_seconds": 5, // 5 seconds
                "percent_increase_per_level": 100,
            },
            "effects": [
                {
                    "type": "resource_boost",
                    "value": 5,
                    "per_level": true,
                    "target_type": "metal_mine",
                    "resource_type": "metal",
                },
            ],
            "category": "resource",
            "max_level": 50,
            "prerequisites": [],
        },
        {
            "id": "deuterium_production_boost",
            "cost": {
                "base_metal": 0,
                "base_deuterium": 60,
                "base_microchips": 5,
                "percent_increase_per_level": 50,
            },
            "time": {
                "base_seconds": 5, // 5 seconds
                "percent_increase_per_level": 100,
            },
            "effects": [
                {
                    "type": "resource_boost",
                    "value": 5,
                    "per_level": true,
                    "target_type": "deuterium_synthesizer",
                    "resource_type": "deuterium",
                },
            ],
            "category": "resource",
            "max_level": 50,
            "prerequisites": [],
        },
        {
            "id": "energy_efficiency",
            "cost": {
                "base_metal": 0,
                "base_deuterium": 60,
                "base_microchips": 5,
                "percent_increase_per_level": 50,
            },
            "time": {
                "base_seconds": 5, // 30 minutes
                "percent_increase_per_level": 100,
            },
            "effects": [
                {
                    "type": "resource_boost",
                    "value": 5,
                    "per_level": true,
                    "target_type": "energy_plant",
                    "resource_type": "energy",
                },
            ],
            "category": "resource",
            "max_level": 50,
            "prerequisites": [],
        },
        {
            "id": "microchips_production_boost",
            "cost": {
                "base_metal": 0,
                "base_deuterium": 60,
                "base_microchips": 5,
                "percent_increase_per_level": 50,
            },
            "time": {
                "base_seconds": 5, // 5 seconds
                "percent_increase_per_level": 100,
            },
            "effects": [
                {
                    "type": "resource_boost",
                    "value": 5,
                    "per_level": true,
                    "target_type": "microchip_factory",
                    "resource_type": "microchips",
                },
            ],
            "category": "infrastructure",
            "max_level": 50,
            "prerequisites": [],
        },
        {
            "id": "structures_construction_speed",
            "cost": {
                "base_metal": 0,
                "base_deuterium": 60,
                "base_microchips": 5,
                "percent_increase_per_level": 50,
            },
            "time": {
                "base_seconds": 5, // 30 minutes
                "percent_increase_per_level": 100,
            },
            "effects": [
                {
                    "type": "construction_speed",
                    "value": 5,
                    "per_level": true,
                },
            ],
            "category": "infrastructure",
            "max_level": 50,
            "prerequisites": [],
        },
        {
            "id": "espionage_tech",
            "cost": {
                "base_metal": 0,
                "base_deuterium": 100,
                "base_microchips": 5,
                "percent_increase_per_level": 100,
            },
            "time": {
                "base_seconds": 10, // 10 seconds
                "percent_increase_per_level": 100,
            },
            "effects": [
                {
                    "type": "ship",
                    "value": 1,
                    "per_level": false,
                    "target_type": "spy_probe",
                },
            ],
            "category": "ship",
            "max_level": 10,
            "prerequisites": [],
        },
        {
            "id": "transport_tech",
            "cost": {
                "base_metal": 0,
                "base_deuterium": 250,
                "base_microchips": 10,
                "percent_increase_per_level": 0,
            },
            "time": {
                "base_seconds": 5, // 5 seconds
                "percent_increase_per_level": 100,
            },
            "effects": [
                {
                    "type": "ship",
                    "value": 1,
                    "per_level": false,
                    "target_type": "transport_ship",
                },
            ],
            "category": "ship",
            "max_level": 10,
            "prerequisites": [],
        },
        {
            "id": "colonization_tech",
            "cost": {
                "base_metal": 0,
                "base_deuterium": 500,
                "base_microchips": 50,
                "percent_increase_per_level": 500,
            },
            "time": {
                "base_seconds": 30, // 30 seconds
                "percent_increase_per_level": 500,
            },
            "effects": [
                {
                    "type": "ship",
                    "value": 1,
                    "per_level": false,
                    "target_type": "colony_ship",
                },
            ],
            "category": "ship",
            "max_level": 10,
            "prerequisites": [],
        },
        {
            "id": "combat_tech",
            "cost": {
                "base_metal": 0,
                "base_deuterium": 1000,
                "base_microchips": 50,
                "percent_increase_per_level": 200,
            },
            "time": {
                "base_seconds": 5, // 5 seconds
                "percent_increase_per_level": 200,
            },
            "effects": [
                {
                    "type": "ship",
                    "value": 1,
                    "per_level": false,
                    "target_type": "cruiser",
                },
                {
                    "type": "ship",
                    "value": 5,
                    "per_level": false,
                    "target_type": "destroyer",
                },
            ],
            "category": "ship",
            "max_level": 5,
            "prerequisites": [],
        },
    ],
    "structures": [
        {
            "cost": {
                "resources": {
                    "metal": 50,
                    "deuterium": 0,
                    "microchips": 0,
                },
                "percent_increase_per_level": 150,
            },
            "time": {
                "max_seconds": 86400,
                "base_seconds": 5, // 5 seconds
                "percent_increase_per_level": 100,
            },
            "type": "metal_mine",
            "storage": {
                "resource": null,
                "increase_per_level": null,
            },
            "production": {
                "base": 1,
                "resource": "metal",
                "percent_increase_per_level": 100,
            },
            "prerequisites": {
                "structures": [],
                "technologies": [],
            },
            "energy_consumption": {
                "base": 10,
                "percent_increase_per_level": 60,
            },
            max_level: 50,
        },
        {
            "cost": {
                "resources": {
                    "metal": 60,
                    "deuterium": 0,
                    "microchips": 0,
                },
                "percent_increase_per_level": 150,
            },
            "time": {
                "max_seconds": 86400,
                "base_seconds": 5, // 5 seconds
                "percent_increase_per_level": 100,
            },
            "type": "deuterium_synthesizer",
            "storage": {
                "resource": null,
                "increase_per_level": null,
            },
            "production": {
                "base": 0.4,
                "resource": "deuterium",
                "percent_increase_per_level": 100,
            },
            "prerequisites": {
                "structures": [
                    {
                        "type": "metal_mine",
                        "level": 1,
                    },
                ],
                "technologies": [],
            },
            "energy_consumption": {
                "base": 15,
                "percent_increase_per_level": 60,
            },
            max_level: 50,
        },
        {
            "cost": {
                "resources": {
                    "metal": 150,
                    "deuterium": 0,
                    "microchips": 0,
                },
                "percent_increase_per_level": 150,
            },
            "time": {
                "max_seconds": 86400,
                "base_seconds": 5, // 5 seconds
                "percent_increase_per_level": 100,
            },
            "type": "energy_plant",
            "storage": {
                "resource": null,
                "increase_per_level": null,
            },
            "production": {
                "base": 100,
                "resource": "energy",
                "percent_increase_per_level": 200,
            },
            "prerequisites": {
                "structures": [
                    {
                        "type": "deuterium_synthesizer",
                        "level": 1,
                    },
                ],
                "technologies": [],
            },
            "energy_consumption": {
                "base": 0,
                "percent_increase_per_level": 0,
            },
            max_level: 50,
        },
        {
            "type": "microchip_factory",
            "cost": {
                "resources": {
                    "metal": 100,
                    "deuterium": 50,
                    "microchips": 0,
                },
                "percent_increase_per_level": 150,
            },
            "time": {
                "max_seconds": 86400,
                "base_seconds": 5, // 5 seconds
                "percent_increase_per_level": 100,
            },
            "storage": {
                "resource": null,
                "increase_per_level": null,
            },
            "production": {
                "base": 0.04,
                "resource": "microchips",
                "percent_increase_per_level": 100,
            },
            "prerequisites": {
                "structures": [
                    {
                        "type": "research_lab",
                        "level": 1,
                    },
                ],
                "technologies": [],
            },
            "energy_consumption": {
                "base": 50,
                "percent_increase_per_level": 100,
            },
            max_level: 50,
        },
        {
            "type": "research_lab",
            "cost": {
                "resources": {
                    "metal": 150,
                    "deuterium": 200,
                    "microchips": 0,
                },
                "percent_increase_per_level": 250,
            },
            "time": {
                "max_seconds": 86400,
                "base_seconds": 10, // 10 seconds
                "percent_increase_per_level": 300,
            },
            "storage": {
                "resource": null,
                "increase_per_level": null,
            },
            "production": {
                "base": null,
                "resource": null,
                "percent_increase_per_level": 5,
            },
            "prerequisites": {
                "structures": [
                    {
                        "type": "energy_plant",
                        "level": 1,
                    },
                ],
                "technologies": [],
            },
            "energy_consumption": {
                "base": 50,
                "percent_increase_per_level": 100,
            },
            max_level: 15,
        },
        {
            "type": "shipyard",
            "cost": {
                "resources": {
                    "metal": 300,
                    "deuterium": 100,
                    "microchips": 0,
                },
                "percent_increase_per_level": 250,
            },
            "time": {
                "max_seconds": 86400,
                "base_seconds": 10, // 10 seconds
                "percent_increase_per_level": 300,
            },
            "storage": {
                "resource": null,
                "increase_per_level": null,
            },
            "production": {
                "base": null,
                "resource": null,
                "percent_increase_per_level": 5,
            },
            "prerequisites": {
                "structures": [
                    {
                        "type": "research_lab",
                        "level": 1,
                    },
                ],
                "technologies": [],
            },
            "energy_consumption": {
                "base": 50,
                "percent_increase_per_level": 100,
            },
            max_level: 15,
        },
        {
            "type": "defense_factory",
            "cost": {
                "resources": {
                    "metal": 500,
                    "deuterium": 100,
                    "microchips": 0,
                },
                "percent_increase_per_level": 150,
            },
            "time": {
                "max_seconds": 86400,
                "base_seconds": 10, // 10 seconds
                "percent_increase_per_level": 300,
            },
            "storage": {
                "resource": null,
                "increase_per_level": null,
            },
            "production": {
                "base": null,
                "resource": null,
                "percent_increase_per_level": 5,
            },
            "prerequisites": {
                "structures": [
                    {
                        "type": "research_lab",
                        "level": 1,
                    },
                ],
                "technologies": [],
            },
            "energy_consumption": {
                "base": 50,
                "percent_increase_per_level": 100,
            },
            max_level: 15,
        },
        {
            "type": "metal_hangar",
            "cost": {
                "resources": {
                    "metal": 200,
                    "deuterium": 0,
                    "microchips": 0,
                },
                "percent_increase_per_level": 200,
            },
            "time": {
                "max_seconds": 86400,
                "base_seconds": 10, // 10 seconds
                "percent_increase_per_level": 300,
            },
            "storage": {
                "resource": "metal",
                "increase_per_level": 5000,
            },
            "production": {
                "base": null,
                "resource": null,
                "percent_increase_per_level": null,
            },
            "prerequisites": {
                "structures": [
                    {
                        "type": "metal_mine",
                        "level": 5,
                    },
                ],
                "technologies": [],
            },
            "energy_consumption": {
                "base": 5,
                "percent_increase_per_level": 25,
            },
            max_level: null,
        },
        {
            "type": "deuterium_tank",
            "cost": {
                "resources": {
                    "metal": 200,
                    "deuterium": 100,
                    "microchips": 0,
                },
                "percent_increase_per_level": 100,
            },
            "time": {
                "max_seconds": 86400,
                "base_seconds": 10, // 10 seconds
                "percent_increase_per_level": 200,
            },
            "storage": {
                "resource": "deuterium",
                "increase_per_level": 1000,
            },
            "production": {
                "base": null,
                "resource": null,
                "percent_increase_per_level": null,
            },
            "prerequisites": {
                "structures": [
                    {
                        "type": "deuterium_synthesizer",
                        "level": 3,
                    },
                ],
                "technologies": [],
            },
            "energy_consumption": {
                "base": 10,
                "percent_increase_per_level": 25,
            },
            max_level: null,
        },
        {
            "type": "microchip_vault",
            "cost": {
                "resources": {
                    "metal": 300,
                    "deuterium": 150,
                    "microchips": 0,
                },
                "percent_increase_per_level": 75,
            },
            "time": {
                "max_seconds": 86400,
                "base_seconds": 10, // 10 seconds
                "percent_increase_per_level": 200,
            },
            "storage": {
                "resource": "microchips",
                "increase_per_level": 250,
            },
            "production": {
                "base": null,
                "resource": null,
                "percent_increase_per_level": null,
            },
            "prerequisites": {
                "structures": [
                    {
                        "type": "microchip_factory",
                        "level": 5,
                    },
                ],
                "technologies": [],
            },
            "energy_consumption": {
                "base": 15,
                "percent_increase_per_level": 50,
            },
            max_level: null,
        },
    ],
};
