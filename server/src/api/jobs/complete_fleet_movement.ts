import Joi from 'joi';
import admin from 'firebase-admin';
import db from '../../database/db';
import assert from '../../rules/asserts';
import { FleetMovement, GameConfig } from 'shared-types';
import { Timestamp, Transaction } from 'firebase-admin/firestore';
import fleetCalculations from '../../rules/fleet_calculations';
import { addJob } from '../../bullmq/queue';
import mailsGenerator from '../../generators/mails_generator';
import planetCalculations from '../../rules/planet_calculations';

interface CompleteFleetMovementParams {
	fleet_movement_id: string;
	arrival_time_ms: number;
}

const schema = Joi.object<CompleteFleetMovementParams>({
	fleet_movement_id: Joi.string().required(),
	arrival_time_ms: Joi.number().required(),
});

export async function completeFleetMovement(data: CompleteFleetMovementParams) {
	const params = Joi.attempt(data, schema);

	const gameConfig = await db.getGameConfig();

	const jobs: Array<any> = [];
	await admin.firestore().runTransaction(async (tx) => {
		const fleetMovement = await db.getFleetMovement(tx, gameConfig.season.current, params.fleet_movement_id);

		assert.isEqual(
			fleetMovement.arrival_time.toMillis(),
			params.arrival_time_ms,
			`Fleet movement ${params.fleet_movement_id} not yet arrived`
		);

		switch (fleetMovement.mission_type) {
			case 'colonize':
				jobs.push(await handleColonizeMission(tx, gameConfig, fleetMovement));

				break;
			case 'transport':
				jobs.push(await handleTransportMission(tx, gameConfig, fleetMovement));

				break;
			case 'move':
				jobs.push(await handleMoveMission(tx, gameConfig, fleetMovement));

				break;
			case 'spy':
				jobs.push(await handleSpyMission(tx, gameConfig, fleetMovement));

				break;
		}

		// In all case, delete this fleet movement.
		db.deleteFleetMovement(tx, gameConfig.season.current, fleetMovement.id);
	});

	await Promise.all(
		jobs.map((job) =>
			addJob(
				'completeFleetMovement',
				{
					fleet_movement_id: job.fleet_movement_id,
					arrival_time_ms: job.arrival_time_ms,
				},
				job.delay
			)
		)
	);

	return {
		status: 'ok',
	};
}

async function returnFleet(
	tx: Transaction,
	gameConfig: GameConfig,
	fleetMovement: FleetMovement
): Promise<{
	fleet_movement_id: string;
	arrival_time_ms: number;
	delay: number;
}> {
	const { arrivalTime, travelTimeSeconds } = fleetCalculations.calculateFleetArrivalTime(
		gameConfig,
		fleetMovement.ships,
		fleetMovement.destination.coordinates,
		fleetMovement.origin.coordinates
	);

	const returnFleetMovementId = db.createFleetMovement(tx, gameConfig.season.current, {
		...fleetMovement,
		origin: {
			planet_id: fleetMovement.destination.planet_id,
			planet_name: fleetMovement.destination.planet_name,
			coordinates: fleetMovement.destination.coordinates,
		},
		destination: {
			planet_id: fleetMovement.origin.planet_id,
			planet_name: fleetMovement.origin.planet_name,
			coordinates: fleetMovement.origin.coordinates,
			user_id: fleetMovement.owner_id,
		},
		mission_type: 'move',
		departure_time: Timestamp.now(),
		arrival_time: arrivalTime,
		status: 'traveling',
	});

	return {
		fleet_movement_id: returnFleetMovementId,
		arrival_time_ms: arrivalTime.toMillis(),
		delay: travelTimeSeconds,
	};
}

async function handleColonizeMission(tx: Transaction, gameConfig: GameConfig, fleetMovement: FleetMovement) {
	const targetPlanet = await db.getPlanet(tx, gameConfig.season.current, fleetMovement.destination.planet_id);

	// If planet has been colonized, we should send a failure mail and return the fleet
	if (targetPlanet.owner_id !== null) {
		db.createUserMail(
			tx,
			fleetMovement.owner_id,
			mailsGenerator.planetAlreadyColonized(fleetMovement, targetPlanet)
		);
		return returnFleet(tx, gameConfig, fleetMovement);
	}

	// If planet has not been colonized, we should colonize it
	db.setPlanet(tx, gameConfig.season.current, fleetMovement.destination.planet_id, {
		owner_id: fleetMovement.owner_id,
		is_homeworld: false,
		resources: {
			metal: 500 + (fleetMovement.resources?.metal || 0),
			deuterium: 250 + (fleetMovement.resources?.deuterium || 0),
			microchips: 0 + (fleetMovement.resources?.microchips || 0),
			energy: 15,
			last_update: Timestamp.now(),
		},
		structures: [
			{
				type: 'metal_mine',
				level: 0,
				production_rate: 100,
				construction_start_time: null,
				construction_finish_time: null,
			},
			{
				type: 'energy_plant',
				level: 0,
				production_rate: 100,
				construction_start_time: null,
				construction_finish_time: null,
			},
			{
				type: 'deuterium_synthesizer',
				level: 0,
				production_rate: 100,
				construction_start_time: null,
				construction_finish_time: null,
			},
			{
				type: 'microchip_factory',
				level: 0,
				production_rate: 100,
				construction_start_time: null,
				construction_finish_time: null,
			},
			{
				type: 'research_lab',
				level: 0,
				production_rate: 100,
				construction_start_time: null,
				construction_finish_time: null,
			},
			{
				type: 'shipyard',
				level: 0,
				production_rate: 100,
				construction_start_time: null,
				construction_finish_time: null,
			},
			{
				type: 'metal_hangar',
				level: 0,
				production_rate: 100,
				construction_start_time: null,
				construction_finish_time: null,
			},
			{
				type: 'deuterium_tank',
				level: 0,
				production_rate: 100,
				construction_start_time: null,
				construction_finish_time: null,
			},
			{
				type: 'microchip_vault',
				level: 0,
				production_rate: 100,
				construction_start_time: null,
				construction_finish_time: null,
			},
		],
		updated_at: Timestamp.now(),
	});

	db.createUserMail(tx, fleetMovement.owner_id, mailsGenerator.planetColonized(fleetMovement, targetPlanet));
}

async function handleTransportMission(tx: Transaction, gameConfig: GameConfig, fleetMovement: FleetMovement) {
	const [targetPlanet] = await Promise.all([
		db.getPlanet(tx, gameConfig.season.current, fleetMovement.destination.planet_id),
	]);

	if (targetPlanet.owner_id === null) {
		db.createUserMail(
			tx,
			fleetMovement.owner_id,
			mailsGenerator.cannotTransportToUncolonizedPlanet(fleetMovement, targetPlanet)
		);
		return returnFleet(tx, gameConfig, fleetMovement);
	}

	const userResearchs = await db.getUserResearchs(tx, targetPlanet.owner_id);

	planetCalculations.calculatePlanetResources(gameConfig, targetPlanet, userResearchs);

	// Add resources to planet
	db.setPlanet(tx, gameConfig.season.current, targetPlanet.id, {
		resources: {
			metal: targetPlanet.resources.metal + (fleetMovement.resources?.metal || 0),
			deuterium: targetPlanet.resources.deuterium + (fleetMovement.resources?.deuterium || 0),
			microchips: targetPlanet.resources.microchips + (fleetMovement.resources?.microchips || 0),
			energy: targetPlanet.resources.energy + 15,
		},
		updated_at: Timestamp.now(),
	});

	return returnFleet(tx, gameConfig, fleetMovement);
}

// Basically a transport mission but ships stays on location after. Only used on same user planet
export async function handleMoveMission(tx: Transaction, gameConfig: GameConfig, fleetMovement: FleetMovement) {
	const targetPlanet = await db.getPlanet(tx, gameConfig.season.current, fleetMovement.destination.planet_id);

	if (targetPlanet.owner_id === null || targetPlanet.owner_id !== fleetMovement.owner_id) {
		return returnFleet(tx, gameConfig, fleetMovement);
	}

	const userResearchs = await db.getUserResearchs(tx, targetPlanet.owner_id);

	planetCalculations.calculatePlanetResources(gameConfig, targetPlanet, userResearchs);

	// Add resources to planet
	for (const shipType in fleetMovement.ships) {
		targetPlanet.ships[shipType] = (targetPlanet.ships[shipType] || 0) + fleetMovement.ships[shipType];
	}

	db.setPlanet(tx, gameConfig.season.current, targetPlanet.id, {
		resources: {
			metal: targetPlanet.resources.metal + (fleetMovement.resources?.metal || 0),
			deuterium: targetPlanet.resources.deuterium + (fleetMovement.resources?.deuterium || 0),
			microchips: targetPlanet.resources.microchips + (fleetMovement.resources?.microchips || 0),
			energy: targetPlanet.resources.energy + 15,
		},
		ships: targetPlanet.ships,
		updated_at: Timestamp.now(),
	});
}

async function handleSpyMission(tx: Transaction, gameConfig: GameConfig, fleetMovement: FleetMovement) {
	const [targetPlanet, userResearchs] = await Promise.all([
		db.getPlanet(tx, gameConfig.season.current, fleetMovement.destination.planet_id),
		db.getUserResearchs(tx, fleetMovement.owner_id),
	]);

	if (!targetPlanet.owner_id) {
		return returnFleet(tx, gameConfig, fleetMovement);
	}

	const ownerResearchs = await db.getUserResearchs(tx, targetPlanet.owner_id);

	planetCalculations.calculatePlanetResources(gameConfig, targetPlanet, ownerResearchs);

	if (targetPlanet.owner_id === null || targetPlanet.owner_id === fleetMovement.owner_id) {
		return returnFleet(tx, gameConfig, fleetMovement);
	}
	const ownerSpyLevel = ownerResearchs.technologies['spy']?.level || 0;
	const attackerSpyLevel = userResearchs.technologies['spy']?.level || 0;
	const spyLevelDiff = attackerSpyLevel - ownerSpyLevel;

	if (spyLevelDiff <= -2) {
		// Mission failed - spy tech too low
		db.createUserMail(tx, fleetMovement.owner_id, mailsGenerator.spyMissionFailed(fleetMovement, targetPlanet));
	} else if (spyLevelDiff === -1) {
		// Limited info - only resources, researchs and structures
		db.createUserMail(
			tx,
			fleetMovement.owner_id,
			mailsGenerator.spyMissionSuccess(fleetMovement, targetPlanet, ownerResearchs)
		);
	} else {
		// Full info including ships
		db.createUserMail(
			tx,
			fleetMovement.owner_id,
			mailsGenerator.spyMissionSuccess(fleetMovement, targetPlanet, ownerResearchs)
		);
	}

	return returnFleet(tx, gameConfig, fleetMovement);
}
