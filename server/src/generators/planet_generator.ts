import { Timestamp } from 'firebase-admin/firestore';
import { Planet } from 'shared-types';

// World configuration constants
const WORLD_WIDTH = 1000;
const WORLD_HEIGHT = 1000;
const CHUNK_SIZE = 100;
const PLANETS_PER_GALAXY = 200;
const MIN_DISTANCE_BETWEEN_PLANETS = 30;
const MIN_PLANET_RADIUS = 1;
const MAX_PLANET_RADIUS = 5;
const PLANET_TTL_DAYS = 30;

const biomes: Planet['biome'][] = ['desert', 'ocean', 'jungle', 'ice', 'volcanic'];

const planetGenerator = {
	// Helper function to get chunk ID from coordinates
	getChunkId: (x: number, y: number) => {
		const chunkX = Math.floor(x / CHUNK_SIZE);
		const chunkY = Math.floor(y / CHUNK_SIZE);
		return chunkY * 10 + chunkX;
	},

	generatePlanetName(usedNames: Set<string>): string {
		const prefixes = [
			'HD',
			'Kepler',
			'GJ',
			'PSR',
			'TOI',
			'WASP',
			'TRAPPIST',
			'CoRoT',
			'HAT-P',
			'K2',
			'XO',
			'TrES',
			'OGLE',
			'KELT',
			'HIP',
			'Gliese',
			'Wolf',
			'Ross',
			'LHS',
			'2MASS',
		];
		const suffixes = [
			'b',
			'c',
			'd',
			'prime',
			'alpha',
			'beta',
			'gamma',
			'delta',
			'epsilon',
			'zeta',
			'eta',
			'theta',
			'iota',
			'kappa',
			'lambda',
			'mu',
			'nu',
			'xi',
			'omicron',
			'pi',
			'rho',
			'sigma',
			'tau',
			'upsilon',
			'phi',
			'chi',
			'psi',
			'omega',
		];

		const esotericNames = [
			'Nexus',
			'Celestia',
			'Chronos',
			'Ethereal',
			'Nova',
			'Arcadia',
			'Elysium',
			'Avalon',
			'Zenith',
			'Aurora',
			'Solaris',
			'Asteria',
			'Lumina',
			'Nebula',
			'Vega',
			'Andromeda',
			'Orion',
			'Lyra',
			'Cassiopeia',
			'Perseus',
			'Helios',
			'Aether',
			'Hyperion',
			'Atlas',
			'Calypso',
			'Phoenix',
			'Polaris',
			'Sirius',
			'Carina',
			'Hydra',
			'Draco',
			'Centauri',
			'Rigel',
			'Antares',
			'Arcturus',
			'Altair',
			'Deneb',
			'Vesta',
			'Ceres',
			'Titan',
			'Odin',
			'Thor',
			'Loki',
			'Freyja',
			'Baldr',
			'Tyr',
			'Frigg',
			'Heimdall',
			'Sif',
			'Njord',
		];

		const mythologicalPrefixes = [
			'Neo',
			'Quantum',
			'Astro',
			'Star',
			'Nova',
			'Stellar',
			'Lunar',
			'Solar',
			'Nebula',
			'Void',
			'Astral',
			'Meteor',
		];
		const mythologicalSuffixes = [
			'haven',
			'forge',
			'gate',
			'port',
			'nexus',
			'prime',
			'core',
			'hub',
			'station',
			'sector',
			'realm',
		];

		function generateScientificName(): string {
			const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
			const number = Math.floor(Math.random() * 999999);
			const useSuffix = Math.random() > 0.5;
			const suffix = useSuffix ? suffixes[Math.floor(Math.random() * suffixes.length)] : '';

			return `${prefix}-${number}${suffix}`;
		}

		function generateMythologicalName(): string {
			if (Math.random() > 0.5) {
				// Combined prefix + suffix
				const prefix = mythologicalPrefixes[Math.floor(Math.random() * mythologicalPrefixes.length)];
				const suffix = mythologicalSuffixes[Math.floor(Math.random() * mythologicalSuffixes.length)];
				return `${prefix}${suffix}`;
			} else {
				// Single esoteric name
				return esotericNames[Math.floor(Math.random() * esotericNames.length)];
			}
		}

		let name: string;
		let attempts = 0;
		const maxAttempts = 100;

		do {
			// 60% chance for scientific name, 40% for mythological
			name = Math.random() < 0.6 ? generateScientificName() : generateMythologicalName();
			attempts++;

			// If we're struggling to find a unique name, append a random number
			if (attempts > maxAttempts / 2 && usedNames.has(name)) {
				name = `${name}-${Math.floor(Math.random() * 100)}`;
			}
		} while (usedNames.has(name) && attempts < maxAttempts);

		// If we still couldn't generate a unique name, append timestamp
		if (usedNames.has(name)) {
			name = `${name}-${Date.now().toString().slice(-4)}`;
		}

		usedNames.add(name);
		return name;
	},

	// generatePlanets: () => {
	// 	const planets: Omit<Planet, 'id'>[] = [];

	// 	const usedNames = new Set<string>();
	// 	const usedCoordinates = new Set<string>();

	// 	const MIN_DISTANCE = 30; // Minimum distance between planets

	// 	let attempts = 0;
	// 	const MAX_ATTEMPTS = 1000; // Prevent infinite loops

	// 	while (planets.length < PLANETS_PER_GALAXY && attempts < MAX_ATTEMPTS) {
	// 		// Generate coordinates in the range -50 to 50 (for GALAXY_SIZE = 100)
	// 		const halfGrid = GALAXY_SIZE / 2;
	// 		const x = Math.floor(Math.random() * GALAXY_SIZE) - halfGrid;
	// 		const y = Math.floor(Math.random() * GALAXY_SIZE) - halfGrid;
	// 		const radius = Math.random() * 10;
	// 		const chunk = planetGenerator.getChunkId(x, y);
	// 		const coordKey = `${x}-${y}-${chunk}`;

	// 		// Skip if coordinate is already occupied
	// 		if (usedCoordinates.has(coordKey)) {
	// 			attempts++;
	// 			continue;
	// 		}

	// 		// Check distance from all existing planets
	// 		let tooClose = false;
	// 		for (const existingPlanet of planets) {
	// 			const distance = Math.sqrt(
	// 				Math.pow(existingPlanet.position.x - x, 2) + Math.pow(existingPlanet.position.y - y, 2)
	// 			);
	// 			if (distance < existingPlanet.radius + radius + MIN_DISTANCE) {
	// 				tooClose = true;
	// 				break;
	// 			}
	// 		}

	// 		attempts++;

	// 		if (!tooClose) {
	// 			// Mark the coordinate as used
	// 			usedCoordinates.add(coordKey);

	// 			const name = planetGenerator.generatePlanetName(usedNames);

	// 			// Generate planet properties
	// 			const planet: Omit<Planet, 'id'> = {
	// 				name,
	// 				position: {
	// 					chunk,
	// 					x,
	// 					y,
	// 				},
	// 				ships: {},
	// 				defenses: {},
	// 				structures: [],
	// 				radius,
	// 				is_homeworld: false,
	// 				owner_id: null,
	// 				biome: biomes[Math.floor(Math.random() * biomes.length)],
	// 				created_at: Timestamp.now(),
	// 				updated_at: Timestamp.now(),
	// 				resources: {
	// 					metal: 0,
	// 					energy: 0,
	// 					deuterium: 0,
	// 					microchips: 0,
	// 					last_update: Timestamp.now(),
	// 				},
	// 				ttl: Timestamp.fromMillis(Date.now() + 1000 * 60 * 60 * 24 * 30),
	// 			};

	// 			planets.push(planet);
	// 		}
	// 	}

	// 	return planets;
	// },

	generatePlanets: () => {
		const planets: Omit<Planet, 'id'>[] = [];
		const usedNames = new Set<string>();

		let attempts = 0;
		const MAX_ATTEMPTS = 1000; // Prevent infinite loops

		while (planets.length < PLANETS_PER_GALAXY && attempts < MAX_ATTEMPTS) {
			const x = Math.floor(Math.random() * WORLD_WIDTH);
			const y = Math.floor(Math.random() * WORLD_HEIGHT);
			const radius = MIN_PLANET_RADIUS + Math.random() * (MAX_PLANET_RADIUS - MIN_PLANET_RADIUS);
			const name = planetGenerator.generatePlanetName(usedNames);

			// Check distance from all existing planets
			let tooClose = false;
			for (const existingPlanet of planets) {
				const distance = Math.sqrt(
					Math.pow(existingPlanet.position.x - x, 2) + Math.pow(existingPlanet.position.y - y, 2)
				);
				if (distance < existingPlanet.radius + radius + MIN_DISTANCE_BETWEEN_PLANETS) {
					tooClose = true;
					break;
				}
			}

			attempts++;

			if (!tooClose) {
				const planet: Omit<Planet, 'id'> = {
					position: {
						x,
						y,
						chunk: planetGenerator.getChunkId(x, y),
					},
					name,
					ships: {},
					defenses: {},
					structures: [],
					radius,
					is_homeworld: false,
					owner_id: null,
					biome: biomes[Math.floor(Math.random() * biomes.length)],
					created_at: Timestamp.now(),
					updated_at: Timestamp.now(),
					resources: {
						metal: 0,
						energy: 0,
						deuterium: 0,
						microchips: 0,
						last_update: Timestamp.now(),
					},
					ttl: Timestamp.fromMillis(Date.now() + 1000 * 60 * 60 * 24 * PLANET_TTL_DAYS),
				};

				planets.push(planet);
			}
		}

		return planets;
	},
};

export default planetGenerator;
