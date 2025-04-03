import { Timestamp } from 'firebase/firestore';
import { GameConfig, Planet } from 'shared-types';

import { Ship } from 'shared-types';

const fleetCalculations = {
	calculateFleetArrivalTime: (
		gameConfig: GameConfig,
		ships: Ship[],
		origin: Planet['position'],
		destination: Planet['position']
	): { arrivalTime: Timestamp; travelTimeSeconds: number } => {
		const convoySpeed = Math.min(...ships.map((ship) => ship.stats.speed));

		// Calculate distance and travel time in 3D space including galaxy coordinate
		const distance = Math.sqrt(
			Math.pow(destination.x - origin.x, 2) +
				Math.pow(destination.y - origin.y, 2) +
				Math.pow(destination.galaxy - origin.galaxy, 2)
		);

		const travelTimeSeconds = Math.ceil(distance / convoySpeed / gameConfig.speed.ships);
		const arrivalTime = Timestamp.fromMillis(Date.now() + travelTimeSeconds * 1000);

		return { arrivalTime, travelTimeSeconds };
	},
};

export default fleetCalculations;
