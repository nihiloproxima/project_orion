import Joi from 'joi';
import _ from 'lodash';
import admin from 'firebase-admin';
import { GameConfig, MissionType, Planet, ShipType } from 'shared-types';
import db from '../../database/db';
import assert from '../../rules/asserts';
import planetCalculations from '../../rules/planet_calculations';
import { Timestamp } from 'firebase-admin/firestore';
import fleetCalculations from '../../rules/fleet_calculations';
import { addJob } from '../../bullmq/queue';
import utils from 'server/src/rules/utils';

interface StartMissionBody {
	origin_planet_id: string;
	destination_planet_id: string;
	ships_selection: Record<ShipType, number>;
	mission_type: MissionType;
	resources?: {
		metal?: number;
		microchips?: number;
		deuterium?: number;
	};
}

const schema = Joi.object({
	origin_planet_id: Joi.string().required(),
	destination_planet_id: Joi.string().required(),
	ships_selection: Joi.object({
		spy_probe: Joi.number().optional(),
		colonizer: Joi.number().optional(),
		transporter: Joi.number().optional(),
		recycler: Joi.number().optional(),
		battle_ship: Joi.number().optional(),
		destroyer: Joi.number().optional(),
		death_star: Joi.number().optional(),
	}).required(),
	mission_type: Joi.string().required(),
	resources: Joi.object({
		metal: Joi.number().optional(),
		microchips: Joi.number().optional(),
		deuterium: Joi.number().optional(),
	}).optional(),
});

export async function startMission(userId: string, body: StartMissionBody) {
	const params = Joi.attempt(body, schema);

	const gameConfig = await db.getGameConfig();

	const job = await admin.firestore().runTransaction(async (tx) => {
		const [user, userResearchs, planet, destinationPlanet] = await Promise.all([
			db.getUser(tx, userId),
			db.getUserResearchs(tx, userId),
			db.getPlanet(tx, gameConfig.season.current, params.origin_planet_id),
			db.getPlanet(tx, gameConfig.season.current, params.destination_planet_id),
		]);

		assert.isEqual(planet.owner_id, userId, 'You do not own this planet');

		for (const shipType in params.ships_selection) {
			assert.isGreaterThanOrEqual(
				params.ships_selection[shipType as ShipType],
				planet.ships[shipType as ShipType] || 0,
				`You do not have enough ${shipType}s on planet`
			);
		}

		planetCalculations.calculatePlanetResources(gameConfig, planet, userResearchs);

		if (params.resources) {
			// This mutates the planet resources directly
			// Make sure to save the planet at the end of the transaction
			handleResourceTransfer(gameConfig, planet, params.ships_selection, params.resources);
		}

		switch (params.mission_type) {
			case 'transport':
				assert.isNotEqual(destinationPlanet.owner_id, undefined, 'Target planet is not colonized');

				break;
			case 'colonize':
				const colonyCount = await db.countUserPlanets(tx, gameConfig.season.current, user.id);

				assert.isEqual(destinationPlanet.owner_id, null, 'Target planet is already colonized');
				assert.isEqual(
					Object.keys(params.ships_selection).some(
						(shipType) => shipType === 'colonizer' && params.ships_selection[shipType as ShipType] > 0
					),
					true,
					'At least one colony ship is required for colonization'
				);

				const colonizationTech = userResearchs.technologies['colonization_tech'];
				const maxColonies = (colonizationTech?.level || 0) + 1;

				if (colonyCount >= maxColonies) {
					// +1 because everyone starts with 1 colony
					throw new Error(
						`Colony limit reached. Current: ${colonyCount}, Maximum: ${maxColonies + 1}. ` +
							`Upgrade colonization technology to establish more colonies.`
					);
				}

				break;
			case 'attack':
				// TODO

				break;
			case 'spy':
				assert.isNotEqual(destinationPlanet.owner_id, undefined, 'Target planet is not colonized');
				assert.isNotEqual(destinationPlanet.owner_id, user.id, 'Target planet is owned by you');
				assert.isEqual(
					Object.keys(params.ships_selection).every((shipType) => shipType === 'spy_probe'),
					true,
					'All ships must be spy ships'
				);

				break;
			case 'move':
				// TODO

				break;
			case 'recycle':
				// TODO

				break;
		}

		const { arrivalTime, travelTimeSeconds } = fleetCalculations.calculateFleetArrivalTime(
			gameConfig,
			params.ships_selection,
			planet.position,
			destinationPlanet.position
		);

		const fleetMovementId = db.createFleetMovement(tx, gameConfig.season.current, {
			owner_id: user.id,
			owner_name: user.name,
			ships: params.ships_selection,
			origin: {
				planet_id: planet.id,
				planet_name: planet.name,
				coordinates: planet.position,
			},
			destination: {
				planet_id: destinationPlanet.id,
				planet_name: destinationPlanet.name,
				coordinates: destinationPlanet.position,
				user_id: destinationPlanet.owner_id,
			},
			mission_type: params.mission_type,
			departure_time: Timestamp.now(),
			arrival_time: arrivalTime,
			status: 'traveling',
			resources: params.resources || null,
		});

		db.setPlanet(tx, gameConfig.season.current, planet.id, planet);

		return {
			fleet_movement_id: fleetMovementId,
			arrival_time_ms: arrivalTime.toMillis(),
			delay: travelTimeSeconds,
		};
	});

	await addJob(
		'completeFleetMovement',
		{
			fleet_movement_id: job.fleet_movement_id,
			arrival_time_ms: job.arrival_time_ms,
		},
		job.delay
	);

	return {
		status: 'ok',
	};
}

function handleResourceTransfer(
	gameConfig: GameConfig,
	planet: Planet,
	shipSelections: Record<ShipType, number>,
	resources: StartMissionBody['resources']
) {
	const totalCargoCapacity = Object.entries(shipSelections).reduce((total, [type, count]) => {
		const shipConfig = utils.getShipConfig(gameConfig, type as ShipType);
		return total + (shipConfig?.capacity || 0) * count;
	}, 0);
	const totalResourcesSelected =
		_.toInteger(resources?.metal) + _.toInteger(resources?.deuterium) + _.toInteger(resources?.microchips);

	assert.isGreaterThanOrEqual(totalResourcesSelected, totalCargoCapacity, 'Not enough capacity on ships');
}
