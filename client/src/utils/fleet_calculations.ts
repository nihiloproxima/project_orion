import { Timestamp } from 'firebase/firestore';
import { GameConfig, Planet, ShipType } from 'shared-types';

const fleetCalculations = {
	calculateFleetArrivalTime: (
		gameConfig: GameConfig,
		ships: { [shipType in ShipType]?: number },
		origin: Planet['position'],
		destination: Planet['position']
	): { arrivalTime: Timestamp; travelTimeSeconds: number } => {
		// Determine the convoy's speed as the slowest ship's speed from gameConfig
		const slowestSpeed = Math.min(
			...Object.entries(ships).map(([shipType]) => {
				const shipConfig = gameConfig.ships.find((s) => s.type === shipType);
				return shipConfig ? shipConfig.speed : 1;
			})
		);

		// Calculate distance in 3D space (galaxy, x, y)
		const distance = Math.sqrt(
			Math.pow(destination.x - origin.x, 2) +
				Math.pow(destination.y - origin.y, 2) +
				Math.pow(destination.galaxy - origin.galaxy, 2)
		);

		// Compute travel time in seconds based on the slowest speed and gameConfig multiplier
		const travelTimeSeconds = Math.ceil(distance / slowestSpeed / gameConfig.speed.ships);

		// Derive arrival time by adding travel seconds to the current time
		const arrivalTime = Timestamp.fromMillis(Date.now() + travelTimeSeconds * 1000);

		return { arrivalTime, travelTimeSeconds };
	},
};

export default fleetCalculations;
