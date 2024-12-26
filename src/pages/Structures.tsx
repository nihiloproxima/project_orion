import { useEffect, useState } from "react";
import { useGame } from "../contexts/GameContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Structure, StructureType } from "../models/structure";
import { Button } from "../components/ui/button";
import { Building2, AlertCircle } from "lucide-react";
import { supabase } from "../lib/supabase";

// Import structure images
import metalMineImg from "../assets/structures/metal_mine.png";
import energyPlantImg from "../assets/structures/energy_plant.png";
import deuteriumSynthesizerImg from "../assets/structures/deuterium_synthesizer.png";
import researchLabImg from "../assets/structures/research_lab.png";
import shipYardImg from "../assets/structures/shipyard.png";
import defenseFactoryImg from "../assets/structures/defense_factory.png";
import { api } from "../lib/api";
import { GameStructuresConfig } from "../models/structures_config";

interface StructureInfo {
  type: StructureType;
  name: string;
  description: string;
  productionType: string;
  icon: JSX.Element;
  image: string;
}

const STRUCTURE_INFO: Record<StructureType, StructureInfo> = {
  metal_mine: {
    type: "metal_mine",
    name: "Metal Mine",
    description: "Extracts metal from planetary deposits",
    productionType: "metal",
    icon: <Building2 className="h-5 w-5" />,
    image: metalMineImg,
  },
  energy_plant: {
    type: "energy_plant",
    name: "Energy Plant",
    description: "Generates energy from various sources",
    productionType: "energy",
    icon: <Building2 className="h-5 w-5" />,
    image: energyPlantImg,
  },
  deuterium_synthesizer: {
    type: "deuterium_synthesizer",
    name: "Deuterium Synthesizer",
    description: "Extracts and processes deuterium",
    productionType: "deuterium",
    icon: <Building2 className="h-5 w-5" />,
    image: deuteriumSynthesizerImg,
  },
  research_lab: {
    type: "research_lab",
    name: "Research Laboratory",
    description: "Generates science points for research",
    productionType: "science",
    icon: <Building2 className="h-5 w-5" />,
    image: researchLabImg,
  },
  shipyard: {
    type: "shipyard",
    name: "Shipyard",
    description: "Constructs and maintains spacecraft",
    productionType: "none",
    icon: <Building2 className="h-5 w-5" />,
    image: shipYardImg,
  },
  defense_factory: {
    type: "defense_factory",
    name: "Defense Factory",
    description: "Constructs and maintains defense systems",
    productionType: "none",
    icon: <Building2 className="h-5 w-5" />,
    image: defenseFactoryImg,
  },
};

interface ConstructionTimerProps {
  finishTime: string;
}

function ConstructionTimer({ finishTime }: ConstructionTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const finishTimeMs = new Date(finishTime).getTime();
    const startTimeMs = new Date(finishTime).getTime() - 5 * 60 * 1000; // 5 minutes construction time
    const total = finishTimeMs - startTimeMs;

    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, finishTimeMs - now);
      const elapsed = now - startTimeMs;

      setTimeRemaining(remaining);
      // Calculate progress based on elapsed time
      setProgress(Math.max(0, Math.min(100, (elapsed / total) * 100)));

      // Request next animation frame if still in progress
      if (remaining > 0) {
        requestAnimationFrame(updateTimer);
      }
    };

    // Start animation loop
    const animationId = requestAnimationFrame(updateTimer);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [finishTime]);

  if (timeRemaining <= 0) {
    return;
  }

  const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

  const timeString = [
    days > 0 && `${days}d`,
    hours > 0 && `${hours}h`,
    minutes > 0 && `${minutes}m`,
    `${seconds}s`,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="space-y-2">
      <div className="text-sm font-mono text-primary/70">
        Time remaining: {timeString}
      </div>
      <div className="relative h-2 bg-primary/10 rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-primary/30"
          style={{ width: `${progress}%` }}
        />
        <div
          className="absolute inset-y-0 left-0 bg-primary animate-pulse"
          style={{
            width: "2px",
            left: `${progress}%`,
            boxShadow:
              "0 0 10px theme(colors.primary.DEFAULT), 0 0 5px theme(colors.primary.DEFAULT)",
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-[10px] text-primary/70 font-mono">
          {Math.round(progress)}%
        </div>
      </div>
    </div>
  );
}

export function Structures() {
  const { state } = useGame();
  const [structures, setStructures] = useState<Structure[]>([]);
  const [loadingStructures, setLoadingStructures] = useState(true);
  const [loading, setLoading] = useState(true);
  const [constructing, setConstructing] = useState<string | null>(null);
  const [structuresConfig, setStructuresConfig] =
    useState<GameStructuresConfig | null>(null);
  const [loadingStructuresConfig, setLoadingStructuresConfig] = useState(true);

  useEffect(() => {
    if (!loadingStructures || !loadingStructuresConfig) {
      setLoading(false);
    }
  }, [loadingStructures, loadingStructuresConfig]);

  useEffect(() => {
    // Fetch initial structures config
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

      console.log("Fetched structures config:", data);
      setStructuresConfig(data.config_data as GameStructuresConfig);
      setLoadingStructuresConfig(false);
    };

    fetchStructuresConfig();

    // Subscribe to structures config changes
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
          console.log("Received structures config update", payload);
          setStructuresConfig(payload.new.config_data);
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

      setStructures(data || []);
      setLoadingStructures(false);
    };

    fetchStructures();

    // Subscribe to structure updates
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
          console.log("Received structure update", payload);
          if (payload.eventType === "DELETE") {
            setStructures((current) =>
              current.filter((s) => s.id !== payload.old.id)
            );
          } else if (payload.eventType === "INSERT") {
            setStructures((current) => [...current, payload.new]);
          } else if (payload.eventType === "UPDATE") {
            setStructures((current) =>
              current.map((s) => (s.id === payload.new.id ? payload.new : s))
            );
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [state.selectedPlanet]);

  const calculateHourlyProduction = (structure: Structure) => {
    if (!structuresConfig) return 0;
    if (structure.level === 0) return 0;

    const config =
      structuresConfig[structure.type as keyof GameStructuresConfig];
    const baseProduction = config.base_production_rate;
    const levelBonus =
      (structure.level - 1) * config.production_rate_increase_per_level;
    const productionPerSecond = baseProduction * (1 + levelBonus);

    const productionPerHour = productionPerSecond * 3600;
    return productionPerHour;
  };

  const startConstruction = async (type: StructureType) => {
    if (!state.selectedPlanet) return;

    setConstructing(type);

    try {
      await api.structures.construct(state.selectedPlanet.id, type);
    } catch (error) {
      console.error("Error starting construction:", error);
    } finally {
      setConstructing(null);
    }
  };

  const upgradeStructure = async (structure: Structure) => {
    setConstructing(structure.type);
    try {
      const { error } = await supabase
        .from("structures")
        .update({
          is_under_construction: true,
          construction_finish_time: new Date(Date.now() + 1000 * 60 * 5), // 5 minutes upgrade time
        })
        .eq("id", structure.id);

      if (error) throw error;
    } catch (error) {
      console.error("Error upgrading structure:", error);
    } finally {
      setConstructing(null);
    }
  };

  if (loading) {
    return <div className="text-center neon-text">LOADING STRUCTURES...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold neon-text mb-2">
          PLANETARY STRUCTURES
        </h1>
        <p className="text-muted-foreground">
          Manage and upgrade your planetary infrastructure
        </p>
      </div>

      {loading ? (
        <div className="text-center neon-text">LOADING STRUCTURES...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(STRUCTURE_INFO).map(([type, info]) => {
            const existingStructure = structures.find((s) => s.type === type);

            return (
              <Card
                key={type}
                className="bg-card/50 backdrop-blur-sm neon-border hover:shadow-[0_0_20px_rgba(32,224,160,0.3)] transition-all duration-300"
              >
                <CardHeader className="flex flex-col items-center gap-4 pb-2">
                  <div className="w-full aspect-square">
                    <img
                      src={info.image}
                      alt={info.name}
                      className="w-full h-full object-cover rounded-t-lg"
                    />
                  </div>
                  <CardTitle className="text-sm font-medium neon-text">
                    {info.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {info.description}
                  </p>

                  {existingStructure ? (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Level</span>
                        <span className="font-mono">
                          {existingStructure.level}
                        </span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span>Production</span>
                        <span className="font-mono">
                          {calculateHourlyProduction(existingStructure)}/hour
                        </span>
                      </div>

                      {existingStructure.is_under_construction &&
                      existingStructure.construction_finish_time !== null ? (
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2 text-yellow-500">
                            <AlertCircle className="h-4 w-4" />
                            <span className="text-sm">
                              {existingStructure.level === 0
                                ? "Constructing..."
                                : "Upgrading..."}
                            </span>
                          </div>
                          <ConstructionTimer
                            finishTime={
                              existingStructure.construction_finish_time
                            }
                          />
                        </div>
                      ) : (
                        <>
                          <div className="text-sm space-y-1">
                            <div className="flex justify-between">
                              <span>Metal Required:</span>
                              <span
                                className={`font-mono ${
                                  state.resources.metal >=
                                  structuresConfig?.[type5]!.upgrade_cost
                                    .metal *
                                    (existingStructure.level + 1)
                                    ? "text-green-500"
                                    : "text-red-500"
                                }`}
                              >
                                {structuresConfig![type]!.upgrade_cost.metal *
                                  (existingStructure.level + 1)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Deuterium Required:</span>
                              <span
                                className={`font-mono ${
                                  state.resources.deuterium >=
                                  structuresConfig![type]!.upgrade_cost
                                    .deuterium *
                                    (existingStructure.level + 1)
                                    ? "text-green-500"
                                    : "text-red-500"
                                }`}
                              >
                                {structuresConfig![type]!.upgrade_cost
                                  .deuterium *
                                  (existingStructure.level + 1)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Energy Required:</span>
                              <span
                                className={`font-mono ${
                                  state.resources.energy >=
                                  structuresConfig![type]!.upgrade_cost.energy *
                                    (existingStructure.level + 1)
                                    ? "text-green-500"
                                    : "text-red-500"
                                }`}
                              >
                                {structuresConfig![type]!.upgrade_cost.energy *
                                  (existingStructure.level + 1)}
                              </span>
                            </div>
                          </div>
                          <Button
                            onClick={() => upgradeStructure(existingStructure)}
                            disabled={
                              constructing !== null ||
                              state.resources.metal <
                                structuresConfig![type]!.upgrade_cost.metal *
                                  (existingStructure.level + 1) ||
                              state.resources.deuterium <
                                structuresConfig![type]!.upgrade_cost
                                  .deuterium *
                                  (existingStructure.level + 1) ||
                              state.resources.energy <
                                structuresConfig![type]!.upgrade_cost.energy *
                                  (existingStructure.level + 1)
                            }
                            className="w-full bg-primary hover:bg-primary/60"
                          >
                            {constructing !== null
                              ? "Construction in Progress"
                              : `Upgrade to Level ${
                                  existingStructure.level + 1
                                }`}
                          </Button>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span>Metal Required:</span>
                          <span
                            className={`font-mono ${
                              state.resources.metal >=
                              (structuresConfig![type]!.initial_cost.metal || 0)
                                ? "text-green-500"
                                : "text-red-500"
                            }`}
                          >
                            {structuresConfig![type]!.initial_cost.metal || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Deuterium Required:</span>
                          <span
                            className={`font-mono ${
                              state.resources.deuterium >=
                              (structuresConfig![type]!.initial_cost
                                .deuterium || 0)
                                ? "text-green-500"
                                : "text-red-500"
                            }`}
                          >
                            {structuresConfig![type]!.initial_cost.deuterium ||
                              0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Energy Required:</span>
                          <span
                            className={`font-mono ${
                              state.resources.energy >=
                              (structuresConfig![type]!.initial_cost.energy ||
                                0)
                                ? "text-green-500"
                                : "text-red-500"
                            }`}
                          >
                            {structuresConfig![type]!.initial_cost.energy || 0}
                          </span>
                        </div>
                      </div>
                      <Button
                        onClick={() => startConstruction(type as StructureType)}
                        disabled={
                          constructing !== null ||
                          state.resources.metal <
                            (structuresConfig![type]!.initial_cost.metal ||
                              0) ||
                          state.resources.deuterium <
                            (structuresConfig![type]!.initial_cost.deuterium ||
                              0) ||
                          state.resources.energy <
                            (structuresConfig![type]!.initial_cost.energy || 0)
                        }
                        className="w-full bg-primary hover:bg-primary/60"
                      >
                        {constructing !== null
                          ? "Construction in Progress"
                          : state.resources.metal <
                              (structuresConfig![
                                type as keyof GameStructuresConfig
                              ].initial_cost.metal || 0) ||
                            state.resources.deuterium <
                              (structuresConfig![
                                type as keyof GameStructuresConfig
                              ].initial_cost.deuterium || 0) ||
                            state.resources.energy <
                              (structuresConfig![
                                type as keyof GameStructuresConfig
                              ].initial_cost.energy || 0)
                          ? "Insufficient Resources"
                          : "Construct"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
