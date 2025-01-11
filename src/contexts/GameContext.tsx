'use client';

import { GameConfig, Planet, PlanetResources, PlanetStructures, User, UserResearchs } from '../models/';
import { ReactNode, createContext, useContext, useEffect, useState, useCallback } from 'react';
import { calculateEnergyBalance, calculatePlanetResources } from '../utils/resources_calculations';

import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface GameState {
	activePlayers: number;
	currentUser: User | null;
	gameConfig: GameConfig | null;
	loadedGameConfig: boolean;
	loadedPlanets: boolean;
	loadedResources: boolean;
	loadedStructures: boolean;
	loadedUserResearchs: boolean;
	loading: boolean;
	planets: Planet[];
	resources: (PlanetResources & { energy_production: number; energy_consumption: number }) | null;
	selectedPlanet: Planet | null;
	planetStructures: PlanetStructures | null;
	userPlanets: Planet[];
	userResearchs: UserResearchs | null;
}

interface GameContextType {
	state: GameState;
	selectPlanet: (planet: Planet) => void;
	invalidatePlanetsCache: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

const initialState: GameState = {
	loading: true,
	loadedResources: false,
	loadedPlanets: false,
	loadedStructures: false,
	loadedGameConfig: false,
	loadedUserResearchs: false,
	userPlanets: [],
	selectedPlanet: null,
	resources: null,
	planetStructures: null,
	activePlayers: 0,
	userResearchs: null,
	currentUser: null,
	planets: [],
	gameConfig: null,
};

const usePageVisibility = (callback: () => void) => {
	useEffect(() => {
		const handleVisibilityChange = () => {
			if (document.visibilityState === 'visible') {
				callback();
			}
		};

		document.addEventListener('visibilitychange', handleVisibilityChange);
		window.addEventListener('focus', callback);

		return () => {
			document.removeEventListener('visibilitychange', handleVisibilityChange);
			window.removeEventListener('focus', callback);
		};
	}, [callback]);
};

export function GameProvider({ children }: { children: ReactNode }) {
	const [state, setState] = useState<GameState>(initialState);

	const { authedUser } = useAuth();

	// Create a function to handle resubscription of all channels
	const resubscribeAll = useCallback(() => {
		console.log('Resubscribing to all channels...');
		setState((prev) => ({
			...prev,
			loadedResources: false,
			loadedStructures: false,
			loadedUserResearchs: false,
		}));

		// Force refetch current planet data
		if (state.selectedPlanet?.id) {
			const planet = state.selectedPlanet;
			setState((prev) => ({
				...prev,
				selectedPlanet: null,
			}));
			setTimeout(() => {
				setState((prev) => ({
					...prev,
					selectedPlanet: planet,
				}));
			}, 100);
		}
	}, [state.selectedPlanet]);

	// Use the visibility hook
	usePageVisibility(resubscribeAll);

	// Reset state when user logs out
	useEffect(() => {
		if (!authedUser) {
			setState(initialState);
			return;
		}

		const fetchCurrentUser = async () => {
			const { data: user, error } = await supabase.from('users').select('*').eq('id', authedUser.id).single();

			if (error) {
				console.error('Error fetching current user:', error);
				return;
			}

			setState((prev) => ({
				...prev,
				currentUser: user,
			}));
		};

		fetchCurrentUser();

		const userSubscription = supabase
			.channel('users-channel')
			.on(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'users',
					filter: `id=eq.${authedUser.id}`,
				},
				(payload: any) => {
					if (payload.eventType === 'DELETE') {
						setState((prev) => ({
							...prev,
							currentUser: null,
						}));
					} else {
						setState((prev) => ({
							...prev,
							currentUser: payload.new,
						}));
					}
				}
			)
			.subscribe();

		return () => {
			userSubscription.unsubscribe();
		};
	}, [authedUser]);

	// Fetch planets once on initialization
	useEffect(() => {
		const fetchPlanets = async () => {
			if (state.loadedPlanets) return;

			try {
				const { data: planets, error } = await supabase
					.from('planets')
					.select('*')
					.order('created_at')
					.range(0, 999); // Fetch up to 1000 planets to ensure we get all 500

				if (error) {
					console.error('Error fetching planets:', error);
					return;
				}

				console.log(`Loaded ${planets?.length || 0} planets`);

				setState((prev) => ({
					...prev,
					planets,
					loadedPlanets: true,
				}));

				localStorage.setItem(
					'planets_cache',
					JSON.stringify({
						planets,
						timestamp: Date.now(),
					})
				);
			} catch (error) {
				console.error('Error in fetchPlanets:', error);
			}
		};

		const loadFromCache = () => {
			const cached = localStorage.getItem('planets_cache');
			if (!cached) {
				console.log('No planets cache found');
				return false;
			}

			try {
				const { planets, timestamp } = JSON.parse(cached);
				const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

				if (Date.now() - timestamp < CACHE_DURATION) {
					console.log(`Loaded ${planets?.length || 0} planets from cache`);
					setState((prev) => ({
						...prev,
						planets,
						loadedPlanets: true,
					}));
					return true;
				} else {
					console.log('Planet cache expired');
				}
			} catch (error) {
				console.error('Error parsing planets cache:', error);
			}
			return false;
		};
		if (!loadFromCache()) {
			fetchPlanets();
		}
	}, [state.loadedPlanets]);

	// Subscribe to planet ownership changes
	useEffect(() => {
		if (!state.loadedPlanets) return;

		const subscription = supabase
			.channel('planet_changes')
			.on(
				'postgres_changes',
				{
					event: 'UPDATE',
					schema: 'public',
					table: 'planets',
					filter: 'owner_id IS NOT NULL',
				},
				(payload) => {
					// Update state
					setState((prev) => ({
						...prev,
						planets:
							prev.planets?.map((planet) =>
								planet.id === payload.new.id ? { ...planet, owner_id: payload.new.owner_id } : planet
							) || null,
					}));

					// Update cache
					const cached = localStorage.getItem('planets_cache');
					if (cached) {
						try {
							const { planets, timestamp } = JSON.parse(cached);
							const updatedPlanets = planets.map((planet: any) =>
								planet.id === payload.new.id ? { ...planet, owner_id: payload.new.owner_id } : planet
							);

							localStorage.setItem(
								'planets_cache',
								JSON.stringify({
									planets: updatedPlanets,
									timestamp,
								})
							);
						} catch (error) {
							console.error('Error updating planets cache:', error);
						}
					}
				}
			)
			.subscribe();

		return () => {
			subscription.unsubscribe();
		};
	}, [state.loadedPlanets]);

	useEffect(() => {
		if (!authedUser) return;

		// Initial fetch of user's planets
		const fetchUserPlanets = async () => {
			const { data: planets, error } = await supabase.from('planets').select('*').eq('owner_id', authedUser.id);

			if (error) {
				console.error('Error fetching planets:', error);
				return;
			}

			setState((prev) => ({
				...prev,
				userPlanets: planets || [],
				selectedPlanet: state.selectedPlanet
					? state.selectedPlanet
					: planets?.find((p) => p.is_homeworld) || null,
				loadedPlanets: true,
				// If user has no planets, mark everything as loaded to prevent infinite loading
				...((!planets || planets.length === 0) && {
					loadedResources: true,
					loadedStructures: true,
					loadedStructuresConfig: true,
					loadedResearchsConfig: true,
					loadedShipsConfig: true,
					loadedUserResearchs: true,
				}),
			}));
		};

		fetchUserPlanets();

		// Subscribe to changes in user's planets
		const planetsSubscription = supabase
			.channel('planets-channel')
			.on(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'planets',
					filter: `owner_id=eq.${authedUser.id}`,
				},
				(payload: any) => {
					setState((prev) => {
						// Get updated planets list
						let updatedPlanets = [...prev.userPlanets];

						if (payload.eventType === 'DELETE') {
							updatedPlanets = updatedPlanets.filter((p) => p.id !== payload.old.id);
						} else {
							const planetIndex = updatedPlanets.findIndex((p) => p.id === payload.new.id);
							if (planetIndex >= 0) {
								updatedPlanets[planetIndex] = payload.new;
							} else {
								updatedPlanets.push(payload.new);
							}
						}

						// Determine selected planet
						let selectedPlanet = prev.selectedPlanet;
						if (!selectedPlanet && updatedPlanets.length > 0) {
							selectedPlanet = updatedPlanets.find((p) => p.is_homeworld) || updatedPlanets[0];
						}

						return {
							...prev,
							userPlanets: updatedPlanets,
							selectedPlanet: selectedPlanet,
						};
					});
				}
			)
			.subscribe();

		return () => {
			planetsSubscription.unsubscribe();
		};
	}, [authedUser, state.selectedPlanet?.id, state.selectedPlanet]);

	useEffect(() => {
		if (!state.selectedPlanet?.id || !authedUser) return;

		const fetchPlanetData = async () => {
			// Fetch resources
			const { data: resources, error: resourcesError } = await supabase
				.from('planet_resources')
				.select('*')
				.eq('planet_id', state.selectedPlanet?.id);

			if (resourcesError) {
				console.error('Error fetching planet resources:', resourcesError);
				return;
			}

			// Fetch structures
			const { data: planetStructures, error: structuresError } = await supabase
				.from('planet_structures')
				.select()
				.eq('planet_id', state.selectedPlanet?.id)
				.single();

			if (structuresError) {
				console.error('Error fetching structures:', structuresError);
				return;
			}

			// Fetch research
			const { data: research, error: researchError } = await supabase
				.from('user_researchs')
				.select('*')
				.eq('user_id', authedUser?.id)
				.single();

			if (researchError) {
				console.error('Error fetching planet research:', researchError);
				return;
			}

			setState((prev) => ({
				...prev,
				resources: {
					...(resources.at(0) as PlanetResources),
					energy_production: 0,
					energy_consumption: 0,
				},
				planetStructures,
				userResearchs: research || [],
				loadedResources: true,
				loadedStructures: true,
				loadedUserResearchs: true,
			}));
		};

		fetchPlanetData();

		// Set up all subscriptions
		const resourcesSubscription = supabase
			.channel('resources-channel')
			.on(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'planet_resources',
					filter: `planet_id=eq.${state.selectedPlanet?.id}`,
				},
				(payload: any) => {
					setState((prev) => ({
						...prev,
						resources: {
							...(prev.resources as PlanetResources),
							...(payload.new as PlanetResources),
							energy_production: 0,
							energy_consumption: 0,
						},
					}));
				}
			)
			.subscribe();

		const structuresSubscription = supabase
			.channel(`structures-${state.selectedPlanet.id}`)
			.on(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'planet_structures',
					filter: `planet_id=eq.${state.selectedPlanet.id}`,
				},
				(payload: any) => {
					setState((prev) => {
						switch (payload.eventType) {
							case 'DELETE':
								return { ...prev, planetStructures: null };
							case 'INSERT':
							case 'UPDATE':
								return { ...prev, planetStructures: payload.new as PlanetStructures };
							default:
								return prev;
						}
					});
				}
			)
			.subscribe();

		const researchSubscription = supabase
			.channel(`research-${state.selectedPlanet.id}`)
			.on(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'user_researchs',
					filter: `user_id=eq.${authedUser?.id}`,
				},
				(payload: any) => {
					setState((prev) => ({
						...prev,
						userResearchs: payload.new as UserResearchs,
					}));
				}
			)
			.subscribe();

		return () => {
			resourcesSubscription.unsubscribe();
			structuresSubscription.unsubscribe();
			researchSubscription.unsubscribe();
		};
	}, [state.selectedPlanet?.id, authedUser]);

	useEffect(() => {
		const fetchConfigs = async () => {
			// Fetch structures config
			const { data: gameConfig, error } = await supabase.from('configs').select().eq('id', 'game').single();

			if (error) {
				console.error('Error fetching configs:', error);
				return;
			}

			setState((prev) => ({
				...prev,
				gameConfig: gameConfig.config_data,
				loadedGameConfig: true,
			}));
		};

		fetchConfigs();

		const subscription = supabase
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
					setState((prev) => {
						return {
							...prev,
							gameConfig: payload.new.config_data,
						};
					});
				}
			)
			.subscribe();

		return () => {
			subscription.unsubscribe();
		};
	}, []);

	useEffect(() => {
		if (
			state.gameConfig &&
			state.loadedPlanets &&
			state.loadedResources &&
			state.loadedStructures &&
			state.loadedUserResearchs
		) {
			setState((prev) => ({ ...prev, loading: false }));
		}
	}, [
		state.gameConfig,
		state.loadedPlanets,
		state.loadedResources,
		state.loadedStructures,
		state.loadedUserResearchs,
	]);

	useEffect(() => {
		if (
			!state.resources ||
			!state.selectedPlanet ||
			!state.gameConfig ||
			!state.planetStructures ||
			!state.userResearchs
		) {
			return;
		}

		let intervalId: NodeJS.Timeout;

		const startInterval = () => {
			// Clear any existing interval
			if (intervalId) clearInterval(intervalId);

			// Immediately calculate resources once
			const planetResources = calculatePlanetResources(
				state.gameConfig!,
				state.planetStructures!,
				state.resources!,
				state.userResearchs!
			);
			const energyBalance = calculateEnergyBalance(state.gameConfig!, state.planetStructures!.structures);

			setState((prev) => ({
				...prev,
				resources: {
					...planetResources,
					energy_production: energyBalance.production,
					energy_consumption: energyBalance.consumption,
				},
			}));

			// Start new interval
			intervalId = setInterval(() => {
				if (
					!state.resources ||
					!state.selectedPlanet ||
					!state.gameConfig ||
					!state.planetStructures ||
					!state.userResearchs
				) {
					console.log('not ready');
					return;
				}

				const planetResources = calculatePlanetResources(
					state.gameConfig,
					state.planetStructures,
					state.resources,
					state.userResearchs
				);
				const energyBalance = calculateEnergyBalance(state.gameConfig, state.planetStructures.structures);

				setState((prev) => ({
					...prev,
					resources: {
						...planetResources,
						energy_production: energyBalance.production,
						energy_consumption: energyBalance.consumption,
					},
				}));
			}, 1000);
		};

		// Start the interval initially
		startInterval();

		// Handle visibility changes
		const handleVisibilityChange = () => {
			if (document.visibilityState === 'visible') {
				startInterval();
			} else {
				if (intervalId) clearInterval(intervalId);
			}
		};

		document.addEventListener('visibilitychange', handleVisibilityChange);
		window.addEventListener('focus', startInterval);
		window.addEventListener('blur', () => {
			if (intervalId) clearInterval(intervalId);
		});

		return () => {
			if (intervalId) clearInterval(intervalId);
			document.removeEventListener('visibilitychange', handleVisibilityChange);
			window.removeEventListener('focus', startInterval);
			window.removeEventListener('blur', () => {
				if (intervalId) clearInterval(intervalId);
			});
		};
	}, [state.selectedPlanet, state.gameConfig, state.planetStructures, state.userResearchs]);

	// Add presence tracking
	useEffect(() => {
		if (!authedUser) return;

		const channel = supabase.channel('online-users', {
			config: {
				presence: {
					key: authedUser.id,
				},
			},
		});

		channel
			.on('presence', { event: 'sync' }, () => {
				setState((prev) => ({
					...prev,
					activePlayers: Object.keys(channel.presenceState()).length,
				}));
			})
			.on('presence', { event: 'join' }, () => {
				setState((prev) => ({
					...prev,
					activePlayers: prev.activePlayers + 1,
				}));
			})
			.on('presence', { event: 'leave' }, () => {
				setState((prev) => ({
					...prev,
					activePlayers: Math.max(0, prev.activePlayers - 1),
				}));
			})
			.subscribe(async (status) => {
				if (status === 'SUBSCRIBED') {
					await channel.track({
						user_id: authedUser.id,
						online_at: new Date().toISOString(),
					});
				}
			});

		return () => {
			channel.unsubscribe();
		};
	}, [authedUser]);

	const selectPlanet = (planet: Planet) => {
		setState((prev) => ({
			...prev,
			selectedPlanet: planet,
			// Reset loading states for the new planet
			loadedResources: false,
			loadedStructures: false,
			loadedUserResearchs: false,
		}));
	};

	const invalidatePlanetsCache = () => {
		try {
			localStorage.removeItem('planets_cache');
			console.log('Planets cache invalidated');
		} catch (error) {
			console.error('Error invalidating planets cache:', error);
		}
	};

	return (
		<GameContext.Provider
			value={{
				state,
				selectPlanet,
				invalidatePlanetsCache,
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
