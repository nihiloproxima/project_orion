import { useGame } from "../contexts/GameContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Structure, StructureType } from "../models/structure";
import { Button } from "../components/ui/button";
import { Building2, Beaker, Flame, Hammer, Microchip } from "lucide-react";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { useEffect, useState } from "react";
import { Timer } from "../components/Timer";
import { api } from "../lib/api";

// Import structure images
import metalMineImg from "../assets/structures/metal_mine.png";
import energyPlantImg from "../assets/structures/energy_plant.png";
import deuteriumSynthesizerImg from "../assets/structures/deuterium_synthesizer.png";
import researchLabImg from "../assets/structures/research_lab.png";
import shipYardImg from "../assets/structures/shipyard.png";
import defenseFactoryImg from "../assets/structures/defense_factory.png";
import microchipFactoryImg from "../assets/structures/microchip_factory.png";
import metalHangarImg from "../assets/structures/metal_hangar.png";
import deuteriumTankImg from "../assets/structures/deuterium_tank.png";
import microchipVaultImg from "../assets/structures/microchip_vault.png";
import dataCenterImg from "../assets/structures/data_center.png";
import { formatTimerTime } from "../lib/utils";

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
    description:
      "Mines and processes metal ore from planetary deposits. Each level increases metal production.",
    productionType: "metal",
    icon: <Building2 className="h-5 w-5" />,
    image: metalMineImg,
  },
  energy_plant: {
    type: "energy_plant",
    name: "Energy Plant",
    description:
      "Generates power to fuel your planetary operations. Each level increases energy output.",
    productionType: "energy",
    icon: <Building2 className="h-5 w-5" />,
    image: energyPlantImg,
  },
  deuterium_synthesizer: {
    type: "deuterium_synthesizer",
    name: "Deuterium Synthesizer",
    description:
      "Extracts hydrogen and synthesizes deuterium fuel. Each level increases deuterium production.",
    productionType: "deuterium",
    icon: <Building2 className="h-5 w-5" />,
    image: deuteriumSynthesizerImg,
  },
  research_lab: {
    type: "research_lab",
    name: "Research Laboratory",
    description:
      "Conducts scientific research to unlock new technologies. Each level increases research speed and efficiency.",
    productionType: "science",
    icon: <Building2 className="h-5 w-5" />,
    image: researchLabImg,
  },
  microchip_factory: {
    type: "microchip_factory",
    name: "Microchip Factory",
    description:
      "Manufactures advanced microprocessors and circuitry. Each level increases microchip production.",
    productionType: "microchips",
    icon: <Building2 className="h-5 w-5" />,
    image: microchipFactoryImg,
  },
  shipyard: {
    type: "shipyard",
    name: "Shipyard",
    description:
      "Builds and maintains your fleet of spacecraft. Each level reduces ship construction time and unlocks new ship types.",
    productionType: "none",
    icon: <Building2 className="h-5 w-5" />,
    image: shipYardImg,
  },
  defense_factory: {
    type: "defense_factory",
    name: "Defense Factory",
    description:
      "Manufactures planetary defense systems and weaponry. Each level reduces defense construction time and unlocks new defense types.",
    productionType: "none",
    icon: <Building2 className="h-5 w-5" />,
    image: defenseFactoryImg,
  },
  metal_hangar: {
    type: "metal_hangar",
    name: "Metal Hangar",
    description:
      "Large-scale storage facility for processed metal. Each level increases metal storage capacity.",
    productionType: "metal",
    icon: <Building2 className="h-5 w-5" />,
    image: metalHangarImg,
  },
  deuterium_tank: {
    type: "deuterium_tank",
    name: "Deuterium Tank",
    description:
      "Pressurized storage facility for deuterium fuel. Each level increases deuterium storage capacity.",
    productionType: "deuterium",
    icon: <Building2 className="h-5 w-5" />,
    image: deuteriumTankImg,
  },
  microchip_vault: {
    type: "microchip_vault",
    name: "Microchip Vault",
    description:
      "Secure storage facility for sensitive microelectronics. Each level increases microchip storage capacity.",
    productionType: "microchips",
    icon: <Building2 className="h-5 w-5" />,
    image: microchipVaultImg,
  },
  data_center: {
    type: "data_center",
    name: "Data Center",
    description:
      "Advanced facility for processing and storing scientific data. Each level increases research data storage and processing speed.",
    productionType: "none",
    icon: <Building2 className="h-5 w-5" />,
    image: dataCenterImg,
  },
};

function StructureCard({
  info,
  existingStructure,
  config,
}: {
  info: StructureInfo;
  existingStructure?: Structure;
  config: any;
}) {
  const { state } = useGame();
  const [structure, setStructure] = useState(existingStructure);
  const { currentResources } = useGame();

  useEffect(() => {
    setStructure(existingStructure);
  }, [existingStructure, state]); // Added state dependency

  const onUpgrade = async (structure: Structure) => {
    await api.structures.upgrade(state.selectedPlanet!.id, structure.id);
  };

  const onConstruct = async (type: StructureType) => {
    await api.structures.construct(state.selectedPlanet!.id, type);
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
        <div className="w-2/5 aspect-square">
          <img
            src={info.image}
            alt={info.name}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>

        <div className="flex flex-col gap-2 w-3/5">
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
        <Timer
          startTime={structure.construction_start_time}
          finishTime={structure.construction_finish_time}
          variant="primary"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-primary/70">Level {structure.level}</div>

      <div className="space-y-2">
        <div className="text-sm font-medium">Upgrade Costs:</div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {upgradeCosts.metal > 0 && (
            <div
              className={`flex items-center gap-2 ${
                currentResources.metal < upgradeCosts.metal
                  ? "text-red-500"
                  : "text-secondary"
              }`}
            >
              <Hammer className="h-4 w-4" />
              <span>{Math.floor(upgradeCosts.metal)}</span>
            </div>
          )}
          {upgradeCosts.deuterium > 0 && (
            <div
              className={`flex items-center gap-2 ${
                currentResources.deuterium < upgradeCosts.deuterium
                  ? "text-red-500"
                  : "text-primary"
              }`}
            >
              <Flame className="h-4 w-4" />
              <span>{Math.floor(upgradeCosts.deuterium)}</span>
            </div>
          )}
          {upgradeCosts.microchips > 0 && (
            <div
              className={`flex items-center gap-2 ${
                currentResources.microchips < upgradeCosts.microchips
                  ? "text-red-500"
                  : "text-accent"
              }`}
            >
              <Microchip className="h-4 w-4" />
              <span>{Math.floor(upgradeCosts.microchips)}</span>
            </div>
          )}
          {upgradeCosts.science > 0 && (
            <div
              className={`flex items-center gap-2 ${
                currentResources.science < upgradeCosts.science
                  ? "text-red-500"
                  : "text-blue-400"
              }`}
            >
              <Beaker className="h-4 w-4" />
              <span>{Math.floor(upgradeCosts.science)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="text-sm">
        Construction Time: {formatTimerTime(constructionTime)}
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

      <div className="space-y-2">
        <div className="text-sm font-medium">Construction Costs:</div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {constructionCost.metal > 0 && (
            <div
              className={`flex items-center gap-2 ${
                currentResources.metal < constructionCost.metal
                  ? "text-red-500"
                  : "text-secondary"
              }`}
            >
              <Hammer className="h-4 w-4" />
              <span>{Math.floor(constructionCost.metal)}</span>
            </div>
          )}
          {constructionCost.deuterium > 0 && (
            <div
              className={`flex items-center gap-2 ${
                currentResources.deuterium < constructionCost.deuterium
                  ? "text-red-500"
                  : "text-primary"
              }`}
            >
              <Flame className="h-4 w-4" />
              <span>{Math.floor(constructionCost.deuterium)}</span>
            </div>
          )}
          {constructionCost.microchips > 0 && (
            <div
              className={`flex items-center gap-2 ${
                currentResources.microchips < constructionCost.microchips
                  ? "text-red-500"
                  : "text-accent"
              }`}
            >
              <Microchip className="h-4 w-4" />
              <span>{Math.floor(constructionCost.microchips)}</span>
            </div>
          )}
          {constructionCost.science > 0 && (
            <div
              className={`flex items-center gap-2 ${
                currentResources.science < constructionCost.science
                  ? "text-red-500"
                  : "text-blue-400"
              }`}
            >
              <Beaker className="h-4 w-4" />
              <span>{Math.floor(constructionCost.science)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="text-sm">
        Construction Time: {formatTimerTime(constructionTime)}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.values(STRUCTURE_INFO).map((info) => (
            <StructureCard
              key={info.type}
              info={info}
              existingStructure={state.structures?.find(
                (s) => s.type === info.type
              )}
              config={state.structuresConfig!.available_structures[info.type]}
            />
          ))}
        </div>
      </div>
    </ErrorBoundary>
  );
}
