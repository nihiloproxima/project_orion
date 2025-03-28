import { FleetMovement, MissionMail } from '../models';

import { Planet } from '../models';

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
};

export default mailGenerator;
