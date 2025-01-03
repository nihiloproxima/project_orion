"use client";
import _ from "lodash";
import { useGame } from "../../../contexts/GameContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import millify from "millify";
import { Structure, StructureType } from "../../../models/structure";
import { Button } from "../../../components/ui/button";
import {
  Building2,
  Beaker,
  Flame,
  Hammer,
  Microchip,
  Grid2x2,
  Grid3x3,
  Grid,
  AlertTriangle,
} from "lucide-react";
import { ErrorBoundary } from "../../../components/ErrorBoundary";
import { useEffect, useState } from "react";
import { Timer } from "../../../components/Timer";
import { api } from "../../../lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { formatTimerTime } from "@/lib/utils";
import { StructureConfig } from "@/models";
import { TECHNOLOGIES } from "@/lib/constants";
import Image from "next/image";
import { getPublicImageUrl } from "@/lib/images";
interface StructureInfo {
  type: StructureType;
  name: string;
  description: string;
  productionType: string;
  icon: React.ReactNode;
  hasStorage: boolean;
}

const STRUCTURE_INFO: Record<StructureType, StructureInfo> = {
  metal_mine: {
    type: "metal_mine",
    name: "Metal Mine",
    description:
      "Mines and processes metal ore from planetary deposits. Each level increases metal production.",
    productionType: "metal",
    icon: <Building2 className="h-5 w-5" />,
    hasStorage: false,
  },
  energy_plant: {
    type: "energy_plant",
    name: "Energy Plant",
    description:
      "Generates power to fuel your planetary operations. Each level increases energy output.",
    productionType: "energy",
    icon: <Building2 className="h-5 w-5" />,
    hasStorage: false,
  },
  deuterium_synthesizer: {
    type: "deuterium_synthesizer",
    name: "Deuterium Synthesizer",
    description:
      "Extracts hydrogen and synthesizes deuterium fuel. Each level increases deuterium production.",
    productionType: "deuterium",
    icon: <Building2 className="h-5 w-5" />,
    hasStorage: false,
  },
  research_lab: {
    type: "research_lab",
    name: "Research Laboratory",
    description:
      "Conducts scientific research to unlock new technologies. Each level increases research speed and efficiency.",
    productionType: "science",
    icon: <Building2 className="h-5 w-5" />,
    hasStorage: false,
  },
  microchip_factory: {
    type: "microchip_factory",
    name: "Microchip Factory",
    description:
      "Manufactures advanced microprocessors and circuitry. Each level increases microchip production.",
    productionType: "microchips",
    icon: <Building2 className="h-5 w-5" />,
    hasStorage: false,
  },
  shipyard: {
    type: "shipyard",
    name: "Shipyard",
    description:
      "Builds and maintains your fleet of spacecraft. Each level unlocks new ship types.",
    productionType: "none",
    icon: <Building2 className="h-5 w-5" />,
    hasStorage: false,
  },
  defense_factory: {
    type: "defense_factory",
    name: "Defense Factory",
    description:
      "Manufactures planetary defense systems and weaponry. Each level reduces defense construction time and unlocks new defense types.",
    productionType: "none",
    icon: <Building2 className="h-5 w-5" />,
    hasStorage: false,
  },
  metal_hangar: {
    type: "metal_hangar",
    name: "Metal Hangar",
    description:
      "Large-scale storage facility for processed metal. Each level increases metal storage capacity.",
    productionType: "metal",
    icon: <Building2 className="h-5 w-5" />,
    hasStorage: true,
  },
  deuterium_tank: {
    type: "deuterium_tank",
    name: "Deuterium Tank",
    description:
      "Pressurized storage facility for deuterium fuel. Each level increases deuterium storage capacity.",
    productionType: "deuterium",
    icon: <Building2 className="h-5 w-5" />,
    hasStorage: true,
  },
  microchip_vault: {
    type: "microchip_vault",
    name: "Microchip Vault",
    description:
      "Secure storage facility for sensitive microelectronics. Each level increases microchip storage capacity.",
    productionType: "microchips",
    icon: <Building2 className="h-5 w-5" />,
    hasStorage: true,
  },
  data_center: {
    type: "data_center",
    name: "Data Center",
    description:
      "Advanced facility for processing and storing scientific data. Each level increases research data storage and processing speed.",
    productionType: "science",
    icon: <Building2 className="h-5 w-5" />,
    hasStorage: true,
  },
};

function StructureCard({
  info,
  existingStructure,
  config,
}: {
  info: StructureInfo;
  existingStructure?: Structure;
  config: StructureConfig;
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

  const calculateHourlyProduction = (structure: Structure, level?: number) => {
    if (
      !state.structuresConfig ||
      (level === undefined && structure.level === 0)
    )
      return 0;

    const energyRatio =
      currentResources.energy_production / currentResources.energy_consumption;
    const productionEfficiency = energyRatio >= 1 ? 1 : energyRatio;

    const productionRate =
      level !== undefined
        ? structure.production_rate *
          (1 +
            ((level - structure.level) *
              _.toInteger(config.production.percent_increase_per_level)) /
              100)
        : structure.production_rate;

    return productionRate * 3600 * productionEfficiency;
  };

  const calculateStorageCapacity = (level: number) => {
    return _.toInteger(config.storage.increase_per_level) * level;
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

  // Skip rendering if structure has no production and no storage
  if (
    !info.hasStorage &&
    (!structure?.production_rate || structure.production_rate === 0) &&
    config.production.percent_increase_per_level === 0
  ) {
    return null;
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm neon-border hover:shadow-[0_0_20px_rgba(32,224,160,0.3)] transition-all duration-300">
      <CardHeader className="flex flex-row items-start gap-6 pb-2">
        <div className="w-2/5 aspect-square">
          <Image
            src={getPublicImageUrl("structures", info.type + ".webp")}
            alt={info.name}
            width={100}
            height={100}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>

        <div className="flex flex-col gap-2 w-3/5">
          <CardTitle className="text-xl font-bold neon-text tracking-wide uppercase hover:scale-105 transition-transform">
            {info.name}
          </CardTitle>

          <p className="text-sm text-muted-foreground">{info.description}</p>

          {structure && (info.productionType !== "none" || info.hasStorage) && (
            <div className="text-sm text-primary/70 font-medium">
              {info.productionType !== "none" && (
                <div className="flex items-center gap-2">
                  <span
                    className={
                      currentResources.energy_production <
                      currentResources.energy_consumption
                        ? "text-red-400"
                        : ""
                    }
                  >
                    Production:{" "}
                    {info.type === "energy_plant"
                      ? structure.production_rate
                      : Math.floor(calculateHourlyProduction(structure)) > 10000
                      ? millify(
                          Math.floor(calculateHourlyProduction(structure))
                        )
                      : Math.floor(calculateHourlyProduction(structure))}
                    {info.type === "energy_plant" ? (
                      info.productionType
                    ) : (
                      <span className="text-muted-foreground">/h</span>
                    )}
                  </span>
                  {structure && !structure.is_under_construction && (
                    <>
                      <span className="text-muted-foreground">→</span>
                      <span
                        className={
                          futureEnergyRatio < 1
                            ? "text-red-400"
                            : "text-emerald-400"
                        }
                      >
                        {info.type === "energy_plant"
                          ? structure.production_rate *
                            (1 +
                              _.toInteger(
                                config.production.percent_increase_per_level
                              ) /
                                100)
                          : Math.floor(
                              calculateHourlyProduction(
                                structure,
                                structure.level + 1
                              )
                            ) > 10000
                          ? millify(
                              Math.floor(
                                calculateHourlyProduction(
                                  structure,
                                  structure.level + 1
                                )
                              )
                            )
                          : Math.floor(
                              calculateHourlyProduction(
                                structure,
                                structure.level + 1
                              )
                            )}
                        {info.type === "energy_plant" ? (
                          info.productionType
                        ) : (
                          <span className="text-muted-foreground">/h</span>
                        )}
                      </span>
                    </>
                  )}
                </div>
              )}
              {info.hasStorage && (
                <div className="flex items-center gap-2">
                  <span>
                    Storage: {millify(calculateStorageCapacity(level))}
                  </span>
                  {!structure.is_under_construction && (
                    <>
                      <span className="text-muted-foreground">→</span>
                      <span className="text-emerald-400">
                        {millify(calculateStorageCapacity(level + 1))}
                      </span>
                    </>
                  )}
                </div>
              )}
              {energyConsumption !== 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-violet-400/70">
                    Energy:{" "}
                    {energyConsumption > 10000
                      ? millify(energyConsumption)
                      : energyConsumption}
                  </span>
                  {structure && !structure.is_under_construction && (
                    <>
                      <span className="text-muted-foreground">→</span>
                      <span className="text-violet-400/70">
                        {futureEnergyConsumption > 10000
                          ? millify(futureEnergyConsumption)
                          : futureEnergyConsumption}
                      </span>
                    </>
                  )}
                </div>
              )}
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
            config={state.structuresConfig!.available_structures[info.type]}
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
  config: StructureConfig;
}

function NewStructureContent({
  constructionCost,
  constructionTime,
  info,
  onConstruct,
  energyConsumption,
  futureEnergyRatio,
  config,
}: NewStructureContentProps) {
  const { currentResources, state } = useGame();

  const canAfford =
    currentResources.metal >= constructionCost.metal &&
    currentResources.deuterium >= constructionCost.deuterium &&
    currentResources.microchips >= constructionCost.microchips &&
    currentResources.science >= constructionCost.science;

  // Check prerequisites
  let prerequisitesMet = true;
  for (const prereq of config.prerequisites.structures) {
    const structure = state.structures?.find((s) => s.type === prereq.type);
    if (!structure || structure.level < prereq.level) {
      prerequisitesMet = false;
      break;
    }
  }

  for (const prereq of config.prerequisites.technologies) {
    const tech = state.planetResearchs?.technologies[prereq.id];
    if (!tech || tech.level < prereq.level) {
      prerequisitesMet = false;
      break;
    }
  }

  // Add prerequisites warning message
  const getPrerequisitesMessage = () => {
    const missingStructures = config.prerequisites.structures
      .filter((prereq) => {
        const structure = state.structures?.find((s) => s.type === prereq.type);
        return !structure || structure.level < prereq.level;
      })
      .map(
        (prereq) =>
          `${STRUCTURE_INFO[prereq.type as StructureType].name} Level ${
            prereq.level
          }`
      );

    const missingTechnologies = config.prerequisites.technologies
      .filter((prereq) => {
        const tech = state.planetResearchs?.technologies[prereq.id];
        return !tech || tech.level < prereq.level;
      })
      .map((prereq) => `${TECHNOLOGIES[prereq.id].name} Level ${prereq.level}`);

    const missing = [...missingStructures, ...missingTechnologies];

    return missing.length > 0 ? `Required: ${missing.join(", ")}` : "";
  };

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

      {/* Add prerequisites warning */}
      {!prerequisitesMet && (
        <div className="text-sm text-red-400 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          <span>Requires: {getPrerequisitesMessage()}</span>
        </div>
      )}

      {futureEnergyRatio < 1 && info.type !== "energy_plant" && (
        <div className="text-sm text-amber-400">
          Warning: Building this will result in an energy ratio of{" "}
          {futureEnergyRatio.toFixed(2)}, reducing production efficiency
        </div>
      )}

      <Button
        onClick={() => onConstruct(info.type)}
        disabled={!canAfford || !prerequisitesMet}
        className={`w-full px-4 py-2 rounded-lg font-medium transition-colors border ${
          !canAfford || !prerequisitesMet
            ? "bg-gray-800/50 text-gray-500 border-gray-700 cursor-not-allowed"
            : "bg-primary/20 hover:bg-primary/30 text-primary border-primary/50 hover:border-primary/80 neon-border"
        }`}
      >
        {!prerequisitesMet
          ? "Prerequisites Not Met"
          : !canAfford
          ? "Not Enough Resources"
          : "Construct"}
      </Button>
    </div>
  );
}

export default function Structures() {
  const { state } = useGame();
  const [gridCols, setGridCols] = useState(() => {
    const saved = localStorage.getItem("structuresGridCols");
    return saved ? parseInt(saved) : 2;
  });

  const gridColsClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  }[gridCols];

  const updateGridCols = (cols: number) => {
    setGridCols(cols);
    localStorage.setItem("structuresGridCols", cols.toString());
  };

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold neon-text mb-2">
              PLANETARY STRUCTURES
            </h1>
            <p className="text-muted-foreground">
              Manage and upgrade your planetary infrastructure
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Grid className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => updateGridCols(1)}>
                <Grid className="mr-2 h-4 w-4" /> Single Column
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => updateGridCols(2)}>
                <Grid2x2 className="mr-2 h-4 w-4" /> Two Columns
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => updateGridCols(3)}>
                <Grid3x3 className="mr-2 h-4 w-4" /> Three Columns
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => updateGridCols(4)}>
                <Grid className="mr-2 h-4 w-4" /> Four Columns
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className={`grid ${gridColsClass} gap-6`}>
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
