'use client';
import { useMemo } from 'react';
import { useGame } from '../contexts/GameContext';
import { Planet } from '../models/planet';

interface UsePlanetsReturn {
	planets: Planet[] | null;
	loading: boolean;
	unclaimedPlanets: Planet[];
	userPlanets: Planet[];
	getNeighboringPlanets: (planet: Planet, radius: number) => Planet[];
	getPlanetsByBiome: (biome: Planet['biome']) => Planet[];
}

export function usePlanets(): UsePlanetsReturn {
	const { state } = useGame();

	// Memoize derived planet lists
	const unclaimedPlanets = useMemo(() => {
		return state.planets?.filter((p) => !p.owner_id) || [];
	}, [state.planets]);

	const userPlanets = useMemo(() => {
		return state.planets?.filter((p) => p.owner_id === state.currentUser?.id) || [];
	}, [state.planets, state.currentUser?.id]);

	// Get planets within a certain radius of a given planet
	const getNeighboringPlanets = (planet: Planet, radius: number) => {
		if (!state.planets) return [];

		return state.planets.filter((p) => {
			const dx = p.position.x - planet.position.x;
			const dy = p.position.y - planet.position.y;
			const distance = Math.sqrt(dx * dx + dy * dy);
			return distance <= radius && p.id !== planet.id;
		});
	};

	// Get planets by biome type
	const getPlanetsByBiome = (biome: Planet['biome']) => {
		return state.planets?.filter((p) => p.biome === biome) || [];
	};

	return {
		planets: state.planets,
		loading: !state.planets.length,
		unclaimedPlanets,
		userPlanets,
		getNeighboringPlanets,
		getPlanetsByBiome,
	};
}
