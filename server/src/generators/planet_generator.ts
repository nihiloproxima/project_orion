import { Timestamp } from 'firebase-admin/firestore';
import { Planet } from '../models';

const GALAXY_COUNT = 20;
const PLANETS_PER_GALAXY = 100;
const GALAXY_SIZE = 10000;

const biomes: Planet['biome'][] = ['desert', 'ocean', 'jungle', 'ice', 'volcanic'];

const planetGenerator = {
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

	generatePlanets: () => {
		const planets: Partial<Planet>[] = [];
		const usedCoordinates = new Set<string>();
		const usedNames = new Set<string>();

		for (let galaxy = 0; galaxy < GALAXY_COUNT; galaxy++) {
			for (let i = 0; i < PLANETS_PER_GALAXY; i++) {
				// Convert from 0->1000 to -500->+500 range
				const halfGrid = GALAXY_SIZE / 2;
				const x = Math.floor(Math.random() * GALAXY_SIZE) - halfGrid;
				const y = Math.floor(Math.random() * GALAXY_SIZE) - halfGrid;
				const coordKey = `${x}-${y}-${galaxy}`;

				// Skip if coordinate is already occupied
				if (usedCoordinates.has(coordKey)) continue;

				// Mark the coordinate as used
				usedCoordinates.add(coordKey);

				const name = planetGenerator.generatePlanetName(usedNames);

				// Generate planet properties
				const planet: Partial<Planet> = {
					name,
					position: {
						galaxy,
						x,
						y,
					},
					size_km: Math.floor(Math.random() * (15000 - 1000) + 1000),
					is_homeworld: false,
					owner_id: null,
					biome: biomes[Math.floor(Math.random() * biomes.length)],
					created_at: Timestamp.now(),
					updated_at: Timestamp.now(),
				};

				planets.push(planet);
			}
		}

		return planets;
	},
};

export default planetGenerator;
