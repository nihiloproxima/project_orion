import { useGame } from "../contexts/GameContext";
import { TechnologyId } from "../models";
import {
  Beaker,
  FolderTree,
  Lock,
  Ship,
  Shield,
  Flame,
  Hammer,
  Microchip,
  Clock,
  AlertTriangle,
  Grid,
  Grid2x2,
  Grid3x3,
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { api } from "../lib/api";
import { Timer } from "../components/Timer";
import { getTechnologyBonus } from "../lib/utils";
import { TECHNOLOGIES } from "../lib/constants";
import { useState } from "react";
import { ErrorBoundary } from "../components/ErrorBoundary";

interface ResearchCardProps {
  id: TechnologyId;
  research: any;
  tech: {
    level: number;
    is_researching: boolean;
    research_start_time: number | null;
    research_finish_time: number | null;
  };
  onStartResearch: (id: TechnologyId) => void;
  isAnyResearchInProgress: boolean;
}

function ResearchCard({
  id,
  research,
  tech,
  onStartResearch,
  isAnyResearchInProgress,
}: ResearchCardProps) {
  const { state, currentResources } = useGame();
  const costMultiplier = Math.pow(
    1 + research.cost.percent_increase_per_level / 100,
    tech.level
  );

  const timeMultiplier =
    1 + (research.time.percent_increase_per_level * tech.level) / 100;
  const researchSpeedBonus = getTechnologyBonus(
    state.researchsConfig!,
    state.planetResearchs!,
    "research_speed"
  );
  const researchTime =
    research.time.base_seconds * timeMultiplier * researchSpeedBonus;

  const assetConfig = TECHNOLOGIES[id as keyof typeof TECHNOLOGIES];

  const costs = {
    metal: research.cost.base_metal * costMultiplier,
    deuterium: research.cost.base_deuterium * costMultiplier,
    science: research.cost.base_science * costMultiplier,
    microchips: research.cost.base_microchips * costMultiplier,
  };

  const hasEnoughResources =
    currentResources.metal >= costs.metal &&
    currentResources.deuterium >= costs.deuterium &&
    currentResources.science >= costs.science &&
    currentResources.microchips >= costs.microchips;

  const prerequisitesMet =
    !research.prerequisites ||
    research.prerequisites.every(
      (prereq: any) =>
        (state.planetResearchs?.technologies[prereq.technology_id]?.level ||
          0) >= prereq.required_level
    );

  // Helper function to format time (similar to the one in Structures.tsx)
  const formatResearchTime = (seconds: number) => {
    const days = Math.floor(seconds / (60 * 60 * 24));
    const hours = Math.floor((seconds % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return [
      days > 0 && `${days}d`,
      hours > 0 && `${hours}h`,
      minutes > 0 && `${minutes}m`,
      remainingSeconds > 0 && `${remainingSeconds}s`,
    ]
      .filter(Boolean)
      .join(" ");
  };

  const getButtonText = () => {
    if (tech.level >= research.max_level) return "MAX LEVEL";
    if (tech.is_researching) {
      return "RESEARCHING";
    }
    if (isAnyResearchInProgress && !tech.is_researching) {
      return "RESEARCH IN PROGRESS";
    }
    if (!prerequisitesMet) return "PREREQUISITES NOT MET";
    if (!hasEnoughResources) return "NOT ENOUGH RESOURCES";
    return "RESEARCH";
  };

  const getEffectDescription = () => {
    let description = assetConfig?.description;
    if (research.effects) {
      research.effects.forEach((effect: any) => {
        if (effect.per_level) {
          if (effect.type === "resource_boost") {
            description += ` Each level increases ${effect.resource_type} production by ${effect.value}%.`;
          } else if (effect.type === "construction_speed") {
            description += ` Each level increases construction speed by ${effect.value}%.`;
          } else if (effect.type === "research_speed") {
            description += ` Each level increases research speed by ${effect.value}%.`;
          }
        }
      });
    }
    return description;
  };

  return (
    <Card
      className={`bg-card/50 backdrop-blur-sm transition-all duration-300 ${
        prerequisitesMet && hasEnoughResources && !isAnyResearchInProgress
          ? "neon-border hover:shadow-[0_0_20px_rgba(32,224,160,0.3)]"
          : isAnyResearchInProgress && !tech.is_researching
          ? "border-amber-500/50 opacity-50"
          : "border-red-500/50"
      }`}
    >
      <CardHeader className="flex flex-row items-start gap-6 pb-2">
        <div className="w-2/5 aspect-square">
          <img
            src={assetConfig?.image}
            alt={assetConfig?.name}
            className={`w-full h-full object-cover rounded-lg ${
              (!prerequisitesMet ||
                !hasEnoughResources ||
                (isAnyResearchInProgress && !tech.is_researching)) &&
              "opacity-50"
            }`}
            onError={(e) => {
              e.currentTarget.src = "/src/assets/technologies/default.png";
            }}
          />
        </div>
        <div className="flex flex-col gap-2 w-3/5">
          <div className="flex flex-col gap-2">
            <CardTitle className="text-xl font-bold neon-text tracking-wide uppercase hover:scale-105 transition-transform">
              {assetConfig?.name}
            </CardTitle>
            <div className="flex flex-col gap-1 text-sm">
              {assetConfig.unlocks?.ships && (
                <div className="flex items-center gap-2">
                  <Ship className="h-4 w-4 text-blue-400" />
                  <span>
                    Unlocks ships: {assetConfig.unlocks.ships.join(", ")}
                  </span>
                </div>
              )}
              {assetConfig.unlocks?.defense && (
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-400" />
                  <span>
                    Unlocks defense: {assetConfig.unlocks.defense.join(", ")}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 text-sm">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="text-primary font-medium">
                  Level {tech.level}/{research.max_level}
                </TooltipTrigger>
                <TooltipContent>
                  <p>Maximum level: {research.max_level}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <span className="text-primary/50">•</span>
            <div className="text-secondary uppercase">
              {assetConfig?.category}
            </div>
          </div>

          <p className="text-sm text-gray-200 text-left">
            {getEffectDescription()}
          </p>

          {!prerequisitesMet && (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <Lock className="h-4 w-4" />
              <div>
                Requires:{" "}
                {research.prerequisites
                  .map(
                    (prereq: any) =>
                      `${
                        TECHNOLOGIES[prereq.technology_id as TechnologyId].name
                      } ${prereq.required_level}`
                  )
                  .join(", ")}
              </div>
            </div>
          )}

          {isAnyResearchInProgress && !tech.is_researching && (
            <div className="flex items-center gap-2 text-amber-400 text-sm">
              <Clock className="h-4 w-4" />
              <div>Another technology is currently being researched</div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4 border-t border-primary/20">
        {tech.is_researching ? (
          <Timer
            startTime={tech.research_start_time!}
            finishTime={tech.research_finish_time!}
            variant="primary"
          />
        ) : (
          <div className="p-3 bg-black/30 rounded-lg border border-primary/20">
            <h4 className="font-medium text-primary mb-2">Research Time</h4>
            <div className="text-gray-200 text-sm">
              {formatResearchTime(researchTime)}
            </div>
          </div>
        )}

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-full p-3 bg-black/30 rounded-lg border border-primary/20">
                <h4 className="font-medium text-primary mb-2">Resource Cost</h4>
                <div className="grid grid-cols-2 gap-4">
                  {research.cost.base_metal > 0 && (
                    <div className="flex items-center gap-2">
                      <Hammer className="h-4 w-4 text-secondary" />
                      <span
                        className={`text-sm truncate ${
                          currentResources.metal < costs.metal
                            ? "text-red-400"
                            : "text-gray-200"
                        }`}
                      >
                        {Math.floor(costs.metal).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {research.cost.base_deuterium > 0 && (
                    <div className="flex items-center gap-2">
                      <Flame className="h-4 w-4 text-primary" />
                      <span
                        className={`text-sm truncate ${
                          currentResources.deuterium < costs.deuterium
                            ? "text-red-400"
                            : "text-gray-200"
                        }`}
                      >
                        {Math.floor(costs.deuterium).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {research.cost.base_science > 0 && (
                    <div className="flex items-center gap-2">
                      <Beaker className="h-4 w-4 text-blue-400" />
                      <span
                        className={`text-sm truncate ${
                          currentResources.science < costs.science
                            ? "text-red-400"
                            : "text-gray-200"
                        }`}
                      >
                        {Math.floor(costs.science).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {research.cost.base_microchips > 0 && (
                    <div className="flex items-center gap-2">
                      <Microchip className="h-4 w-4 text-accent" />
                      <span
                        className={`text-sm truncate ${
                          currentResources.microchips < costs.microchips
                            ? "text-red-400"
                            : "text-gray-200"
                        }`}
                      >
                        {Math.floor(costs.microchips).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </TooltipTrigger>
          </Tooltip>
        </TooltipProvider>

        <button
          onClick={() => onStartResearch(id)}
          disabled={
            tech.is_researching ||
            tech.level >= research.max_level ||
            !prerequisitesMet ||
            !hasEnoughResources ||
            (isAnyResearchInProgress && !tech.is_researching)
          }
          className={`w-full px-4 py-2 rounded-lg font-medium transition-colors border ${
            tech.is_researching ||
            tech.level >= research.max_level ||
            !prerequisitesMet ||
            !hasEnoughResources ||
            (isAnyResearchInProgress && !tech.is_researching)
              ? "bg-gray-800/50 text-gray-400 border-gray-600 cursor-not-allowed"
              : "bg-primary/20 hover:bg-primary/30 text-primary border-primary/50 hover:border-primary/80 neon-border"
          }`}
        >
          {getButtonText()}
        </button>
      </CardContent>
    </Card>
  );
}

export function Researchs() {
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

  if (!state.researchsConfig || !state.planetResearchs) {
    return <div>Loading...</div>;
  }

  // Check if laboratory exists
  const hasLaboratory = state.structures?.some(
    (structure) => structure.type === "research_lab"
  );

  if (!hasLaboratory) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] space-y-6 text-center">
        <AlertTriangle className="w-16 h-16 text-red-500 animate-pulse" />
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-red-500">ACCESS DENIED</h2>
          <div className="font-mono text-sm text-gray-200 max-w-md">
            <p className="mb-2">[ERROR CODE: NO_LABORATORY_DETECTED]</p>
            <p>Laboratory structure required for research operations.</p>
            <p>
              Please construct a laboratory to access research capabilities.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const startResearch = async (technologyId: TechnologyId) => {
    if (!state.selectedPlanet?.id) return;

    try {
      await api.researchs.startResearch(technologyId, state.selectedPlanet.id);
    } catch (error) {
      console.error("Error starting research:", error);
    }
  };

  const isAnyResearchInProgress = Object.values(
    state.planetResearchs.technologies
  ).some((tech) => tech.is_researching);

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold neon-text mb-2 flex items-center gap-2">
              <Beaker className="h-8 w-8" />
              RESEARCH LABORATORY
            </h1>
            <div className="flex items-center gap-2 text-gray-200">
              <FolderTree className="h-5 w-5" />
              <p>Browse and unlock advanced technologies</p>
            </div>
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
          {Object.entries(state.researchsConfig.available_researchs).map(
            ([id, research]) => {
              const tech = state.planetResearchs?.technologies[id] || {
                level: 0,
                is_researching: false,
                research_start_time: null,
                research_finish_time: null,
              };

              return (
                <ResearchCard
                  key={id}
                  id={id as TechnologyId}
                  research={research}
                  tech={tech}
                  onStartResearch={startResearch}
                  isAnyResearchInProgress={isAnyResearchInProgress}
                />
              );
            }
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}
