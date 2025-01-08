'use client';

import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';

import { Eye } from 'lucide-react';
import GalaxyMap from '@/components/ThreeMap/GalaxyMap';
import { useGame } from '../../../contexts/GameContext';

export default function GalaxyObservation() {
	const { state } = useGame();

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold neon-text mb-2 flex items-center gap-2">
						<Eye className="h-8 w-8" />
						GALAXY OBSERVATION
					</h1>
					<p className="text-muted-foreground">Monitor and analyze the galaxy map</p>
				</div>
			</div>

			<Card className="border-2 shadow-2xl shadow-primary/20">
				<CardHeader className="border-b bg-gray-900">
					<CardTitle className="text-xl">Known Systems: {state.planets?.length || 0}</CardTitle>
				</CardHeader>
				<CardContent className="p-6">
					<div className="flex justify-center h-[500px] lg:h-[700px] xl:h-[800px]">
						<GalaxyMap mode="view-only" />
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
