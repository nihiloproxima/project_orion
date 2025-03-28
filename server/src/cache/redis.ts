import { createClient } from 'redis';

// Create Redis client with the same parameters as worker

const redisClient = createClient({
	url: process.env.REDIS_URL,
});

redisClient.on('error', (err) => console.error('Redis Cache Client Error', err));
redisClient.on('connect', () => console.log('Redis Cache Client Connected'));
redisClient.on('reconnecting', () => console.log('Redis Cache Client Reconnecting'));

// Connect to Redis
(async () => {
	try {
		await redisClient.connect();
		console.log('Connected to Redis Cache!');
	} catch (err) {
		console.error('Failed to connect to Redis Cache:', err);
	}
})();

export default redisClient;
