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
} from "lucide-react";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { ShipType } from "../models/ship";
import { useState } from "react";
import { ScrollArea } from "../components/ui/scroll-area";

// Import ship images
import colonyShipImg from "../assets/ships/colony_ship.png";
import transportShipImg from "../assets/ships/transport_ship.png";
import spyProbeImg from "../assets/ships/spy_probe.png";
import recyclerShipImg from "../assets/ships/recycler_ship.png";
import cruiserImg from "../assets/ships/cruiser.png";

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

function ShipCard({ type, config }: { type: ShipType; config: any }) {
  const { state, currentResources } = useGame();
  const asset = SHIP_ASSETS[type];
  const shipyard = state.structures?.find((s) => s.type === "shipyard");

  // Check if requirements are met
  const meetsShipyardLevel =
    shipyard && shipyard.level >= config.requirements.shipyard_level;
  const meetsTechRequirements = config.requirements.technologies.every(
    (req: any) =>
      state.planetResearchs!.technologies[req.id]?.level >= req.level
  );

  const canAfford =
    currentResources.metal >= config.cost.metal &&
    currentResources.deuterium >= config.cost.deuterium &&
    currentResources.microchips >= config.cost.microchips &&
    currentResources.science >= config.cost.science;

  const handleBuild = async () => {
    // TODO: Implement ship building through API
  };

  return (
    <Card
      className={`bg-card/50 backdrop-blur-sm transition-all duration-300 ${
        meetsShipyardLevel && meetsTechRequirements && canAfford
          ? "neon-border hover:shadow-[0_0_20px_rgba(32,224,160,0.3)]"
          : "border-red-500/50"
      }`}
    >
      <CardHeader className="flex flex-row items-start gap-6 pb-2">
        <div className="w-2/5 aspect-square">
          <img
            src={asset.image}
            alt={asset.name}
            className={`w-full h-full object-cover rounded-lg ${
              (!meetsShipyardLevel || !meetsTechRequirements || !canAfford) &&
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
                currentResources.metal < config.cost.metal
                  ? "text-red-400"
                  : "text-muted-foreground"
              }`}
            >
              <Hammer className="h-4 w-4" />
              <span>{config.cost.metal}</span>
            </div>
            <div
              className={`flex items-center gap-2 ${
                currentResources.deuterium < config.cost.deuterium
                  ? "text-red-400"
                  : "text-muted-foreground"
              }`}
            >
              <Flame className="h-4 w-4" />
              <span>{config.cost.deuterium}</span>
            </div>
            <div
              className={`flex items-center gap-2 ${
                currentResources.microchips < config.cost.microchips
                  ? "text-red-400"
                  : "text-muted-foreground"
              }`}
            >
              <Microchip className="h-4 w-4" />
              <span>{config.cost.microchips}</span>
            </div>
            <div
              className={`flex items-center gap-2 ${
                currentResources.science < config.cost.science
                  ? "text-red-400"
                  : "text-muted-foreground"
              }`}
            >
              <Beaker className="h-4 w-4" />
              <span>{config.cost.science}</span>
            </div>
          </div>

          <Button
            onClick={handleBuild}
            disabled={
              !meetsShipyardLevel || !meetsTechRequirements || !canAfford
            }
            className="mt-2"
          >
            Build Ship
          </Button>
        </div>
      </CardHeader>
    </Card>
  );
}

export function Shipyard() {
  const { state } = useGame();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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
              {selectedCategory ? (
                <div className="grid grid-cols-1 gap-6">
                  {SHIP_CATEGORIES[selectedCategory]!.types.map(
                    (type: ShipType) => (
                      <ShipCard
                        key={type}
                        type={type}
                        config={state.shipsConfig!.available_ships[type]}
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
