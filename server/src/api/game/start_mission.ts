// import Joi from 'joi';
// import admin from 'firebase-admin';
// import { MissionType, Planet, Ship } from 'shared-types';
// import db from '../../database/db';
// import assert from '../../rules/asserts';
// import planetCalculations from '../../rules/planet_calculations';
// import { Timestamp } from 'firebase-admin/firestore';
// import fleetCalculations from '../../rules/fleet_calculations';
// import { addJob } from '../../bullmq/queue';

// interface StartMissionBody {
// 	origin_planet_id: string;
// 	target_id: string;
// 	ship_ids: Ship[];
// 	mission_type: MissionType;
// 	resources?: {
// 		metal?: number;
// 		microchips?: number;
// 		deuterium?: number;
// 	};
// }

// const schema = Joi.object({
// 	origin_planet_id: Joi.string().required(),
// 	target_id: Joi.string().required(),
// 	ship_ids: Joi.array().items(Joi.string()).required(),
// 	mission_type: Joi.string().required(),
// 	resources: Joi.object({
// 		metal: Joi.number().optional(),
// 		microchips: Joi.number().optional(),
// 		deuterium: Joi.number().optional(),
// 	}).optional(),
// });

// export async function startMission(userId: string, body: StartMissionBody) {
// 	const params = Joi.attempt(body, schema);

// 	const gameConfig = await db.getGameConfig();

// 	const job = await admin.firestore().runTransaction(async (tx) => {
// 		const [user, userResearchs, planet, ships, targetPlanet] = await Promise.all([
// 			db.getUser(tx, userId),
// 			db.getUserResearchs(tx, userId),
// 			db.getPlanet(tx, gameConfig.season.current, params.origin_planet_id),
// 			db.getPlanet(tx, gameConfig.season.current, params.target_id),
// 		]);

// 		assert.isEqual(planet.owner_id, userId, 'You do not own this planet');
// 		assert.isEqual(
// 			ships.every((ship) => ship.owner_id === userId),
// 			true,
// 			'You do not own all ships'
// 		);
// 		assert.isEqual(
// 			ships.every((ship) => ship.position?.planet_id === params.origin_planet_id),
// 			true,
// 			'Ships must be stationed on planet'
// 		);

// 		planetCalculations.calculatePlanetResources(gameConfig, planet, userResearchs);

// 		if (params.resources) {
// 			// This mutates the planet resources directly
// 			// Make sure to save the planet at the end of the transaction
// 			handleResourceTransfer(planet, ships, params.resources);
// 		}

// 		switch (params.mission_type) {
// 			case 'transport':
// 				assert.isNotEqual(targetPlanet.owner_id, undefined, 'Target planet is not colonized');

// 				break;
// 			case 'colonize':
// 				const colonyCount = await db.countUserPlanets(tx, gameConfig.season.current, user.id);

// 				assert.isEqual(targetPlanet.owner_id, null, 'Target planet is already colonized');
// 				assert.isEqual(
// 					ships.some((ship) => ship.type === 'colony'),
// 					true,
// 					'At least one colony ship is required for colonization'
// 				);

// 				const colonizationTech = userResearchs.technologies['colonization_tech'];
// 				const maxColonies = (colonizationTech?.level || 0) + 1;

// 				if (colonyCount >= maxColonies) {
// 					// +1 because everyone starts with 1 colony
// 					throw new Error(
// 						`Colony limit reached. Current: ${colonyCount}, Maximum: ${maxColonies + 1}. ` +
// 							`Upgrade colonization technology to establish more colonies.`
// 					);
// 				}

// 				break;
// 			case 'attack':
// 				// TODO

// 				break;
// 			case 'spy':
// 				assert.isNotEqual(targetPlanet.owner_id, undefined, 'Target planet is not colonized');
// 				assert.isNotEqual(targetPlanet.owner_id, user.id, 'Target planet is owned by you');
// 				assert.isEqual(
// 					ships.every((ship) => ship.type === 'spy'),
// 					true,
// 					'All ships must be spy ships'
// 				);

// 				break;
// 			case 'move':
// 				// TODO

// 				break;
// 			case 'recycle':
// 				// TODO

// 				break;
// 		}

// 		const { arrivalTime, travelTimeSeconds } = fleetCalculations.calculateFleetArrivalTime(
// 			gameConfig,
// 			ships,
// 			planet.position,
// 			targetPlanet.position
// 		);

// 		const fleetMovementId = db.createFleetMovement(tx, gameConfig.season.current, {
// 			owner_id: user.id,
// 			owner_name: user.name,
// 			ships,
// 			ship_ids: ships.map((ship) => ship.id),
// 			origin: {
// 				planet_id: planet.id,
// 				planet_name: planet.name,
// 				coordinates: planet.position,
// 			},
// 			destination: {
// 				planet_id: targetPlanet.id,
// 				planet_name: targetPlanet.name,
// 				coordinates: targetPlanet.position,
// 				user_id: targetPlanet.owner_id,
// 			},
// 			mission_type: params.mission_type,
// 			departure_time: Timestamp.now(),
// 			arrival_time: arrivalTime,
// 			status: 'traveling',
// 			resources: params.resources || null,
// 		});

// 		db.setPlanet(tx, gameConfig.season.current, planet.id, planet);

// 		ships.map((ship) => {
// 			db.setShip(tx, gameConfig.season.current, ship.id, {
// 				status: 'traveling',
// 				position: null,
// 				updated_at: Timestamp.now(),
// 			});
// 		});

// 		return {
// 			fleet_movement_id: fleetMovementId,
// 			arrival_time_ms: arrivalTime.toMillis(),
// 			delay: travelTimeSeconds,
// 		};
// 	});

// 	await addJob(
// 		'completeFleetMovement',
// 		{
// 			fleet_movement_id: job.fleet_movement_id,
// 			arrival_time_ms: job.arrival_time_ms,
// 		},
// 		job.delay
// 	);

// 	return {
// 		status: 'ok',
// 	};
// }

// function handleResourceTransfer(planet: Planet, ships: Ship[], resources: StartMissionBody['resources']) {
// 	let requiredCapacity = 0;

// 	for (const resource in resources) {
// 		if (resources[resource] <= 0) {
// 			throw new Error(`At least 1 ${resource} is required for transport missions`);
// 		}

// 		assert.isGreaterThanOrEqual(
// 			resources[resource],
// 			planet.resources[resource],
// 			`Not enough ${resource} on planet`
// 		);

// 		planet.resources[resource] -= resources[resource];
// 		requiredCapacity += resources[resource];
// 	}

// 	assert.isGreaterThanOrEqual(
// 		ships.reduce((acc, ship) => acc + ship.stats.capacity, 0),
// 		requiredCapacity,
// 		'Not enough capacity on ships'
// 	);
// }
