import { useGame } from "../contexts/GameContext";
import { Card, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  AlertTriangle,
  Anchor,
  Ship,
  Shield,
  Rocket,
  Hammer,
  Flame,
  Microchip,
  Beaker,
  Lock,
  FolderOpen,
  ChevronRight,
  Plus,
  Minus,
  Clock,
  Loader2,
} from "lucide-react";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { ShipType } from "../models/ship";
import { useState, useEffect } from "react";
import { ScrollArea } from "../components/ui/scroll-area";
import { ShipyardQueue } from "../models/shipyard_queue";
import { supabase } from "../lib/supabase";

// Import ship images
import colonyShipImg from "../assets/ships/colony_ship.png";
import transportShipImg from "../assets/ships/transport_ship.png";
import spyProbeImg from "../assets/ships/spy_probe.png";
import recyclerShipImg from "../assets/ships/recycler_ship.png";
import cruiserImg from "../assets/ships/cruiser.png";
import { api } from "../lib/api";
import { Timer } from "../components/Timer";
import { formatTimerTime } from "../lib/utils";
import { ShipConfig } from "../models/ships_config";

const QUEUE_CAPACITY = 5;

const SHIP_CATEGORIES: Record<
  string,
  { name: string; description: string; types: ShipType[] }
> = {
  civilian: {
    name: "CIVILIAN_SHIPS",
    description: "Non-combat vessels for logistics and expansion",
    types: ["colony_ship", "transport_ship"] as ShipType[],
  },
  military: {
    name: "MILITARY_SHIPS",
    description: "Combat vessels for warfare and defense",
    types: ["cruiser"] as ShipType[],
  },
  special: {
    name: "SPECIAL_SHIPS",
    description: "Specialized vessels for specific operations",
    types: ["spy_probe", "recycler_ship"] as ShipType[],
  },
};

const SHIP_ASSETS: Record<
  ShipType,
  { name: string; image: string; description: string }
> = {
  colony_ship: {
    name: "Colony Ship",
    image: colonyShipImg,
    description:
      "Required for expanding to new planets. Carries necessary equipment and initial colonists.",
  },
  transport_ship: {
    name: "Transport Ship",
    image: transportShipImg,
    description:
      "Moves resources between planets. Various sizes available for different cargo capacities.",
  },
  spy_probe: {
    name: "Spy Probe",
    image: spyProbeImg,
    description:
      "Gathers intelligence on other planets. Can detect resource levels and structures.",
  },
  recycler_ship: {
    name: "Recycler Ship",
    image: recyclerShipImg,
    description:
      "Specialized for collecting debris after battles and mining asteroids.",
  },
  cruiser: {
    name: "Cruiser",
    image: cruiserImg,
    description:
      "Fast and powerful combat vessels. Excellent for both attack and defense.",
  },
};

function QueueDisplay({ queue }: { queue: ShipyardQueue | null }) {
  if (!queue || queue.commands.length === 0) {
    return (
      <div className="text-muted-foreground text-sm mb-6">
        No ships currently in production
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        Production Queue ({queue.commands.length}/{queue.capacity})
      </h2>
      <div className="grid gap-3">
        {queue.commands.map((command, index) => {
          const asset = SHIP_ASSETS[command.ship_type];
          const isInProgress = index === 0;

          return (
            <Card key={index} className="bg-black/30">
              <CardHeader className="flex flex-row items-center p-4">
                <img
                  src={asset.image}
                  alt={asset.name}
                  className="w-12 h-12 rounded mr-4"
                  onError={(e) => {
                    e.currentTarget.src = "/src/assets/ships/default.png";
                  }}
                />
                <div className="flex-1">
                  <div className="font-bold">{asset.name}</div>
                  <div className="text-sm text-muted-foreground">
                    Remaining ships: {command.remaining_amount}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total ships: {command.total_amount}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-primary">
                  {isInProgress ? (
                    <Timer
                      startTime={command.current_item_start_time}
                      finishTime={command.current_item_finish_time}
                      showProgressBar={true}
                    />
                  ) : (
                    <div className="text-sm">
                      Starts in:{" "}
                      {formatTimerTime(
                        (queue.commands[0].construction_finish_time -
                          Date.now()) /
                          1000
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function ShipCard({
  type,
  config,
  queue,
}: {
  type: ShipType;
  config: ShipConfig;
  queue: ShipyardQueue | null;
}) {
  const { state, currentResources } = useGame();
  const [buildAmount, setBuildAmount] = useState(1);
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const asset = SHIP_ASSETS[type];
  const shipyard = state.structures?.find((s) => s.type === "shipyard");

  useEffect(() => {
    if (queue?.commands?.length && queue.commands.length > 0) {
      const firstCommand = queue!.commands[0];
      setRemainingTime(
        firstCommand.construction_finish_time - Date.now() / 1000
      );
    }

    const timer = setInterval(() => {
      setRemainingTime((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [queue]);

  // Check if requirements are met
  const meetsShipyardLevel =
    shipyard && shipyard.level >= config.requirements.shipyard_level;
  const meetsTechRequirements = config.requirements.technologies.every(
    (req: any) =>
      state.planetResearchs!.technologies[req.id]?.level >= req.level
  );

  // Calculate max ships possible with current resources
  const maxShipsPerResource = {
    metal: Math.floor(currentResources.metal / config.cost.metal),
    deuterium: Math.floor(currentResources.deuterium / config.cost.deuterium),
    microchips: Math.floor(
      currentResources.microchips / config.cost.microchips
    ),
    science: Math.floor(currentResources.science / config.cost.science),
  };

  const maxPossibleShips = Math.min(...Object.values(maxShipsPerResource));

  const canAfford = buildAmount <= maxPossibleShips;

  // Calculate build time based on shipyard level and amount
  const baseTime = config.construction_time || 60; // Default 60 seconds if not specified
  const buildTime = baseTime * buildAmount;

  const isQueueFull = (queue?.commands?.length || 0) >= (queue?.capacity || 0);
  const isTypeInQueue = queue?.commands?.some((cmd) => cmd.ship_type === type);

  const handleBuild = async () => {
    if (!state.selectedPlanet?.id || isQueueFull) return;
    try {
      await api.fleet.buildShip(type, state.selectedPlanet.id, buildAmount);
    } catch (error) {
      console.error("Error building ship:", error);
    }
  };

  const adjustAmount = (delta: number) => {
    const newAmount = Math.max(
      1,
      Math.min(buildAmount + delta, maxPossibleShips)
    );
    setBuildAmount(newAmount);
  };

  return (
    <Card
      className={`bg-card/50 backdrop-blur-sm transition-all duration-300 ${
        meetsShipyardLevel && meetsTechRequirements && canAfford && !isQueueFull
          ? "neon-border hover:shadow-[0_0_20px_rgba(32,224,160,0.3)]"
          : "border-red-500/50"
      }`}
    >
      <CardHeader className="flex flex-row items-start gap-6 pb-2">
        <div className="w-2/5 aspect-square relative">
          <img
            src={asset.image}
            alt={asset.name}
            className={`w-full h-full object-cover rounded-lg ${
              (!meetsShipyardLevel ||
                !meetsTechRequirements ||
                !canAfford ||
                isQueueFull) &&
              "opacity-50"
            }`}
            onError={(e) => {
              e.currentTarget.src = "/src/assets/ships/default.png";
            }}
          />
        </div>
        <div className="flex flex-col gap-2 w-3/5">
          <CardTitle className="text-xl font-bold neon-text tracking-wide uppercase">
            {asset.name}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{asset.description}</p>

          {isQueueFull && (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span>Build queue is full ({QUEUE_CAPACITY} max)</span>
            </div>
          )}

          {!meetsShipyardLevel && (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <Lock className="h-4 w-4" />
              <span>
                Requires Shipyard Level {config.requirements.shipyard_level}
              </span>
            </div>
          )}

          {!meetsTechRequirements && (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <Lock className="h-4 w-4" />
                <span>Missing Technology Requirements:</span>
              </div>
              {config.requirements.technologies.map((req: any) => (
                <div
                  key={req.id}
                  className="flex items-center gap-2 text-red-400 text-xs ml-6"
                >
                  <span>
                    • {req.id} Level {req.level}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <Ship className="h-4 w-4 text-blue-400" />
              <span>
                Speed: {config.stats.speed.min}-{config.stats.speed.max}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-400" />
              <span>
                Defense: {config.stats.defense.min}-{config.stats.defense.max}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Rocket className="h-4 w-4 text-red-400" />
              <span>
                Attack: {config.stats.attack_power.min}-
                {config.stats.attack_power.max}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Anchor className="h-4 w-4 text-yellow-400" />
              <span>
                Cargo: {config.stats.cargo_capacity.min}-
                {config.stats.cargo_capacity.max}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <div
              className={`flex items-center gap-2 ${
                currentResources.metal < config.cost.metal * buildAmount
                  ? "text-red-400"
                  : "text-muted-foreground"
              }`}
            >
              <Hammer className="h-4 w-4" />
              <span>{config.cost.metal * buildAmount}</span>
            </div>
            <div
              className={`flex items-center gap-2 ${
                currentResources.deuterium < config.cost.deuterium * buildAmount
                  ? "text-red-400"
                  : "text-muted-foreground"
              }`}
            >
              <Flame className="h-4 w-4" />
              <span>{config.cost.deuterium * buildAmount}</span>
            </div>
            <div
              className={`flex items-center gap-2 ${
                currentResources.microchips <
                config.cost.microchips * buildAmount
                  ? "text-red-400"
                  : "text-muted-foreground"
              }`}
            >
              <Microchip className="h-4 w-4" />
              <span>{config.cost.microchips * buildAmount}</span>
            </div>
            <div
              className={`flex items-center gap-2 ${
                currentResources.science < config.cost.science * buildAmount
                  ? "text-red-400"
                  : "text-muted-foreground"
              }`}
            >
              <Beaker className="h-4 w-4" />
              <span>{config.cost.science * buildAmount}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground mt-2">
            <Clock className="h-4 w-4" />
            <span>Build Time: {formatTimerTime(buildTime)}</span>
          </div>

          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2 bg-black/30 rounded-lg p-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => adjustAmount(-1)}
                disabled={buildAmount <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center">{buildAmount}</span>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => adjustAmount(1)}
                disabled={buildAmount >= maxPossibleShips}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button
              onClick={handleBuild}
              disabled={
                !meetsShipyardLevel ||
                !meetsTechRequirements ||
                !canAfford ||
                isQueueFull
              }
              className="flex-1"
            >
              Build Ships
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}

export function Shipyard() {
  const { state } = useGame();
  const [selectedCategory, setSelectedCategory] = useState<string>("civilian");
  const [queue, setQueue] = useState<ShipyardQueue | null>(null);

  useEffect(() => {
    if (!state.selectedPlanet?.id) return;

    // Initial fetch
    const fetchQueue = async () => {
      const { data } = await supabase
        .from("shipyard_queues")
        .select("*")
        .eq("planet_id", state.selectedPlanet!.id)
        .single();

      if (data) {
        setQueue(data as ShipyardQueue);
      }
    };

    fetchQueue();

    // Subscribe to changes
    const subscription = supabase
      .channel(`shipyard_queue_${state.selectedPlanet.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "shipyard_queues",
          filter: `planet_id=eq.${state.selectedPlanet.id}`,
        },
        (payload) => {
          setQueue(payload.new as ShipyardQueue);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [state.selectedPlanet?.id]);

  // Check if shipyard exists
  const hasShipyard = state.structures?.some(
    (structure) => structure.type === "shipyard"
  );

  if (!hasShipyard) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] space-y-6 text-center">
        <AlertTriangle className="w-16 h-16 text-red-500 animate-pulse" />
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-red-500">ACCESS DENIED</h2>
          <div className="font-mono text-sm text-muted-foreground max-w-md">
            <p className="mb-2">[ERROR CODE: NO_SHIPYARD_DETECTED]</p>
            <p>Shipyard structure required for spacecraft construction.</p>
            <p>
              Please construct a shipyard to access ship building capabilities.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold neon-text mb-2 flex items-center gap-2">
            <Ship className="h-8 w-8" />
            SHIPYARD
          </h1>
          <p className="text-muted-foreground">
            Construct and manage your fleet of spacecraft
          </p>
        </div>

        <div className="grid grid-cols-4 gap-6">
          {/* File Explorer Side Panel */}
          <div className="col-span-1 bg-black/50 p-4 rounded-lg border border-primary/30 h-[calc(100vh-12rem)]">
            <div className="font-mono text-sm space-y-2">
              <div className="text-primary/70 mb-4">{">"} SELECT_CATEGORY:</div>
              {Object.entries(SHIP_CATEGORIES).map(([key, category]) => (
                <Button
                  key={key}
                  variant="ghost"
                  className={`w-full justify-start ${
                    selectedCategory === key ? "bg-primary/20" : ""
                  }`}
                  onClick={() => setSelectedCategory(key)}
                >
                  <FolderOpen className="mr-2 h-4 w-4" />
                  <span className="font-mono">{category.name}</span>
                  <ChevronRight className="ml-auto h-4 w-4" />
                </Button>
              ))}
            </div>
          </div>

          {/* Ship Cards Display */}
          <div className="col-span-3 h-[calc(100vh-12rem)]">
            <ScrollArea className="h-full pr-4">
              <QueueDisplay queue={queue} />

              {selectedCategory ? (
                <div className="grid grid-cols-1 gap-6">
                  {SHIP_CATEGORIES[selectedCategory]!.types.map(
                    (type: ShipType) => (
                      <ShipCard
                        key={type}
                        type={type}
                        config={state.shipsConfig!.available_ships[type]}
                        queue={queue}
                      />
                    )
                  )}
                </div>
              ) : (
                <div className="text-center text-muted-foreground font-mono">
                  <p>{">"} SELECT A CATEGORY TO VIEW AVAILABLE SHIPS</p>
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
