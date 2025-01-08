'use client';

import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';

import { Eye } from 'lucide-react';
import GalaxyMap from '@/components/ThreeMap/GalaxyMap';
import { useGame } from '../../../contexts/GameContext';

export default function GalaxyObservation() {
	const { state } = useGame();

	return (
		<div className="flex flex-col h-[calc(100vh-8rem)] overflow-hidden">
			<div className="flex justify-between items-center mb-4 flex-shrink-0">
				<div>
					<h1 className="text-3xl font-bold neon-text mb-2 flex items-center gap-2">
						<Eye className="h-8 w-8" />
						GALAXY OBSERVATION
					</h1>
					<p className="text-muted-foreground">Monitor and analyze the galaxy map</p>
				</div>
			</div>

			<Card className="border-2 shadow-2xl shadow-primary/20 min-h-0 flex-1">
				<CardHeader className="border-b bg-gray-900 flex-shrink-0">
					<CardTitle className="text-xl">Known Systems: {state.planets?.length || 0}</CardTitle>
				</CardHeader>
				<CardContent className="p-6 h-[calc(100%-6rem)] overflow-hidden">
					<div className="h-full w-full">
						<GalaxyMap mode="view-only" />
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
