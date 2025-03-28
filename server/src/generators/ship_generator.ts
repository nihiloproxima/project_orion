import { Ship, ShipBlueprint, ShipComponent, ShipStats, User } from '../models';
import { Timestamp } from 'firebase-admin/firestore';

function generateShipName(blueprint: ShipBlueprint, components: ShipComponent[]): string {
	const prefixes = ['Star', 'Nova', 'Void', 'Solar', 'Astro', 'Cosmic', 'Nebula'];
	const suffixes = ['Hunter', 'Seeker', 'Runner', 'Blade', 'Wing', 'Storm', 'Ray'];

	// Use blueprint/components to influence name generation
	const prefixIndex = Math.floor(components.length * 17 + blueprint.id.length) % prefixes.length;
	const suffixIndex = Math.floor(blueprint.id.charCodeAt(0) + components[0].id.length) % suffixes.length;

	// Add a short random number to ensure uniqueness
	const uniqueNum = Math.floor(Math.random() * 100);

	return `${prefixes[prefixIndex]} ${suffixes[suffixIndex]}-${uniqueNum}`;
}

function calculateShipRarity(blueprint: ShipBlueprint, components: ShipComponent[]) {
	// Calculate rarity points based on blueprint and components
	let rarityPoints = 0;

	// Add points based on blueprint rarity
	switch (blueprint.rarity) {
		case 'legendary':
			rarityPoints += 100;
			break;
		case 'epic':
			rarityPoints += 50;
			break;
		case 'rare':
			rarityPoints += 25;
			break;
		case 'common':
			rarityPoints += 10;
			break;
		default:
			rarityPoints += 0;
	}

	// Add points for each component's rarity
	for (const component of components) {
		switch (component.rarity) {
			case 'legendary':
				rarityPoints += 20;
				break;
			case 'epic':
				rarityPoints += 10;
				break;
			case 'rare':
				rarityPoints += 5;
				break;
			case 'common':
				rarityPoints += 2;
				break;
			default:
				rarityPoints += 0;
		}
	}

	// Determine final ship rarity based on total points
	if (rarityPoints >= 150) {
		return 'legendary';
	} else if (rarityPoints >= 80) {
		return 'epic';
	} else if (rarityPoints >= 35) {
		return 'rare';
	} else if (rarityPoints >= 15) {
		return 'common';
	}

	return 'common';
}

function calculateShipStats(blueprint: ShipBlueprint, components: ShipComponent[]): ShipStats {
	const stats = blueprint.base_stats;

	for (const component of components) {
		stats.speed += component.stats.speed || 0;
		stats.capacity += component.stats.capacity || 0;
		stats.attack += component.stats.attack || 0;
		stats.defense += component.stats.defense || 0;
		stats.shield += component.stats.shield || 0;
		stats.evasion += component.stats.evasion || 0;
		stats.accuracy += component.stats.accuracy || 0;
		stats.critical_chance += component.stats.critical_chance || 0;
		stats.fire_rate += component.stats.fire_rate || 0;
		stats.initiative += component.stats.initiative || 0;
	}

	return stats;
}
export default function generateShip(user: User, blueprint: ShipBlueprint, components: ShipComponent[]): Ship {
	const ship: Ship = {
		id: '',
		status: 'stationed',
		name: generateShipName(blueprint, components),
		rarity: calculateShipRarity(blueprint, components),
		type: blueprint.ship_type,
		asset: blueprint.asset,
		stats: calculateShipStats(blueprint, components),
		components,
		integrity: 100,
		owner_id: user.id,
		xp: 0,
		level: 1,
		created_by: {
			user_id: user.id,
			user_name: user.name,
		},
		created_at: Timestamp.now(),
		updated_at: Timestamp.now(),
	};

	return ship;
}
