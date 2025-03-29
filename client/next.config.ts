import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	rewrites: async () => [
		{
			source: '/api/:path*',
			destination: 'http://backend:8080/:path*',
		},
	],
	images: {
		unoptimized: true,
		domains: [],
		remotePatterns: [],
	},
};

export default nextConfig;
