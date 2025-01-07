'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { GameConfig, PlanetStructures, Planet, PlanetResources, UserResearchs, User } from '../models/';
import { calculateResourceGeneration, calculateStorageCapacities } from '../utils/resources_calculations';

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

export function GameProvider({ children }: { children: ReactNode }) {
	const [state, setState] = useState<GameState>(initialState);

	const { authedUser } = useAuth();

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
		if (!state.selectedPlanet?.id) return;

		const fetchPlanetResources = async () => {
			const { data: resources, error } = await supabase
				.from('planet_resources')
				.select('*')
				.eq('planet_id', state.selectedPlanet?.id);

			if (error) {
				console.error('Error fetching planet resources:', error);
				return;
			}

			setState((prev) => ({
				...prev,
				resources: {
					...(resources.at(0) as PlanetResources),
					energy_production: 0,
					energy_consumption: 0,
				},
				loadedResources: true,
			}));
		};

		fetchPlanetResources();

		// Subscribe to changes in resources
		const resourcesSubscription = supabase
			.channel('resources-channel')
			.on(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'planets_resources',
					filter: `planet_id=eq.${state.selectedPlanet?.id}`,
				},
				(payload: any) => {
					console.log('resources update');
					setState((prev) => ({
						...prev,
						resources: {
							...(prev.resources as PlanetResources),
							...(payload.new as PlanetResources),
							energy_production: 0,
							energy_consumption: 0,
						},
						loadedResources: true,
					}));
				}
			)
			.subscribe();

		// Fetch planet research
		const fetchPlanetResearch = async () => {
			const { data: research, error } = await supabase
				.from('user_researchs')
				.select('*')
				.eq('user_id', authedUser?.id)
				.single();

			if (error) {
				console.error('Error fetching planet research:', error);
				return;
			}

			setState((prev) => ({
				...prev,
				userResearchs: research || [],
				loadedUserResearchs: true,
			}));
		};

		fetchPlanetResearch();

		// Subscribe to changes in planet research
		const researchSubscription = supabase
			.channel(`research-${state.selectedPlanet.id}`)
			.on(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'planet_researchs',
					filter: `planet_id=eq.${state.selectedPlanet.id}`,
				},
				(payload: any) => {
					setState((prev) => {
						switch (payload.eventType) {
							case 'DELETE':
								return {
									...prev,
									userResearchs: null,
								};
							case 'INSERT':
								return {
									...prev,
									userResearchs: payload.new as UserResearchs,
								};
							case 'UPDATE':
								return {
									...prev,
									userResearchs: payload.new as UserResearchs,
								};
							default:
								return prev;
						}
					});
				}
			)
			.subscribe();

		return () => {
			resourcesSubscription.unsubscribe();
			researchSubscription.unsubscribe();
		};
	}, [state.selectedPlanet, authedUser]);

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
		if (!state.selectedPlanet) return;

		const fetchStructures = async () => {
			const { data: planetStructures, error } = await supabase
				.from('planet_structures')
				.select()
				.eq('planet_id', state.selectedPlanet?.id)
				.single();

			if (error) {
				console.error('Error fetching structures:', error);
				return;
			}

			setState((prev) => ({
				...prev,
				planetStructures: planetStructures,
				loadedStructures: true,
			}));
		};

		fetchStructures();
		// Subscribe to changes in structures
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
								return {
									...prev,
									planetStructures: null,
								};
							case 'INSERT':
								return {
									...prev,
									planetStructures: payload.new as PlanetStructures,
								};
							case 'UPDATE':
								return {
									...prev,
									planetStructures: payload.new as PlanetStructures,
								};
							default:
								return prev;
						}
					});
				}
			)
			.subscribe();

		return () => {
			structuresSubscription.unsubscribe();
		};
	}, [state.selectedPlanet]);

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

		// Update resources every second based on generation rates
		const interval = setInterval(() => {
			if (
				!state.resources ||
				!state.selectedPlanet ||
				!state.gameConfig ||
				!state.planetStructures ||
				!state.userResearchs
			) {
				return;
			}

			const now = Date.now();
			const lastUpdate = state.resources.updated_at;
			const elapsedSeconds = (now - lastUpdate) / 1000;

			// Calculate storage capacities and resource generation
			const storageCapacities = calculateStorageCapacities(state.gameConfig, state.planetStructures.structures);

			const resourceGeneration = calculateResourceGeneration(
				state.gameConfig,
				state.planetStructures.structures,
				state.userResearchs,
				elapsedSeconds,
				state.resources
			);

			// Calculate energy balance
			const energyBalance = resourceGeneration.energy_balance;

			// Update current resources with calculated values, using storage capacities
			const updatedResources = {
				...state.resources,
				metal: Math.min(
					storageCapacities.metal,
					state.resources.metal + resourceGeneration.metal * elapsedSeconds
				),
				microchips: Math.min(
					storageCapacities.microchips,
					state.resources.microchips + resourceGeneration.microchips * elapsedSeconds
				),
				deuterium: Math.min(
					storageCapacities.deuterium,
					state.resources.deuterium + resourceGeneration.deuterium * elapsedSeconds
				),
				science: Math.min(
					storageCapacities.science,
					state.resources.science + resourceGeneration.science * elapsedSeconds
				),
				energy_production: energyBalance.production,
				energy_consumption: energyBalance.consumption,
				last_update: now,
			};

			console.log(`Updated resources`, updatedResources);

			setState((prev) => ({
				...prev,
				resources: {
					...prev.resources!,
					...updatedResources,
				},
			}));
		}, 1000);

		return () => clearInterval(interval);
	}, [state.resources, state.selectedPlanet, state.gameConfig, state.planetStructures, state.userResearchs]);

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
				const presenceState = channel.presenceState();
				const totalUsers = Object.keys(presenceState).length;

				setState((prev) => ({
					...prev,
					activePlayers: totalUsers,
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
