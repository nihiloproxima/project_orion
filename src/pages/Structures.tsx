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
    const minutes = Math.ceil(seconds / 60);
    const actualMinutes = seconds / 60;
    return `${actualMinutes < minutes ? "< " : ""}${minutes} minutes`;
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
  config: any;
  state: any;
}) {
  const [structure, setStructure] = useState(existingStructure);
  const { currentResources } = useGame();

  useEffect(() => {
    setStructure(existingStructure);
  }, [existingStructure, state]); // Added state dependency

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
  const costIncreaseCoef =
    1 + (config.cost.percent_increase_per_level * level) / 100;
  const constructionCost = {
    metal: config.cost.resources.metal * costIncreaseCoef,
    deuterium: config.cost.resources.deuterium * costIncreaseCoef,
    microchips: config.cost.resources.microchips * costIncreaseCoef,
    science: config.cost.resources.science * costIncreaseCoef,
  };

  const constructionTimeCoef =
    1 + (config.time.percent_increase_per_level * level) / 100;
  const constructionTime = Math.min(
    config.time.base_seconds * constructionTimeCoef,
    config.time.max_seconds
  );

  const energyConsumptionCoef =
    1 + (config.energy_consumption.percent_increase_per_level * level) / 100;
  const futureEnergyConsumptionCoef =
    1 +
    (config.energy_consumption.percent_increase_per_level * (level + 1)) / 100;

  const energyConsumption =
    config.energy_consumption.base * energyConsumptionCoef;
  const futureEnergyConsumption =
    config.energy_consumption.base * futureEnergyConsumptionCoef;

  const futureEnergyRatio =
    currentResources.energy_production /
    (currentResources.energy_consumption +
      futureEnergyConsumption -
      energyConsumption);

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
            upgradeCosts={constructionCost}
            constructionTime={constructionTime}
            onUpgrade={onUpgrade}
            futureEnergyRatio={futureEnergyRatio}
          />
        ) : (
          <NewStructureContent
            constructionCost={constructionCost}
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
        onClick={() => onUpgrade(structure)}
        disabled={structure.is_under_construction || !canAfford}
        className={`w-full px-4 py-2 rounded-lg font-medium transition-colors border ${
          structure.is_under_construction || !canAfford
            ? "bg-gray-800/50 text-gray-500 border-gray-700 cursor-not-allowed"
            : "bg-primary/20 hover:bg-primary/30 text-primary border-primary/50 hover:border-primary/80 neon-border"
        }`}
      >
        {structure.is_under_construction
          ? "Under Construction"
          : canAfford
          ? `Upgrade to Level ${structure.level + 1}`
          : "Not Enough Resources"}
      </Button>
    </div>
  );
}

interface NewStructureContentProps {
  constructionCost: {
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
  constructionCost,
  constructionTime,
  info,
  onConstruct,
  energyConsumption,
  futureEnergyRatio,
}: NewStructureContentProps) {
  const { currentResources } = useGame();

  const canAfford =
    currentResources.metal >= constructionCost.metal &&
    currentResources.deuterium >= constructionCost.deuterium &&
    currentResources.microchips >= constructionCost.microchips &&
    currentResources.science >= constructionCost.science;

  return (
    <div className="space-y-4">
      <div className="text-sm text-primary/70">Not Built</div>
      <p className="text-sm text-muted-foreground">{info.description}</p>

      <div className="space-y-2">
        <div className="text-sm font-medium">Construction Costs:</div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {constructionCost.metal > 0 && (
            <div
              className={
                currentResources.metal < constructionCost.metal
                  ? "text-red-500"
                  : "text-green-500"
              }
            >
              Metal: {Math.floor(constructionCost.metal)}
            </div>
          )}
          {constructionCost.deuterium > 0 && (
            <div
              className={
                currentResources.deuterium < constructionCost.deuterium
                  ? "text-red-500"
                  : "text-green-500"
              }
            >
              Deuterium: {Math.floor(constructionCost.deuterium)}
            </div>
          )}
          {constructionCost.microchips > 0 && (
            <div
              className={
                currentResources.microchips < constructionCost.microchips
                  ? "text-red-500"
                  : "text-green-500"
              }
            >
              Microchips: {Math.floor(constructionCost.microchips)}
            </div>
          )}
          {constructionCost.science > 0 && (
            <div
              className={
                currentResources.science < constructionCost.science
                  ? "text-red-500"
                  : "text-green-500"
              }
            >
              Science: {Math.floor(constructionCost.science)}
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
        onClick={() => onConstruct(info.type)}
        disabled={!canAfford}
        className={`w-full px-4 py-2 rounded-lg font-medium transition-colors border ${
          !canAfford
            ? "bg-gray-800/50 text-gray-500 border-gray-700 cursor-not-allowed"
            : "bg-primary/20 hover:bg-primary/30 text-primary border-primary/50 hover:border-primary/80 neon-border"
        }`}
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
