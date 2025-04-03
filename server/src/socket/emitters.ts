import { io } from '../server';
import { Planet } from 'shared-types';
import { activeUsers } from './socket';
import cache from '../cache/cache';

export const socketEmitters = {
	emitPlanetUpdate: (planet: Planet) => {
		io.to(`planet:${planet.id}`).emit('planet:update', planet);
	},

	emitActiveUsers: () => {
		io.emit(
			'active:users',
			Array.from(activeUsers.values()).map((e) => e.userId)
		);
	},

	emitUserNotification: (userId: string, notification: any) => {
		io.to(`user:${userId}`).emit('notification', notification);
	},

	emitPlanets: async () => {
		const gameConfig = await cache.getGameConfig();

		const planets = await cache.getPlanetsFromGalaxy(gameConfig?.season.current || 1, 1);
		io.emit('planets', planets);
	},
};
