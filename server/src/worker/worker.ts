import * as dotenv from 'dotenv';

dotenv.config();

import { Worker } from 'bullmq';
import * as jobsFunctions from '../api/jobs';

const worker = new Worker(
	'default',
	async (job) => {
		console.log(new Date().toISOString(), 'Processing job:', job.id);
		console.log('Job data:', job.data);
		const endpoint = job.data.type;
		const method = jobsFunctions[endpoint];
		if (!method) {
			throw new Error(`Unknown job type: ${job.data.type}`);
		}

		await method(job.data.data);
	},
	{
		connection: {
			url: process.env.REDIS_URL,
			retryStrategy: (times) => {
				// Retry connection with exponential backoff
				const delay = Math.min(times * 50, 2000);
				return delay;
			},
		},
	}
);

// Add connection error handling

worker.on('ready', async () => {
	console.log('Worker is ready');
});

worker.on('completed', (job) => {
	console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
	console.error(`Job ${job?.id} failed with error:`, {
		jobId: job?.id,
		jobType: job?.data?.type,
		error: err,
		stack: err.stack,
		attempts: job?.attemptsMade,
	});
});

export default worker;
