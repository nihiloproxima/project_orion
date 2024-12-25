import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabase } from "../lib/supabase";
import { Planet, PlanetResources } from "../types/game";
import { useAuth } from "../context/auth";

interface GameState {
  userPlanets: Planet[];
  selectedPlanet: Planet | null;
  resources: PlanetResources | null;
  loading: boolean;
  loadedResources: boolean;
  loadedPlanets: boolean;
}

interface GameContextType {
  state: GameState;
  selectPlanet: (planet: Planet) => void;
}

const GameContext = createContext<GameContextType | null>(null);

const initialState: GameState = {
  loading: true,
  loadedResources: false,
  loadedPlanets: false,
  userPlanets: [],
  selectedPlanet: null,
  resources: null,
};

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>(initialState);
  const { authedUser } = useAuth();

  useEffect(() => {
    if (!authedUser) return;

    // Initial fetch of user's planets
    const fetchUserPlanets = async () => {
      const { data: planets, error } = await supabase
        .from("planets")
        .select("*")
        .eq("owner_id", authedUser.id);

      if (error) {
        console.error("Error fetching planets:", error);
        return;
      }

      setState((prev) => ({
        ...prev,
        userPlanets: planets || [],
        selectedPlanet: state.selectedPlanet
          ? state.selectedPlanet
          : planets?.find((p) => p.is_homeworld) || null,
        loadedPlanets: true,
      }));
    };

    fetchUserPlanets();

    // Subscribe to changes in user's planets
    const planetsSubscription = supabase
      .channel("planets-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "planets",
          filter: `owner_id=eq.${authedUser.id}`,
        },
        (payload) => {
          setState((prev) => {
            const updatedPlanets = prev.userPlanets.map((planet) =>
              planet.id === payload.new.id
                ? { ...planet, ...payload.new }
                : planet
            );

            // Update selected planet if it was modified
            const updatedSelectedPlanet =
              prev.selectedPlanet?.id === payload.new.id
                ? { ...prev.selectedPlanet, ...payload.new }
                : prev.selectedPlanet;

            return {
              ...prev,
              userPlanets: updatedPlanets,
              selectedPlanet: updatedSelectedPlanet,
            };
          });
        }
      )
      .subscribe();

    return () => {
      planetsSubscription.unsubscribe();
    };
  }, [authedUser, state.selectedPlanet?.id]);

  useEffect(() => {
    if (!state.selectedPlanet?.id) return;

    const fetchPlanetResources = async () => {
      const { data: resources, error } = await supabase
        .from("planets_resources")
        .select("*")
        .eq("planet_id", state.selectedPlanet?.id);

      if (error) {
        console.error("Error fetching planet resources:", error);
        return;
      }

      setState((prev) => ({
        ...prev,
        resources: resources.at(0) as PlanetResources,
        loadedResources: true,
      }));
    };

    fetchPlanetResources();

    // Subscribe to changes in resources
    const resourcesSubscription = supabase
      .channel("resources-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "planets_resources",
          filter: `planet_id=eq.${state.selectedPlanet?.id}`,
        },
        (payload) => {
          console.log("resources update", payload);
          console.log(payload.new);
          setState((prev) => ({
            ...prev,
            resources: payload.new as PlanetResources,
            loadedResources: true,
          }));
        }
      )
      .subscribe();

    return () => {
      resourcesSubscription.unsubscribe();
    };
  }, [state.selectedPlanet]);

  useEffect(() => {
    if (state.loadedPlanets && state.loadedResources) {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [state.loadedPlanets, state.loadedResources]);

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
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
