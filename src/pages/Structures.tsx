import { ConstructionTimer } from "../components/ConstructionTimer";
import { useGame } from "../contexts/GameContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Structure, StructureType } from "../models/structure";
import { Button } from "../components/ui/button";
import { Building2 } from "lucide-react";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { GameStructuresConfig } from "../models/structures_config";

// Import structure images
import metalMineImg from "../assets/structures/metal_mine.png";
import energyPlantImg from "../assets/structures/energy_plant.png";
import deuteriumSynthesizerImg from "../assets/structures/deuterium_synthesizer.png";
import researchLabImg from "../assets/structures/research_lab.png";
import shipYardImg from "../assets/structures/shipyard.png";
import defenseFactoryImg from "../assets/structures/defense_factory.png";
import microchipFactoryImg from "../assets/structures/microchip_factory.png";

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
  microchip_factory: {
    type: "microchip_factory",
    name: "Microchip Factory",
    description: "Produces microchips",
    productionType: "microchips",
    icon: <Building2 className="h-5 w-5" />,
    image: microchipFactoryImg,
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

const formatConstructionTime = (seconds: number) => {
  if (seconds < 60) {
    return `${Math.ceil(seconds)} seconds`;
  }
  if (seconds < 3600) {
    return `${Math.ceil(seconds / 60)} minutes`;
  }
  if (seconds < 86400) {
    return `${Math.ceil(seconds / 3600)} hours`;
  }
  return `${Math.ceil(seconds / 86400)} days`;
};

function StructureCard({
  info,
  existingStructure,
  config,
  state,
}: {
  info: StructureInfo;
  existingStructure?: Structure;
  config: GameStructuresConfig[keyof GameStructuresConfig];
  state: any; // Replace with proper type
}) {
  const [structure, setStructure] = useState(existingStructure);
  const { currentResources } = useGame();

  useEffect(() => {
    setStructure(existingStructure);
  }, [existingStructure]);

  const onUpgrade = async (structure: Structure) => {
    await api.structures.upgrade(state.selectedPlanet.id, structure.id);
  };

  const onConstruct = async (type: StructureType) => {
    await api.structures.construct(state.selectedPlanet.id, type);
  };

  const calculateHourlyProduction = (structure: Structure) => {
    if (!state.structuresConfig || structure.level === 0) return 0;

    const energyRatio =
      currentResources.energy_production / currentResources.energy_consumption;
    const productionEfficiency = energyRatio >= 1 ? 1 : energyRatio;

    return structure.production_rate * 3600 * productionEfficiency;
  };

  const level = structure?.level ?? 0;
  const upgradeCosts = {
    metal: config.upgrade_cost.metal * (level + 1),
    deuterium: config.upgrade_cost.deuterium * (level + 1),
    microchips: config.upgrade_cost.microchips * (level + 1),
    science: config.upgrade_cost.science * (level + 1),
  };

  const initialCosts = {
    metal: config.initial_cost.metal,
    deuterium: config.initial_cost.deuterium,
    microchips: config.initial_cost.microchips,
    science: config.initial_cost.science,
  };

  const energyConsumption =
    (config.energy_consumption_increase_per_level || 0) * level;

  const nextLevelEnergyConsumption =
    (config.energy_consumption_increase_per_level || 0) * (level + 1);

  const futureEnergyRatio =
    info.type === "energy_plant"
      ? (currentResources.energy_production - nextLevelEnergyConsumption) /
        currentResources.energy_consumption
      : currentResources.energy_production /
        (currentResources.energy_consumption + nextLevelEnergyConsumption);

  const constructionTime =
    level === 0
      ? config.construction_time_seconds
      : config.construction_time_seconds *
        config.construction_time_multiplier *
        level;

  return (
    <Card className="bg-card/50 backdrop-blur-sm neon-border hover:shadow-[0_0_20px_rgba(32,224,160,0.3)] transition-all duration-300">
      <CardHeader className="flex flex-row items-start gap-6 pb-2">
        <div className="w-1/3 aspect-square">
          <img
            src={info.image}
            alt={info.name}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>

        <div className="flex flex-col gap-2">
          <CardTitle className="text-xl font-bold neon-text tracking-wide uppercase hover:scale-105 transition-transform">
            {info.name}
          </CardTitle>

          <p className="text-sm text-muted-foreground">{info.description}</p>

          {structure && info.productionType !== "none" && (
            <div className="text-sm text-primary/70 font-medium">
              <div
                className={
                  currentResources.energy_production <
                  currentResources.energy_consumption
                    ? "text-red-400"
                    : ""
                }
              >
                Produces:{" "}
                {info.type === "energy_plant"
                  ? structure.production_rate
                  : Math.floor(calculateHourlyProduction(structure))}{" "}
                {info.type === "energy_plant"
                  ? info.productionType
                  : `${info.productionType}/hour`}
              </div>
              <div className="text-sm text-violet-400/70">
                Energy Consumption: {energyConsumption}
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4 border-t border-primary/20">
        {structure ? (
          <ExistingStructureContent
            structure={structure}
            info={info}
            upgradeCosts={upgradeCosts}
            constructionTime={constructionTime}
            onUpgrade={onUpgrade}
            futureEnergyRatio={futureEnergyRatio}
          />
        ) : (
          <NewStructureContent
            initialCosts={initialCosts}
            constructionTime={constructionTime}
            info={info}
            onConstruct={onConstruct}
            energyConsumption={energyConsumption}
            futureEnergyRatio={futureEnergyRatio}
          />
        )}
      </CardContent>
    </Card>
  );
}

interface ExistingStructureContentProps {
  structure: Structure;
  info: StructureInfo;
  upgradeCosts: {
    metal: number;
    deuterium: number;
    microchips: number;
    science: number;
  };
  constructionTime: number;
  onUpgrade: (structure: Structure) => void;
  futureEnergyRatio: number;
}

function ExistingStructureContent({
  structure,
  info,
  upgradeCosts,
  constructionTime,
  onUpgrade,
  futureEnergyRatio,
}: ExistingStructureContentProps) {
  const { currentResources } = useGame();

  const canAfford =
    currentResources.metal >= upgradeCosts.metal &&
    currentResources.deuterium >= upgradeCosts.deuterium &&
    currentResources.science >= upgradeCosts.science &&
    currentResources.microchips >= upgradeCosts.microchips;

  if (
    structure.is_under_construction &&
    structure.construction_finish_time &&
    structure.construction_start_time
  ) {
    return (
      <div className="space-y-4">
        <div className="text-sm text-primary/70">Under Construction</div>
        <ConstructionTimer
          startTime={structure.construction_start_time}
          finishTime={structure.construction_finish_time}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-primary/70">Level {structure.level}</div>
      <p className="text-sm text-muted-foreground">{info.description}</p>

      <div className="space-y-2">
        <div className="text-sm font-medium">Upgrade Costs:</div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {upgradeCosts.metal > 0 && (
            <div
              className={
                currentResources.metal < upgradeCosts.metal
                  ? "text-red-500"
                  : "text-green-500"
              }
            >
              Metal: {Math.floor(upgradeCosts.metal)}
            </div>
          )}
          {upgradeCosts.deuterium > 0 && (
            <div
              className={
                currentResources.deuterium < upgradeCosts.deuterium
                  ? "text-red-500"
                  : "text-green-500"
              }
            >
              Deuterium: {Math.floor(upgradeCosts.deuterium)}
            </div>
          )}
          {upgradeCosts.microchips > 0 && (
            <div
              className={
                currentResources.microchips < upgradeCosts.microchips
                  ? "text-red-500"
                  : "text-green-500"
              }
            >
              Microchips: {Math.floor(upgradeCosts.microchips)}
            </div>
          )}
          {upgradeCosts.science > 0 && (
            <div
              className={
                currentResources.science < upgradeCosts.science
                  ? "text-red-500"
                  : "text-green-500"
              }
            >
              Science: {Math.floor(upgradeCosts.science)}
            </div>
          )}
        </div>
      </div>

      <div className="text-sm">
        Construction Time: {formatConstructionTime(constructionTime)}
      </div>
      {futureEnergyRatio < 1 ? (
        <div className="text-sm text-amber-400">
          Warning: This upgrade will result in an energy ratio of{" "}
          {futureEnergyRatio.toFixed(2)}, reducing production efficiency
        </div>
      ) : (
        futureEnergyRatio >
          currentResources.energy_production /
            currentResources.energy_consumption && (
          <div className="text-sm text-emerald-400">
            This upgrade will improve energy ratio to{" "}
            {futureEnergyRatio.toFixed(2)}, increasing production efficiency
          </div>
        )
      )}

      <Button
        className={`w-full ${!canAfford ? "opacity-50" : ""}`}
        onClick={() => onUpgrade(structure)}
        disabled={structure.is_under_construction || !canAfford}
      >
        {canAfford
          ? `Upgrade to Level ${structure.level + 1}`
          : "Not Enough Resources"}
      </Button>
    </div>
  );
}

interface NewStructureContentProps {
  initialCosts: {
    metal: number;
    deuterium: number;
    microchips: number;
    science: number;
  };
  constructionTime: number;
  info: StructureInfo;
  onConstruct: (type: StructureType) => void;
  energyConsumption: number;
  futureEnergyRatio: number;
}

function NewStructureContent({
  initialCosts,
  constructionTime,
  info,
  onConstruct,
  energyConsumption,
  futureEnergyRatio,
}: NewStructureContentProps) {
  const { currentResources } = useGame();

  const canAfford =
    currentResources.metal >= initialCosts.metal &&
    currentResources.deuterium >= initialCosts.deuterium &&
    currentResources.microchips >= initialCosts.microchips &&
    currentResources.science >= initialCosts.science;

  return (
    <div className="space-y-4">
      <div className="text-sm text-primary/70">Not Built</div>
      <p className="text-sm text-muted-foreground">{info.description}</p>

      <div className="space-y-2">
        <div className="text-sm font-medium">Construction Costs:</div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {initialCosts.metal > 0 && (
            <div
              className={
                currentResources.metal < initialCosts.metal
                  ? "text-red-500"
                  : "text-green-500"
              }
            >
              Metal: {Math.floor(initialCosts.metal)}
            </div>
          )}
          {initialCosts.deuterium > 0 && (
            <div
              className={
                currentResources.deuterium < initialCosts.deuterium
                  ? "text-red-500"
                  : "text-green-500"
              }
            >
              Deuterium: {Math.floor(initialCosts.deuterium)}
            </div>
          )}
          {initialCosts.microchips > 0 && (
            <div
              className={
                currentResources.microchips < initialCosts.microchips
                  ? "text-red-500"
                  : "text-green-500"
              }
            >
              Microchips: {Math.floor(initialCosts.microchips)}
            </div>
          )}
          {initialCosts.science > 0 && (
            <div
              className={
                currentResources.science < initialCosts.science
                  ? "text-red-500"
                  : "text-green-500"
              }
            >
              Science: {Math.floor(initialCosts.science)}
            </div>
          )}
        </div>
      </div>

      <div className="text-sm">
        Construction Time: {formatConstructionTime(constructionTime)}
      </div>

      <div className="text-sm text-violet-400/70">
        Energy {info.type === "energy_plant" ? "Production" : "Consumption"}:{" "}
        {info.type === "energy_plant" ? -energyConsumption : energyConsumption}
      </div>

      {futureEnergyRatio < 1 && info.type !== "energy_plant" && (
        <div className="text-sm text-amber-400">
          Warning: Building this will result in an energy ratio of{" "}
          {futureEnergyRatio.toFixed(2)}, reducing production efficiency
        </div>
      )}

      <Button
        className={`w-full ${!canAfford ? "opacity-50" : ""}`}
        onClick={() => onConstruct(info.type)}
        disabled={!canAfford}
      >
        {canAfford ? "Construct" : "Not Enough Resources"}
      </Button>
    </div>
  );
}

export function Structures() {
  const { state } = useGame();

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold neon-text mb-2">
            PLANETARY STRUCTURES
          </h1>
          <p className="text-muted-foreground">
            Manage and upgrade your planetary infrastructure
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.values(STRUCTURE_INFO).map((info) => (
            <StructureCard
              key={info.type}
              info={info}
              existingStructure={state.structures?.find(
                (s) => s.type === info.type
              )}
              config={state.structuresConfig![info.type]}
              state={state}
            />
          ))}
        </div>
      </div>
    </ErrorBoundary>
  );
}
