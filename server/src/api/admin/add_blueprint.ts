import admin from 'firebase-admin';
import db from '../../database/db';
import Joi from 'joi';
import { v4 as uuidv4 } from 'uuid';
import { ShipBlueprint, ShipComponent } from '../../models/ship';

interface AddBlueprintRequest {
	user_id: string;
}

const schema = Joi.object<AddBlueprintRequest>({
	user_id: Joi.string().required(),
});

export async function addBlueprint(body: AddBlueprintRequest) {
	const params = Joi.attempt(body, schema);

	await admin.firestore().runTransaction(async (tx) => {
		const inventory = await db.getUserInventory(tx, params.user_id);

		// Add test blueprints to inventory
		const testBlueprints: ShipBlueprint[] = [
			{
				id: uuidv4(),
				name: 'Colony Ship',
				rarity: 'common',
				ship_type: 'colony',
				asset: 1,
				description: 'Basic colony ship for establishing new settlements',
				base_stats: {
					speed: 100,
					capacity: 500,
					attack: 0,
					defense: 50,
					shield: 50,
					evasion: 10,
					accuracy: 50,
					critical_chance: 0,
					fire_rate: 0,
					initiative: 5,
				},
				required_components: {
					engine: true,
					hull: true,
					weapon: false,
					shield_generator: true,
				},
				construction_seconds: 30,
				base_cost: {
					credits: 1000,
					resources: {
						metal: 1000,
						crystal: 500,
					},
				},
				requirements: {
					shipyard_level: 1,
					technologies: [],
				},
				level_requirement: 1,
			},
			{
				id: uuidv4(),
				name: 'Battle Cruiser',
				rarity: 'rare',
				ship_type: 'battle_ship',
				asset: 2,
				description: 'Combat-focused vessel with balanced offensive and defensive capabilities',
				base_stats: {
					speed: 80,
					capacity: 200,
					attack: 100,
					defense: 100,
					shield: 100,
					evasion: 20,
					accuracy: 80,
					critical_chance: 10,
					fire_rate: 1,
					initiative: 8,
				},
				required_components: {
					engine: true,
					hull: true,
					weapon: true,
					shield_generator: true,
				},
				construction_seconds: 30,
				base_cost: {
					credits: 2000,
					resources: {
						metal: 2000,
						crystal: 1000,
						deuterium: 500,
					},
				},
				requirements: {
					shipyard_level: 2,
					technologies: [],
				},
				level_requirement: 5,
			},
		];

		// Add test components
		const testComponents: ShipComponent[] = [
			{
				id: uuidv4(),
				type: 'engine',
				name: 'Basic Engine',
				rarity: 'common',
				effect: null,
				stats: {
					speed: 20,
					capacity: 0,
					attack: 0,
					defense: 0,
					shield: 0,
					evasion: 5,
					accuracy: 0,
					critical_chance: 0,
					fire_rate: 0,
					initiative: 2,
				},
				level_requirement: 1,
				description: 'Standard ship engine',
			},
			{
				id: uuidv4(),
				type: 'hull',
				name: 'Basic Hull',
				rarity: 'common',
				effect: null,
				stats: {
					speed: 0,
					capacity: 100,
					attack: 0,
					defense: 20,
					shield: 0,
					evasion: 0,
					accuracy: 0,
					critical_chance: 0,
					fire_rate: 0,
					initiative: 0,
				},
				level_requirement: 1,
				description: 'Standard ship hull',
			},
			{
				id: uuidv4(),
				type: 'weapon',
				name: 'Basic Laser',
				rarity: 'common',
				effect: null,
				stats: {
					speed: 0,
					capacity: 0,
					attack: 15,
					defense: 0,
					shield: 0,
					evasion: 0,
					accuracy: 10,
					critical_chance: 5,
					fire_rate: 1,
					initiative: 0,
				},
				level_requirement: 1,
				description: 'Standard ship laser weapon',
			},
			{
				id: uuidv4(),
				type: 'shield_generator',
				name: 'Basic Shield Generator',
				rarity: 'common',
				effect: null,
				stats: {
					speed: 0,
					capacity: 0,
					attack: 0,
					defense: 5,
					shield: 25,
					evasion: 0,
					accuracy: 0,
					critical_chance: 0,
					fire_rate: 0,
					initiative: 0,
				},
				level_requirement: 1,
				description: 'Standard shield generator',
			},
			{
				id: uuidv4(),
				type: 'engine',
				name: 'Advanced Engine',
				rarity: 'rare',
				effect: 'deuterium_saver',
				stats: {
					speed: 35,
					capacity: 0,
					attack: 0,
					defense: 0,
					shield: 0,
					evasion: 10,
					accuracy: 0,
					critical_chance: 0,
					fire_rate: 0,
					initiative: 4,
				},
				level_requirement: 3,
				description: 'High performance engine with enhanced maneuverability',
			},
			{
				id: uuidv4(),
				type: 'hull',
				name: 'Reinforced Hull',
				rarity: 'rare',
				effect: null,
				stats: {
					speed: -5,
					capacity: 150,
					attack: 0,
					defense: 40,
					shield: 0,
					evasion: -2,
					accuracy: 0,
					critical_chance: 0,
					fire_rate: 0,
					initiative: -1,
				},
				level_requirement: 3,
				description: 'Heavy duty hull with extra armor plating',
			},
			{
				id: uuidv4(),
				type: 'weapon',
				name: 'Plasma Cannon',
				rarity: 'rare',
				effect: null,
				stats: {
					speed: 0,
					capacity: 0,
					attack: 30,
					defense: 0,
					shield: 0,
					evasion: 0,
					accuracy: 15,
					critical_chance: 8,
					fire_rate: 0.8,
					initiative: 1,
				},
				level_requirement: 3,
				description: 'Advanced weapon that fires concentrated plasma bolts',
			},
			{
				id: uuidv4(),
				type: 'shield_generator',
				name: 'Deflector Shield',
				rarity: 'rare',
				effect: null,
				stats: {
					speed: -2,
					capacity: 0,
					attack: 0,
					defense: 10,
					shield: 45,
					evasion: 0,
					accuracy: 0,
					critical_chance: 0,
					fire_rate: 0,
					initiative: 0,
				},
				level_requirement: 3,
				description: 'Enhanced shield generator with improved deflection capabilities',
			},
		];

		// Add blueprints and components to inventory
		inventory.ship_blueprints.push(...testBlueprints);
		inventory.ship_components.push(...testComponents);

		// Update inventory in transaction
		db.setUserInventory(tx, params.user_id, inventory);
	});

	return {
		status: 'ok',
	};
}
