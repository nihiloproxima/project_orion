import { Server } from 'socket.io';
import { FastifyInstance } from 'fastify';
import admin from 'firebase-admin';
import { socketEmitters } from './emitters';

interface SocketUser {
	userId: string;
	lastActivity: number;
}

export const activeUsers = new Map<string, SocketUser>();

export function setupSocket(fastify: FastifyInstance) {
	const io = new Server(fastify.server, {
		cors: {
			origin: '*',
			methods: ['GET', 'POST'],
		},
		path: '/api/socket.io',
	});

	// Authentication middleware
	io.use(async (socket, next) => {
		try {
			const token = socket.handshake.auth.token;
			if (!token) {
				return next(new Error('Authentication error'));
			}

			const decodedToken = await admin.auth().verifyIdToken(token);
			socket.data.userId = decodedToken.uid;
			next();
		} catch (error) {
			next(new Error('Authentication error'));
		}
	});

	io.on('connection', async (socket) => {
		const userId = socket.data.userId;
		console.log(`User connected: ${userId}`);

		// Add user to active users
		activeUsers.set(userId, {
			userId,
			lastActivity: Date.now(),
		});

		socketEmitters.emitActiveUsers();

		// Join user-specific room
		socket.join(`user:${userId}`);

		// Handle planet subscription
		socket.on('subscribe:planets', async () => {
			socket.join('planets');
			socketEmitters.emitPlanets();
		});

		// Handle disconnection
		socket.on('disconnect', () => {
			console.log(`User disconnected: ${userId}`);
			activeUsers.delete(userId);
		});

		// Heartbeat to keep track of active users
		socket.on('heartbeat', () => {
			if (activeUsers.has(userId)) {
				activeUsers.set(userId, {
					userId,
					lastActivity: Date.now(),
				});
			}

			socketEmitters.emitActiveUsers();
		});
	});

	// Cleanup inactive users every minute
	setInterval(() => {
		const now = Date.now();
		activeUsers.forEach((user, userId) => {
			if (now - user.lastActivity > 5 * 60 * 1000) {
				// 5 minutes
				activeUsers.delete(userId);
			}
		});
	}, 60 * 1000);

	return io;
}
