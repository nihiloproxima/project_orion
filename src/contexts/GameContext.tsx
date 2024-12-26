import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabase } from "../lib/supabase";

import { Structure } from "../models/structure";
import { useAuth } from "../context/auth";
import { GameStructuresConfig } from "../models/structures_config";
import { Planet } from "../models/planet";
import { PlanetResources } from "../models/planets_resources";
import { calculateCurrentResources } from "../lib/resourceCalculations";

interface GameState {
  userPlanets: Planet[];
  selectedPlanet: Planet | null;
  resources: PlanetResources | null;
  structures: Structure[];
  structuresConfig: GameStructuresConfig | null;
  loading: boolean;
  loadedResources: boolean;
  loadedPlanets: boolean;
  loadedStructures: boolean;
  loadedStructuresConfig: boolean;
}

interface GameContextType {
  state: GameState;
  selectPlanet: (planet: Planet) => void;
  currentResources: {
    metal: number;
    microchips: number;
    deuterium: number;
    science: number;
    energy_production: number;
    energy_consumption: number;
  };
}

const GameContext = createContext<GameContextType | null>(null);

const initialState: GameState = {
  loading: true,
  loadedResources: false,
  loadedPlanets: false,
  loadedStructures: false,
  loadedStructuresConfig: false,
  userPlanets: [],
  selectedPlanet: null,
  resources: null,
  structures: [],
  structuresConfig: null,
};

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>(initialState);
  const [currentResources, setCurrentResources] = useState({
    metal: 0,
    microchips: 0,
    deuterium: 0,
    science: 0,
    energy_production: 0,
    energy_consumption: 0,
  });

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
    const fetchStructuresConfig = async () => {
      const { data, error } = await supabase
        .from("game_configs")
        .select("*")
        .eq("id", "structures")
        .single();

      if (error) {
        console.error("Error fetching structures config:", error);
        return;
      }

      setState((prev) => ({
        ...prev,
        structuresConfig: data.config_data as GameStructuresConfig,
        loadedStructuresConfig: true,
      }));
    };

    fetchStructuresConfig();

    const subscription = supabase
      .channel("gameconfig-structures")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "game_configs",
          filter: "id=eq.structures",
        },
        (payload: any) => {
          setState((prev) => ({
            ...prev,
            structuresConfig: payload.new.config_data,
          }));
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
      const { data, error } = await supabase
        .from("structures")
        .select("*")
        .eq("planet_id", state.selectedPlanet?.id);

      if (error) {
        console.error("Error fetching structures:", error);
        return;
      }

      setState((prev) => ({
        ...prev,
        structures: data || [],
        loadedStructures: true,
      }));
    };

    fetchStructures();

    const subscription = supabase
      .channel(`structures-${state.selectedPlanet.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "structures",
          filter: `planet_id=eq.${state.selectedPlanet.id}`,
        },
        (payload: any) => {
          setState((prev) => {
            if (payload.eventType === "DELETE") {
              return {
                ...prev,
                structures: prev.structures.filter(
                  (s) => s.id !== payload.old.id
                ),
              };
            } else if (payload.eventType === "INSERT") {
              return {
                ...prev,
                structures: [...prev.structures, payload.new],
              };
            } else if (payload.eventType === "UPDATE") {
              return {
                ...prev,
                structures: prev.structures.map((s) =>
                  s.id === payload.new.id ? payload.new : s
                ),
              };
            }
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [state.selectedPlanet]);

  useEffect(() => {
    if (
      state.loadedPlanets &&
      state.loadedResources &&
      state.loadedStructures &&
      state.loadedStructuresConfig
    ) {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [
    state.loadedPlanets,
    state.loadedResources,
    state.loadedStructures,
    state.loadedStructuresConfig,
  ]);

  useEffect(() => {
    if (!state.resources || !state.selectedPlanet || !state.structuresConfig)
      return;

    // Initialize with current values
    const initialResources = {
      metal: state.resources.metal,
      microchips: state.resources.microchips,
      deuterium: state.resources.deuterium,
      science: state.resources.science,
      energy_production: state.resources.energy_production,
      energy_consumption: state.resources.energy_consumption,
    };
    setCurrentResources(initialResources);

    // Update resources every second based on generation rates
    const interval = setInterval(() => {
      if (!state.resources || !state.selectedPlanet || !state.structuresConfig)
        return;

      const updatedResources = calculateCurrentResources(
        initialResources,
        state.structures,
        state.structuresConfig,
        state.selectedPlanet.biome,
        new Date(state.resources.last_update).getTime()
      );

      // Energy is now a balance, not accumulated
      updatedResources.energy = state.resources.energy;

      setCurrentResources(updatedResources);
      setState((prev) => ({
        ...prev,
        resources: {
          ...prev.resources!,
          ...updatedResources,
          last_update: Date.now(),
        },
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [
    state.resources,
    state.selectedPlanet,
    state.structures,
    state.structuresConfig,
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
        currentResources,
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
