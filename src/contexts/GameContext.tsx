'use client';

import { GameConfig, Planet, PlanetResources, PlanetStructures, User, UserResearchs } from '../models/';
import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { calculateEnergyBalance, calculatePlanetResources } from '../utils/resources_calculations';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface GameState {
	activePlayers: string[];
	currentUser: User | null;
	gameConfig: GameConfig | null;
	loading: boolean;
	planets: Planet[];
	planetResources: PlanetResources | null;
	selectedPlanet: Planet | null;
	planetStructures: PlanetStructures | null;
	userPlanets: Planet[];
	userResearchs: UserResearchs | null;
	resourcesIntervalId: NodeJS.Timeout | null;
	currentResources: {
		metal: number;
		deuterium: number;
		microchips: number;
		energy: number;
		energy_production: number;
		energy_consumption: number;
	};
}

interface GameContextType {
	state: GameState;
	selectPlanet: (planet: Planet) => void;
}

const GameContext = createContext<GameContextType | null>(null);

const initialState: GameState = {
	resourcesIntervalId: null,
	activePlayers: [],
	loading: true,
	currentUser: null,
	gameConfig: null,
	planets: [],
	planetResources: null,
	selectedPlanet: null,
	planetStructures: null,
	userPlanets: [],
	userResearchs: null,
	currentResources: {
		metal: 0,
		deuterium: 0,
		microchips: 0,
		energy: 0,
		energy_production: 0,
		energy_consumption: 0,
	},
};

// Setup subscriptions for a selected planet
const setupPlanetSubscriptions = (
	state: GameState,
	planetId: string,
	setState: React.Dispatch<React.SetStateAction<GameState>>
) => {
	const subscriptions = [
		supabase
			.channel(`user_researchs-${state.currentUser?.id}`)
			.on(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'user_researchs',
					filter: `user_id=eq.${state.currentUser?.id}`,
				},
				(payload: any) => {
					setState((prev) => ({
						...prev,
						userResearchs: payload.new as UserResearchs,
					}));
				}
			)
			.subscribe(),
		// Gameconfig
		supabase
			.channel('gameconfig-changes')
			.on(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'configs',
					filter: 'id=eq.game',
				},
				(payload: any) => {
					setState((prev) => ({
						...prev,
						gameConfig: payload.new.config_data,
					}));
				}
			)
			.subscribe(),

		// Resources subscription
		supabase
			.channel(`resources-${planetId}`)
			.on(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'planet_resources',
					filter: `planet_id=eq.${planetId}`,
				},
				(payload: any) => {
					setState((prev) => ({
						...prev,
						planetResources: payload.new,
					}));
				}
			)
			.subscribe(),

		// Structures subscription
		supabase
			.channel(`structures-${planetId}`)
			.on(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'planet_structures',
					filter: `planet_id=eq.${planetId}`,
				},
				(payload: any) => {
					setState((prev) => ({
						...prev,
						planetStructures: payload.eventType === 'DELETE' ? null : (payload.new as PlanetStructures),
					}));
				}
			)
			.subscribe(),
	];

	return () => subscriptions.forEach((sub) => sub.unsubscribe());
};

export function GameProvider({ children }: { children: ReactNode }) {
	const [state, setState] = useState<GameState>(initialState);
	const { authedUser } = useAuth();

	// Initial data fetch when auth changes
	useEffect(() => {
		if (!authedUser) {
			setState(initialState);
			return;
		}

		const fetchInitialData = async () => {
			try {
				const [gameConfig, currentUser, userResearchs, planets] = await Promise.all([
					supabase.from('configs').select('*').eq('id', 'game').single(),
					supabase.from('users').select('*').eq('id', authedUser.id).single(),
					supabase.from('user_researchs').select('*').eq('user_id', authedUser.id).single(),
					supabase.from('planets').select('*'),
				]);

				if (!gameConfig.data || !planets.data) {
					console.error('Error fetching initial data:', gameConfig.error, userResearchs.error);
					return;
				}

				const userPlanets = planets.data.filter((planet) => planet.owner_id === authedUser.id);
				const homeWorld = userPlanets.find((planet) => planet.is_homeworld);

				setState((prev) => ({
					...prev,
					currentUser: currentUser.data,
					gameConfig: gameConfig.data.config_data,
					userResearchs: userResearchs.data,
					userPlanets,
					selectedPlanet: homeWorld || null,
					planets: planets.data,
					loading: false,
				}));
			} catch (error) {
				console.error('Error fetching initial data:', error);
			}
		};

		fetchInitialData();

		const channel = supabase.channel('online-users', {
			config: {
				presence: {
					key: authedUser.id,
				},
			},
		});

		channel
			.on('presence', { event: 'sync' }, () => {
				const presenceState = channel.presenceState();
				const onlineUsers = Object.keys(presenceState);
				setState((prev) => ({
					...prev,
					activePlayers: onlineUsers,
				}));
			})
			.subscribe(async (status) => {
				if (status === 'SUBSCRIBED') {
					await channel.track({ online_at: new Date().toISOString() });
				}
			});

		return () => {
			channel.unsubscribe();
		};
	}, [authedUser]);

	useEffect(() => {
		const fetchPlanetData = async () => {
			if (state.selectedPlanet) {
				let planetStructures: PlanetStructures | null = null;
				let planetResources:
					| (PlanetResources & { energy_production: number; energy_consumption: number })
					| null = null;
				const { data: planetStructuresData } = await supabase
					.from('planet_structures')
					.select('*')
					.eq('planet_id', state.selectedPlanet.id)
					.single();

				if (planetStructuresData) {
					planetStructures = planetStructuresData;
				}

				const { data: planetResourcesData } = await supabase
					.from('planet_resources')
					.select('*')
					.eq('planet_id', state.selectedPlanet.id)
					.single();

				if (planetResourcesData) {
					planetResources = {
						...planetResourcesData,
						energy_production: 0,
						energy_consumption: 0,
					};
				}

				setState((prev) => ({
					...prev,
					planetStructures,
					planetResources,
				}));
			}
		};

		fetchPlanetData();
	}, [state.selectedPlanet]);

	// Setup subscriptions and resource calculation interval for selected planet
	useEffect(() => {
		if (!state.selectedPlanet?.id || !state.gameConfig || !state.planetStructures || !state.userResearchs) {
			return;
		}

		// Clear any existing interval first
		if (state.resourcesIntervalId) {
			clearInterval(state.resourcesIntervalId);
		}

		// Setup planet subscriptions
		const unsubscribe = setupPlanetSubscriptions(state, state.selectedPlanet.id, setState);

		// Setup resource calculation interval
		const calculateResources = () => {
			const planetResources = calculatePlanetResources(
				state.gameConfig!,
				state.planetStructures!,
				state.planetResources!,
				state.userResearchs!
			);
			const energyBalance = calculateEnergyBalance(
				state.gameConfig!,
				state.userResearchs!,
				state.planetStructures!.structures
			);

			setState((prev) => ({
				...prev,
				currentResources: {
					...planetResources,
					energy_production: energyBalance.production,
					energy_consumption: energyBalance.consumption,
				},
			}));
		};

		// Store new interval ID
		const intervalId = setInterval(calculateResources, 1000);
		setState((prev) => ({ ...prev, resourcesIntervalId: intervalId }));

		// Initial calculation
		calculateResources();

		return () => {
			clearInterval(intervalId); // Clear using the captured intervalId
			unsubscribe();
		};
	}, [
		state.selectedPlanet?.id,
		state.gameConfig,
		state.planetStructures,
		state.userResearchs,
		state.planetResources,
	]);

	const selectPlanet = (planet: Planet) => {
		setState((prev) => ({
			...prev,
			selectedPlanet: planet,
		}));
	};

	return (
		<GameContext.Provider
			value={{
				state,
				selectPlanet,
			}}
		>
			{children}
		</GameContext.Provider>
	);
}

export function useGame() {
	const context = useContext(GameContext);
	if (!context) {
		throw new Error('useGame must be used within a GameProvider');
	}
	return context;
}
