import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabase } from "../lib/supabase";
import { Structure } from "../models/structure";
import { useAuth } from "./auth";
import { StructuresConfig } from "../models/structures_config";
import { Planet } from "../models/planet";
import { PlanetResources } from "../models/planets_resources";
import { ResearchsConfig } from "../models/researchs_config";
import { PlanetResearchs, User } from "../models";
import { ShipsConfig } from "../models/ships_config";

interface GameState {
  userPlanets: Planet[];
  selectedPlanet: Planet | null;
  resources: PlanetResources | null;
  structures: Structure[];
  structuresConfig: StructuresConfig | null;
  researchsConfig: ResearchsConfig | null;
  shipsConfig: ShipsConfig | null;
  loading: boolean;
  loadedResources: boolean;
  loadedPlanets: boolean;
  loadedStructures: boolean;
  loadedStructuresConfig: boolean;
  loadedResearchsConfig: boolean;
  loadedShipsConfig: boolean;
  activePlayers: number;
  planetResearchs: PlanetResearchs | null;
  loadedPlanetResearchs: boolean;
  currentUser: User | null;
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
  loadedResearchsConfig: false,
  loadedShipsConfig: false,
  loadedPlanetResearchs: false,
  userPlanets: [],
  selectedPlanet: null,
  resources: null,
  structures: [],
  structuresConfig: null,
  researchsConfig: null,
  shipsConfig: null,
  activePlayers: 0,
  planetResearchs: null,
  currentUser: null,
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

    const fetchCurrentUser = async () => {
      const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", authedUser.id)
        .single();

      if (error) {
        console.error("Error fetching current user:", error);
        return;
      }

      setState((prev) => ({
        ...prev,
        currentUser: user,
      }));
    };

    fetchCurrentUser();

    const userSubscription = supabase
      .channel("users-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "users",
          filter: `id=eq.${authedUser.id}`,
        },
        (payload: any) => {
          if (payload.eventType === "DELETE") {
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
        // If user has no planets, mark everything as loaded to prevent infinite loading
        ...((!planets || planets.length === 0) && {
          loadedResources: true,
          loadedStructures: true,
          loadedStructuresConfig: true,
          loadedResearchsConfig: true,
          loadedShipsConfig: true,
          loadedPlanetResearchs: true,
        }),
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
        (payload: any) => {
          setState((prev) => {
            // Get updated planets list
            let updatedPlanets = [...prev.userPlanets];

            if (payload.eventType === "DELETE") {
              updatedPlanets = updatedPlanets.filter(
                (p) => p.id !== payload.old.id
              );
            } else {
              const planetIndex = updatedPlanets.findIndex(
                (p) => p.id === payload.new.id
              );
              if (planetIndex >= 0) {
                updatedPlanets[planetIndex] = payload.new;
              } else {
                updatedPlanets.push(payload.new);
              }
            }

            // Determine selected planet
            let selectedPlanet = prev.selectedPlanet;
            if (!selectedPlanet && updatedPlanets.length > 0) {
              selectedPlanet =
                updatedPlanets.find((p) => p.is_homeworld) || updatedPlanets[0];
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
        (payload: any) => {
          console.log("resources update");
          setState((prev) => ({
            ...prev,
            resources: payload.new as PlanetResources,
            loadedResources: true,
          }));
        }
      )
      .subscribe();

    // Fetch planet research
    const fetchPlanetResearch = async () => {
      const { data: research, error } = await supabase
        .from("planet_researchs")
        .select("*")
        .eq("planet_id", state.selectedPlanet?.id)
        .single();

      if (error) {
        console.error("Error fetching planet research:", error);
        return;
      }

      setState((prev) => ({
        ...prev,
        planetResearchs: research || [],
        loadedPlanetResearchs: true,
      }));
    };

    fetchPlanetResearch();

    // Subscribe to changes in planet research
    const researchSubscription = supabase
      .channel(`research-${state.selectedPlanet.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "planet_researchs",
          filter: `planet_id=eq.${state.selectedPlanet.id}`,
        },
        (payload: any) => {
          setState((prev) => {
            switch (payload.eventType) {
              case "DELETE":
                return {
                  ...prev,
                  planetResearchs: null,
                };
              case "INSERT":
                return {
                  ...prev,
                  planetResearchs: payload.new as PlanetResearchs,
                };
              case "UPDATE":
                return {
                  ...prev,
                  planetResearchs: payload.new as PlanetResearchs,
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
  }, [state.selectedPlanet]);

  useEffect(() => {
    const fetchConfigs = async () => {
      // Fetch structures config
      const { data, error } = await supabase.from("game_configs").select("*");
      if (error) {
        console.error("Error fetching configs:", error);
        return;
      }

      let structuresData: StructuresConfig | null = null;
      let researchData: ResearchsConfig | null = null;
      let shipsData: ShipsConfig | null = null;

      for (const config of data) {
        if (config.id === "structures") {
          structuresData = config.config_data;
        } else if (config.id === "researchs") {
          researchData = config.config_data;
        } else if (config.id === "ships") {
          shipsData = config.config_data;
        }
      }

      setState((prev) => ({
        ...prev,
        structuresConfig: structuresData,
        researchsConfig: researchData,
        shipsConfig: shipsData,
        loadedStructuresConfig: true,
        loadedResearchsConfig: true,
        loadedShipsConfig: true,
      }));
    };

    fetchConfigs();

    const subscription = supabase
      .channel("gameconfig-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "game_configs",
          filter: "id=in.(structures,researchs,ships)",
        },
        (payload: any) => {
          setState((prev) => {
            if (payload.new.id === "structures") {
              return {
                ...prev,
                structuresConfig: payload.new.config_data,
              };
            } else if (payload.new.id === "researchs") {
              return {
                ...prev,
                researchsConfig: payload.new.config_data,
              };
            } else if (payload.new.id === "ships") {
              return {
                ...prev,
                shipsConfig: payload.new.config_data,
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

    // Subscribe to changes in structures
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
            switch (payload.eventType) {
              case "DELETE":
                return {
                  ...prev,
                  structures: prev.structures.filter(
                    (s) => s.id !== payload.old.id
                  ),
                };
              case "INSERT":
                return {
                  ...prev,
                  structures: [...prev.structures, payload.new],
                };
              case "UPDATE":
                return {
                  ...prev,
                  structures: prev.structures.map((s) =>
                    s.id === payload.new.id ? payload.new : s
                  ),
                };
              default:
                return prev;
            }
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
      state.loadedStructuresConfig &&
      state.loadedResearchsConfig &&
      state.loadedShipsConfig &&
      state.loadedPlanetResearchs
    ) {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [
    state.loadedPlanets,
    state.loadedResources,
    state.loadedStructures,
    state.loadedStructuresConfig,
    state.loadedResearchsConfig,
    state.loadedShipsConfig,
    state.loadedPlanetResearchs,
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
      const now = Date.now();
      const lastUpdate = state.resources.last_update;
      const elapsedSeconds = (now - lastUpdate) / 1000;

      // Calculate energy ratio and production malus
      const energyDeficit =
        state.resources.energy_production - state.resources.energy_consumption;
      let productionMalus = 1;
      if (energyDeficit < 0) {
        // Production scales from 100% at deficit=0 to 0% at deficit=-consumption or below
        productionMalus = 1 - energyDeficit / 100;
      }

      // Calculate current resources based on generation rates with energy malus
      const updatedResources: PlanetResources = {
        ...state.resources,
        metal:
          state.resources.metal >= state.resources.max_metal
            ? state.resources.metal
            : Math.min(
                state.resources.max_metal,
                state.resources.metal +
                  state.resources.metal_production_rate *
                    elapsedSeconds *
                    productionMalus
              ),
        microchips:
          state.resources.microchips >= state.resources.max_microchips
            ? state.resources.microchips
            : Math.min(
                state.resources.max_microchips,
                state.resources.microchips +
                  state.resources.microchips_production_rate *
                    elapsedSeconds *
                    productionMalus
              ),
        deuterium:
          state.resources.deuterium >= state.resources.max_deuterium
            ? state.resources.deuterium
            : Math.min(
                state.resources.max_deuterium,
                state.resources.deuterium +
                  state.resources.deuterium_production_rate *
                    elapsedSeconds *
                    productionMalus
              ),
        science:
          state.resources.science >= state.resources.max_science
            ? state.resources.science
            : Math.min(
                state.resources.max_science,
                state.resources.science +
                  state.resources.science_production_rate *
                    elapsedSeconds *
                    productionMalus
              ),
        energy_production: state.resources.energy_production,
        energy_consumption: state.resources.energy_consumption,
        last_update: now,
      };

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

  // Add presence tracking
  useEffect(() => {
    if (!authedUser) return;

    const channel = supabase.channel("online-users", {
      config: {
        presence: {
          key: authedUser.id,
        },
      },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const presenceState = channel.presenceState();
        const totalUsers = Object.keys(presenceState).length;

        setState((prev) => ({
          ...prev,
          activePlayers: totalUsers,
        }));
      })
      .on("presence", { event: "join" }, () => {
        setState((prev) => ({
          ...prev,
          activePlayers: prev.activePlayers + 1,
        }));
      })
      .on("presence", { event: "leave" }, () => {
        setState((prev) => ({
          ...prev,
          activePlayers: Math.max(0, prev.activePlayers - 1),
        }));
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
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
