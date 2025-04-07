import { GameConfig } from 'shared-types';
import { Timestamp } from 'firebase-admin/firestore';

export const BASE_POINTS = 100;
export const GROWTH_FACTOR = 1.5;

// Default configuration values
export const DEFAULT_GAME_CONFIG: GameConfig = {
	version: '0.0.3',
	season: {
		current: 1,
		next_start_at: Timestamp.fromMillis(Date.now() + 1000 * 60 * 60 * 24 * 30), // 1 month
		end_at: Timestamp.fromMillis(Date.now() + 1000 * 60 * 60 * 24 * 30 * 12), // 1 year
	},
	user_tasks: {
		refresh_interval_seconds: 3600,
	},
	ships: [
		{
			type: 'spy_probe',
			initiative: 1,
			capacity: 1,
			attack: 0,
			defense: 0,
			speed: 5,
			requirements: [
				{
					type: 'technology',
					id: 'espionage_tech',
					level: 1,
				},
			],
			evasion: 0,
			accuracy: 0,
			critical_chance: 0,
			fire_rate: 0,
			construction: {
				metal: 100,
				microchips: 100,
				seconds: 10,
			},
		},
		{
			type: 'recycler',
			initiative: 1,
			capacity: 1,
			attack: 0,
			requirements: [],
			defense: 0,
			speed: 1,
			evasion: 0,
			accuracy: 0,
			critical_chance: 0,
			fire_rate: 0,
			construction: {
				metal: 100,
				microchips: 100,
				seconds: 10,
			},
		},
		{
			type: 'transporter',
			initiative: 1,
			capacity: 1,
			attack: 0,
			requirements: [
				{
					type: 'technology',
					id: 'transport_tech',
					level: 1,
				},
			],
			defense: 0,
			speed: 1,
			evasion: 0,
			accuracy: 0,
			critical_chance: 0,
			fire_rate: 0,
			construction: {
				metal: 100,
				microchips: 100,
				seconds: 10,
			},
		},
		{
			type: 'colonizer',
			initiative: 1,
			capacity: 1,
			attack: 0,
			requirements: [
				{
					type: 'technology',
					id: 'colonization_tech',
					level: 1,
				},
			],
			defense: 0,
			speed: 1,
			evasion: 0,
			accuracy: 0,
			critical_chance: 0,
			fire_rate: 0,
			construction: {
				metal: 100,
				microchips: 100,
				seconds: 10,
			},
		},
		{
			type: 'battleship',
			initiative: 1,
			capacity: 1,
			requirements: [
				{
					type: 'technology',
					id: 'combat_tech',
					level: 3,
				},
			],
			attack: 10,
			defense: 10,
			speed: 2,
			evasion: 0,
			accuracy: 0,
			critical_chance: 0,
			fire_rate: 0,
			construction: {
				metal: 100,
				microchips: 100,
				seconds: 10,
			},
		},
		{
			type: 'cruiser',
			initiative: 1,
			capacity: 1,
			requirements: [
				{
					type: 'technology',
					id: 'combat_tech',
					level: 1,
				},
			],
			attack: 5,
			defense: 5,
			speed: 3,
			evasion: 60,
			accuracy: 80,
			critical_chance: 0,
			fire_rate: 2,
			construction: {
				metal: 5000,
				microchips: 500,
				seconds: 1800,
			},
		},
		{
			type: 'destroyer',
			initiative: 1,
			capacity: 1,
			requirements: [
				{
					type: 'technology',
					id: 'combat_tech',
					level: 5,
				},
			],
			attack: 50,
			defense: 50,
			speed: 4,
			evasion: 30,
			accuracy: 65,
			critical_chance: 0,
			fire_rate: 3,
			construction: {
				metal: 5000,
				microchips: 500,
				seconds: 1800,
			},
		},
		{
			type: 'interceptor',
			initiative: 1,
			capacity: 1,
			requirements: [
				{
					type: 'technology',
					id: 'combat_tech',
					level: 5,
				},
			],
			attack: 50,
			defense: 50,
			speed: 10,
			evasion: 20,
			accuracy: 80,
			critical_chance: 5,
			fire_rate: 1,
			construction: {
				metal: 5000,
				microchips: 500,
				seconds: 3600,
			},
		},
		{
			type: 'death_star',
			initiative: 1,
			capacity: 1000000,
			requirements: [
				{
					type: 'technology',
					id: 'combat_tech',
					level: 15,
				},
				{
					type: 'technology',
					id: 'transport_tech',
					level: 10,
				},
			],
			attack: 1000,
			defense: 1000,
			speed: 1,
			evasion: 0,
			accuracy: 100,
			critical_chance: 0,
			fire_rate: 1,
			construction: {
				metal: 1000000,
				microchips: 100000,
				seconds: 86400,
			},
		},
	],
	defenses: [],

	biomes: {
		desert: {
			metal: 0,
			deuterium: -15,
			microchips: 0,
			energy: 25,
		},
		ocean: {
			metal: 0,
			deuterium: 25,
			microchips: 0,
			energy: -15,
		},
		jungle: {
			metal: -15,
			deuterium: 0,
			microchips: 25,
			energy: 0,
		},
		ice: {
			metal: 25,
			deuterium: 0,
			microchips: -15,
			energy: 0,
		},
		volcanic: {
			metal: 15,
			deuterium: -10,
			microchips: -10,
			energy: 15,
		},
	},
	speed: {
		ships: 1,
		researchs: 1,
		resources: 1,
		construction: 1,
	},
	planets: {
		count: 500,
		size_max: 10000,
		size_min: 1000,
		grid_size: 10000,
		biome_distribution: {
			ice: 1,
			ocean: 1,
			desert: 1,
			jungle: 1,
			volcanic: 1,
		},
	},
	researchs: [
		{
			id: 'metal_production_boost',
			cost: {
				base_metal: 0,
				base_deuterium: 60,
				base_microchips: 5,
				percent_increase_per_level: 300,
			},
			time: {
				base_seconds: 5, // 5 seconds
				percent_increase_per_level: 200,
			},
			effects: [
				{
					type: 'resource_boost',
					value: 5,
					per_level: true,
					target_type: 'metal_mine',
					resource_type: 'metal',
				},
			],
			category: 'resource',
			max_level: 50,
			prerequisites: [],
		},
		{
			id: 'deuterium_production_boost',
			cost: {
				base_metal: 0,
				base_deuterium: 60,
				base_microchips: 5,
				percent_increase_per_level: 300,
			},
			time: {
				base_seconds: 5, // 5 seconds
				percent_increase_per_level: 200,
			},
			effects: [
				{
					type: 'resource_boost',
					value: 5,
					per_level: true,
					target_type: 'deuterium_synthesizer',
					resource_type: 'deuterium',
				},
			],
			category: 'resource',
			max_level: 50,
			prerequisites: [],
		},
		{
			id: 'energy_efficiency',
			cost: {
				base_metal: 0,
				base_deuterium: 60,
				base_microchips: 5,
				percent_increase_per_level: 300,
			},
			time: {
				base_seconds: 5, // 30 minutes
				percent_increase_per_level: 200,
			},
			effects: [
				{
					type: 'resource_boost',
					value: 5,
					per_level: true,
					target_type: 'energy_plant',
					resource_type: 'energy',
				},
			],
			category: 'resource',
			max_level: 50,
			prerequisites: [],
		},
		{
			id: 'microchips_production_boost',
			cost: {
				base_metal: 0,
				base_deuterium: 60,
				base_microchips: 5,
				percent_increase_per_level: 300,
			},
			time: {
				base_seconds: 5, // 5 seconds
				percent_increase_per_level: 200,
			},
			effects: [
				{
					type: 'resource_boost',
					value: 5,
					per_level: true,
					target_type: 'microchip_factory',
					resource_type: 'microchips',
				},
			],
			category: 'structure',
			max_level: 50,
			prerequisites: [],
		},
		{
			id: 'espionage_tech',
			cost: {
				base_metal: 0,
				base_deuterium: 100,
				base_microchips: 5,
				percent_increase_per_level: 100,
			},
			time: {
				base_seconds: 10, // 10 seconds
				percent_increase_per_level: 100,
			},
			effects: [],
			category: 'ship',
			max_level: 10,
			prerequisites: [],
		},
		{
			id: 'transport_tech',
			cost: {
				base_metal: 0,
				base_deuterium: 250,
				base_microchips: 10,
				percent_increase_per_level: 0,
			},
			time: {
				base_seconds: 5, // 5 seconds
				percent_increase_per_level: 100,
			},
			effects: [],
			category: 'ship',
			max_level: 10,
			prerequisites: [],
		},
		{
			id: 'colonization_tech',
			cost: {
				base_metal: 0,
				base_deuterium: 500,
				base_microchips: 50,
				percent_increase_per_level: 500,
			},
			time: {
				base_seconds: 30, // 30 seconds
				percent_increase_per_level: 500,
			},
			effects: [],
			category: 'ship',
			max_level: 10,
			prerequisites: [],
		},
		{
			id: 'combat_tech',
			cost: {
				base_metal: 0,
				base_deuterium: 1000,
				base_microchips: 50,
				percent_increase_per_level: 200,
			},
			time: {
				base_seconds: 5, // 5 seconds
				percent_increase_per_level: 200,
			},
			effects: [],
			category: 'ship',
			max_level: 5,
			prerequisites: [],
		},
	],
	structures: [
		{
			type: 'metal_mine',
			cost: {
				base: 100,
				per_level: 50,
				power: null,
			},
			construction_time: {
				seconds: 5, // 5 seconds
			},
			storage: {
				resource: null,
				base: null,
				per_level: null,
			},
			production: {
				base: 1,
				per_level: 0.1,
				resource: 'metal',
			},
			prerequisites: {
				structures: [],
				technologies: [],
			},
			energy_consumption: {
				base: 10,
				per_level: 1,
			},
			max_level: null,
		},
		{
			type: 'deuterium_synthesizer',
			cost: {
				base: 100,
				per_level: 100,
				power: null,
			},
			construction_time: {
				seconds: 15, // 15 seconds
			},
			storage: {
				resource: null,
				base: null,
				per_level: null,
			},
			production: {
				base: 0.4,
				per_level: 0.004,
				resource: 'deuterium',
			},
			prerequisites: {
				structures: [
					{
						type: 'energy_plant',
						level: 1,
					},
				],
				technologies: [],
			},
			energy_consumption: {
				base: 15,
				per_level: 0.5,
			},
			max_level: null,
		},
		{
			type: 'energy_plant',
			cost: {
				base: 100,
				per_level: 100,
				power: null,
			},
			construction_time: {
				seconds: 30, // 30 seconds
			},
			storage: {
				resource: null,
				base: null,
				per_level: null,
			},
			production: {
				base: 100,
				per_level: 100,
				resource: 'energy',
			},
			prerequisites: {
				structures: [
					{
						type: 'metal_mine',
						level: 1,
					},
				],
				technologies: [],
			},
			energy_consumption: {
				base: 0,
				per_level: 0,
			},
			max_level: null,
		},
		{
			type: 'microchip_factory',
			cost: {
				base: 100,
				per_level: 100,
				power: null,
			},
			construction_time: {
				seconds: 10, // 5 seconds
			},
			storage: {
				resource: null,
				base: null,
				per_level: null,
			},
			production: {
				base: 0.04,
				resource: 'microchips',
				per_level: 0.004,
			},
			prerequisites: {
				structures: [
					{
						type: 'deuterium_synthesizer',
						level: 1,
					},
				],
				technologies: [],
			},
			energy_consumption: {
				base: 50,
				per_level: 0.5,
			},
			max_level: null,
		},
		{
			type: 'research_lab',
			cost: {
				base: 50,
				per_level: null,
				power: 1.5,
			},
			construction_time: {
				seconds: 600, // 10 minutes
			},
			storage: {
				resource: null,
				base: null,
				per_level: null,
			},
			production: {
				base: null,
				per_level: 0.05,
				resource: null,
			},
			prerequisites: {
				structures: [
					{
						type: 'microchip_factory',
						level: 1,
					},
				],
				technologies: [],
			},
			energy_consumption: {
				base: 50,
				per_level: 50,
			},
			max_level: 15,
		},
		{
			type: 'shipyard',
			cost: {
				base: 50,
				per_level: null,
				power: 1.5,
			},
			construction_time: {
				seconds: 600, // 10 minutes
			},
			storage: {
				resource: null,
				base: null,
				per_level: null,
			},
			production: {
				base: null,
				per_level: 0.05,
				resource: null,
			},
			prerequisites: {
				structures: [
					{
						type: 'research_lab',
						level: 1,
					},
				],
				technologies: [],
			},
			energy_consumption: {
				base: 50,
				per_level: 100,
			},
			max_level: 15,
		},
		{
			type: 'metal_hangar',
			cost: {
				base: 200,
				per_level: 100,
				power: null,
			},
			construction_time: {
				seconds: 600, // 10 minutes
			},
			storage: {
				resource: 'metal',
				base: 1000,
				per_level: 1000,
			},
			production: {
				base: null,
				per_level: 0.05,
				resource: null,
			},
			prerequisites: {
				structures: [
					{
						type: 'metal_mine',
						level: 5,
					},
				],
				technologies: [],
			},
			energy_consumption: {
				base: 5,
				per_level: 1,
			},
			max_level: null,
		},
		{
			type: 'deuterium_tank',
			cost: {
				base: 100,
				per_level: 100,
				power: null,
			},
			construction_time: {
				seconds: 600, // 10 minutes
			},
			storage: {
				resource: 'deuterium',
				base: 500,
				per_level: 500,
			},
			production: {
				base: null,
				per_level: null,
				resource: null,
			},
			prerequisites: {
				structures: [
					{
						type: 'deuterium_synthesizer',
						level: 3,
					},
				],
				technologies: [],
			},
			energy_consumption: {
				base: 10,
				per_level: 1,
			},
			max_level: null,
		},
		{
			type: 'microchip_vault',
			cost: {
				base: 500,
				per_level: 100,
				power: null,
			},
			construction_time: {
				seconds: 600, // 10 minutes
			},
			storage: {
				resource: 'microchips',
				base: 100,
				per_level: 100,
			},
			production: {
				base: null,
				per_level: 0.05,
				resource: null,
			},
			prerequisites: {
				structures: [
					{
						type: 'microchip_factory',
						level: 5,
					},
				],
				technologies: [],
			},
			energy_consumption: {
				base: 15,
				per_level: 5,
			},
			max_level: null,
		},
	],
};
