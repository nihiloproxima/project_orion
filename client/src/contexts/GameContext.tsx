'use client';

import { auth, db, withIdConverter } from '@/lib/firebase';
import { doc, collection, query, where } from 'firebase/firestore';
import { GameConfig, Planet, User, UserResearchs, UserTasks, UserReward } from '../models/';
import { ReactNode, createContext, useContext, useEffect, useState } from 'react';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useDocumentData, useCollectionData } from 'react-firebase-hooks/firestore';
import { useAuth } from './AuthContext';
import planetCalculations from '@/utils/planet_calculations';

interface GameState {
	activePlayers: string[];
	currentUser: User | null;
	gameConfig: GameConfig | null;
	loading: boolean;
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
	const [authedUser] = useAuthState(auth);
	const { logout } = useAuth();

	// Use react-firebase-hooks for main data
	const [gameConfig] = useDocumentData(doc(db, 'config/game'));
	const [user] = useDocumentData(authedUser ? doc(db, 'users', authedUser.uid).withConverter(withIdConverter) : null);
	const [userResearchs] = useDocumentData(authedUser ? doc(db, `users/${authedUser.uid}/private/researchs`) : null);
	const [userPlanets] = useCollectionData(
		gameConfig && authedUser
			? query(
					collection(db, `seasons/${gameConfig.season.current}/planets`).withConverter(withIdConverter),
					where('owner_id', '==', authedUser.uid)
			  )
			: null
	);
	const [userTasks] = useDocumentData(authedUser ? doc(db, `users/${authedUser.uid}/private/tasks`) : null);
	const [userRewards] = useCollectionData(authedUser ? collection(db, `users/${authedUser.uid}/rewards`) : null);

	// Initial data setup when auth changes
	useEffect(() => {
		if (!user || !gameConfig) {
			setState(initialState);
			return;
		}

		try {
			const homeWorld = userPlanets?.find((p) => p.is_homeworld);

			setState((prev) => ({
				...prev,
				currentUser: user as User,
				gameConfig: gameConfig as GameConfig,
				version: gameConfig.version,
				userResearchs: userResearchs as UserResearchs,
				userPlanets: userPlanets as Planet[],
				userRewards: userRewards?.map((doc) => ({ id: doc.id, ...doc } as UserReward)) || [],
				userTasks: userTasks as UserTasks,
				selectedPlanet: homeWorld || null,
				loading: false,
			}));
		} catch (error) {
			console.error('Error setting up game state:', error);
			logout();
		}
	}, [authedUser, user, gameConfig, userResearchs, userTasks, userRewards, userPlanets]);

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
	}, [state.selectedPlanet, gameConfig, userResearchs]);

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
