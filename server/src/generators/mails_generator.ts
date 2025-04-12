import { FleetMovement, MissionMail, SpyMail, UserResearchs, Planet } from 'shared-types';

const mailGenerator = {
	planetAlreadyColonized: (fleetMovement: FleetMovement, targetPlanet: Planet): Omit<MissionMail, 'id'> => {
		return {
			type: 'mission',
			category: 'missions',
			title: 'Planet already colonized',
			content: `Your colonization mission to planet ${fleetMovement.destination.planet_name} [${fleetMovement.destination.coordinates.x}:${fleetMovement.destination.coordinates.y}] failed because it was already colonized by another player during your travel time. Your fleet is returning home.`,
			created_at: fleetMovement.arrival_time,
			sender_id: 'system',
			sender_name: 'System',
			read: false,
			archived: false,
			data: {
				mission_type: 'colonize',
				status: 'failed',
				objectives: [`Colonize planet ${fleetMovement.destination.planet_name}`, 'Establish a new colony'],
			},
			ttl: fleetMovement.arrival_time,
		};
	},

	planetColonized: (fleetMovement: FleetMovement, targetPlanet: Planet): Omit<MissionMail, 'id'> => {
		return {
			type: 'mission',
			category: 'missions',
			title: 'Planet colonized',
			content: `Your colonization mission to planet ${fleetMovement.destination.planet_name} [${fleetMovement.destination.coordinates.x}:${fleetMovement.destination.coordinates.y}] has been completed successfully. Your fleet is returning home.`,
			created_at: fleetMovement.arrival_time,
			sender_id: 'system',
			sender_name: 'System',
			read: false,
			archived: false,
			data: {
				mission_type: 'colonize',
				status: 'completed',
				objectives: [`Colonize planet ${fleetMovement.destination.planet_name}`, 'Establish a new colony'],
			},
			ttl: fleetMovement.arrival_time,
		};
	},

	cannotTransportToUncolonizedPlanet: (
		fleetMovement: FleetMovement,
		targetPlanet: Planet
	): Omit<MissionMail, 'id'> => {
		return {
			type: 'mission',
			category: 'missions',
			title: 'Cannot transport to uncolonized planet',
			content: `Your transport mission to planet ${fleetMovement.destination.planet_name} [${fleetMovement.destination.coordinates.x}:${fleetMovement.destination.coordinates.y}] failed because it is not colonized. Your fleet is returning home.`,
			created_at: fleetMovement.arrival_time,
			sender_id: 'system',
			sender_name: 'System',
			read: false,
			archived: false,
			data: {
				mission_type: 'transport',
				status: 'failed',
				objectives: [
					`Transport resources to planet ${fleetMovement.destination.planet_name}`,
					'Establish a new colony',
				],
			},
			ttl: fleetMovement.arrival_time,
		};
	},

	spyMissionSuccess: (
		fleetMovement: FleetMovement,
		targetPlanet: Planet,
		userResearchs: UserResearchs
	): Omit<SpyMail, 'id'> => {
		return {
			type: 'spy',
			category: 'reports',
			title: 'Spy mission success',
			content: `Your spy mission to planet ${targetPlanet.name} [${targetPlanet.position.x}:${targetPlanet.position.y}] has been completed successfully.`,
			created_at: fleetMovement.arrival_time,
			sender_id: 'system',
			sender_name: 'System',
			read: false,
			archived: false,
			data: {
				target_planet_id: targetPlanet.id,
				target_owner_id: targetPlanet.owner_id || '',
				target_coordinates: {
					x: targetPlanet.position.x,
					y: targetPlanet.position.y,
				},
				resources: {
					current: {
						metal: targetPlanet.resources.metal,
						microchips: targetPlanet.resources.microchips,
						deuterium: targetPlanet.resources.deuterium,
					},
				},
				structures: targetPlanet.structures.map((structure) => ({
					type: structure.type,
					level: structure.level,
					is_under_construction: structure.construction_start_time !== null,
				})),
				research: Object.entries(userResearchs.technologies).map(([id, research]) => ({
					id,
					level: research.level,
					is_researching: research.is_researching,
				})),
				ships: targetPlanet.ships,
			},
			ttl: fleetMovement.arrival_time,
		};
	},

	spyMissionFailed: (fleetMovement: FleetMovement, targetPlanet: Planet): Omit<MissionMail, 'id'> => {
		return {
			type: 'mission',
			category: 'missions',
			title: 'Spy mission failed',
			content: `Your spy mission to planet ${targetPlanet.name} [${targetPlanet.position.x}:${targetPlanet.position.y}] failed.`,
			created_at: fleetMovement.arrival_time,
			sender_id: 'system',
			sender_name: 'System',
			read: false,
			archived: false,
			data: {
				mission_type: 'spy',
				status: 'failed',
				objectives: [`Spy on planet ${targetPlanet.name}`, 'Establish a new colony'],
			},
			ttl: fleetMovement.arrival_time,
		};
	},
};

export default mailGenerator;
