'use client';

import { auth, db } from '@/lib/firebase';
import { doc, collection, onSnapshot, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { GameConfig, Planet, User, UserResearchs, UserTasks, UserReward } from '../models/';
import { ReactNode, createContext, useContext, useEffect, useState } from 'react';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useDocument, useCollection } from 'react-firebase-hooks/firestore';
import { useAuth } from './AuthContext';
import planetCalculations from '@/utils/planet_calculations';

interface GameState {
	activePlayers: string[];
	currentUser: User | null;
	gameConfig: GameConfig | null;
	loading: boolean;
	planets: Planet[];
	userTasks: UserTasks | null;
	selectedPlanet: Planet | null;
	userPlanets: Planet[];
	userResearchs: UserResearchs | null;
	userRewards: UserReward[];
	resourcesIntervalId: NodeJS.Timeout | null;
	version: string;
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
	setState: React.Dispatch<React.SetStateAction<GameState>>;
	selectPlanet: (planet: Planet) => void;
}

const GameContext = createContext<GameContextType | null>(null);

const initialState: GameState = {
	resourcesIntervalId: null,
	activePlayers: [],
	loading: false,
	currentUser: null,
	userRewards: [],
	gameConfig: null,
	planets: [],
	userTasks: null,
	selectedPlanet: null,
	userPlanets: [],
	userResearchs: null,
	version: '0.0.0',
	currentResources: {
		metal: 0,
		deuterium: 0,
		microchips: 0,
		energy: 0,
		energy_production: 0,
		energy_consumption: 0,
	},
};

export function GameProvider({ children }: { children: ReactNode }) {
	const [state, setState] = useState<GameState>(initialState);
	const [user] = useAuthState(auth);
	const { logout } = useAuth();

	// Use react-firebase-hooks for main data
	const [gameConfigDoc] = useDocument(doc(db, 'configs', 'game'));
	const [userDoc] = useDocument(user ? doc(db, 'users', user.uid) : null);
	const [userResearchsDoc] = useDocument(user ? doc(db, `users/${user.uid}/private/researchs`) : null);
	const [planetsSnapshot] = useCollection(
		gameConfigDoc ? collection(db, `seasons/${gameConfigDoc.data()?.season.current}/planets`) : null
	);
	const [userTasksDoc] = useDocument(user ? doc(db, `users/${user.uid}/private/tasks`) : null);
	const [userRewardsSnapshot] = useCollection(user ? collection(db, `users/${user.uid}/rewards`) : null);

	// Initial data setup when auth changes
	useEffect(() => {
		if (!user || !gameConfigDoc?.exists() || !planetsSnapshot) {
			setState(initialState);
			return;
		}

		try {
			const userPlanets = planetsSnapshot.docs
				.map((doc) => ({ id: doc.id, ...doc.data() } as Planet))
				.filter((p) => p.owner_id === user.uid);
			const homeWorld = userPlanets.find((p) => p.is_homeworld);

			setState((prev) => ({
				...prev,
				currentUser: userDoc?.data() as User,
				gameConfig: gameConfigDoc.data()?.config_data,
				version: gameConfigDoc.data()?.version,
				userResearchs: userResearchsDoc?.data() as UserResearchs,
				userPlanets,
				userRewards:
					userRewardsSnapshot?.docs.map((doc) => ({ id: doc.id, ...doc.data() } as UserReward)) || [],
				userTasks: userTasksDoc?.data() as UserTasks,
				selectedPlanet: homeWorld || null,
				planets: planetsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Planet)),
				loading: false,
			}));
		} catch (error) {
			console.error('Error setting up game state:', error);
			logout();
		}
	}, [user, gameConfigDoc, userDoc, userResearchsDoc, planetsSnapshot, userTasksDoc, userRewardsSnapshot]);

	// Handle active players
	useEffect(() => {
		if (!user) return;

		const activePlayers = collection(db, 'active_players');
		const unsubscribe = onSnapshot(activePlayers, (snapshot) => {
			setState((prev) => ({
				...prev,
				activePlayers: snapshot.docs.map((doc) => doc.id),
			}));
		});

		// Set user as active
		const userRef = doc(db, 'active_players', user.uid);
		setDoc(userRef, {
			last_active: serverTimestamp(),
			user_id: user.uid,
		});

		return () => {
			unsubscribe();
			// Remove user from active players on unmount
			deleteDoc(userRef);
		};
	}, [user]);

	// Keep the existing resource calculation effect
	useEffect(() => {
		if (!state.selectedPlanet?.id || !state.gameConfig || !state.userResearchs) {
			return;
		}

		// Clear any existing interval first
		if (state.resourcesIntervalId) {
			clearInterval(state.resourcesIntervalId);
		}

		// Setup resource calculation interval
		const calculateResources = () => {
			const updatedPlanet = planetCalculations.calculatePlanetResources(
				state.gameConfig!,
				state.selectedPlanet!,
				state.userResearchs!
			);
			const energyBalance = planetCalculations.calculateEnergyBalance(
				state.gameConfig!,
				state.userResearchs!,
				state.selectedPlanet!.structures
			);

			setState((prev) => ({
				...prev,
				currentResources: {
					metal: updatedPlanet.resources.metal,
					deuterium: updatedPlanet.resources.deuterium,
					microchips: updatedPlanet.resources.microchips,
					energy: updatedPlanet.resources.energy,
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
		};
	}, [state.selectedPlanet?.id, state.gameConfig, state.userResearchs]);

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
				setState,
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
