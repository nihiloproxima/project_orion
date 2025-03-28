'use client';
import { useEffect, useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Planet } from '@/models/planet';
import { api } from '@/lib/api';
import GalaxyMap from '@/components/ThreeMap/GalaxyMap';
import { GalaxySelector } from '@/components/GalaxySelector';

export default function ChooseHomeworldPage() {
	const { state, selectPlanet } = useGame();
	const router = useRouter();
	const [currentGalaxy, setCurrentGalaxy] = useState(0);
	const [planets, setPlanets] = useState<Planet[]>([]);

	useEffect(() => {
		const getPlanets = async () => {
			const data = await api.getPlanets(currentGalaxy, 'colonize');
			setPlanets(data.planets);
		};

		getPlanets();
	}, [currentGalaxy]);

	// Redirect to dashboard if user already has a planet
	useEffect(() => {
		if (state.selectedPlanet?.id) {
			router.push('/dashboard');
		}
	}, [state.selectedPlanet, router]);

	const handlePlanetSelect = async (planet: Planet) => {
		try {
			await api.selectHomeworld(planet.id);
			selectPlanet(planet);
			router.push('/dashboard');
		} catch (error) {
			console.error('Error claiming planet:', error);
		}
	};

	if (planets.length === 0) {
		return <LoadingScreen message="SCANNING STAR SYSTEMS..." />;
	}

	return (
		<div className="min-h-screen bg-background p-6">
			<div className="container mx-auto">
				<Card className="border-2 shadow-2xl shadow-primary/20">
					<CardHeader>
						<CardTitle className="text-2xl font-bold neon-text text-center">
							SELECT YOUR HOMEWORLD
						</CardTitle>
						<GalaxySelector currentGalaxy={currentGalaxy} onGalaxyChange={setCurrentGalaxy} />
					</CardHeader>
					<CardContent className="p-6">
						<p className="text-center text-muted-foreground mb-6">
							Choose your starting planet carefully, Commander. This decision will shape your destiny.
						</p>

						<div className="flex justify-center w-full h-[calc(100vh-20rem)]">
							<GalaxyMap
								mode="homeworld"
								onPlanetSelect={handlePlanetSelect}
								allowedPlanets={planets.filter((p) => p.owner_id === null).map((p) => p.id)}
								galaxyFilter={currentGalaxy}
							/>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
