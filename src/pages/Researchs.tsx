import { useGame } from "../contexts/GameContext";
import { supabase } from "../lib/supabase";
import { ResearchCategory, TechnologyId } from "../models";
import {
  Beaker,
  FolderTree,
  Lock,
  Ship,
  Shield,
  Flame,
  Hammer,
  Microchip,
  Zap,
} from "lucide-react";
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

import espionageTechImg from "../assets/researchs/espionage_tech.png";
import ansibleNetworkImg from "../assets/researchs/ansible_network.png";
import enhancedMiningImg from "../assets/researchs/enhanced_mining.png";

export const RESEARCH_ASSETS: Record<
  TechnologyId,
  {
    name: string;
    image: string;
    description: string;
    category: ResearchCategory;
    unlocks?: {
      ships?: string[];
      defense?: string[];
    };
  }
> = {
  quantum_computing: {
    name: "Quantum Computing",
    image: "/src/assets/technologies/default.png",
    description:
      "Enables advanced quantum computing capabilities. Each level increases the processing power of quantum computers by 10%.",
    category: "infrastructure",
    unlocks: {
      ships: ["Quantum Scout", "Data Miner"],
    },
  },
  enhanced_mining: {
    name: "Enhanced Mining",
    image: enhancedMiningImg,
    description:
      "Improves resource extraction efficiency. Each level increases resource production by 5%.",
    category: "resource",
  },
  ansible_network: {
    name: "Ansible Network",
    image: ansibleNetworkImg,
    description:
      "Enables research sharing between planets through quantum entanglement.",
    category: "infrastructure",
  },
  espionage_tech: {
    name: "Espionage Technology",
    image: espionageTechImg,
    description:
      "Increases your ability to gather intelligence on other players and their planets. Each level improves the accuracy and detail of espionage reports.",
    category: "misc",
    unlocks: {
      ships: ["Spy Probe", "Stealth Ship"],
    },
  },
} as const;

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
}

function ResearchCard({
  id,
  research,
  tech,
  onStartResearch,
}: ResearchCardProps) {
  const costMultiplier = Math.pow(
    1 + research.cost.percent_increase_per_level / 100,
    tech.level
  );

  const timeMultiplier = Math.pow(
    1 + research.time.percent_increase_per_level / 100,
    tech.level
  );
  const researchTime = research.time.base_seconds * timeMultiplier;

  const assetConfig = RESEARCH_ASSETS[id as keyof typeof RESEARCH_ASSETS];
  const { state, currentResources } = useGame();

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

  const getButtonText = () => {
    if (tech.level >= research.max_level) return "MAX LEVEL";
    if (tech.is_researching) return "RESEARCHING...";
    if (!prerequisitesMet) return "PREREQUISITES NOT MET";
    if (!hasEnoughResources) return "NOT ENOUGH RESOURCES";
    return "RESEARCH";
  };

  return (
    <Card
      className={`bg-card/50 backdrop-blur-sm transition-all duration-300 ${
        prerequisitesMet && hasEnoughResources
          ? "neon-border hover:shadow-[0_0_20px_rgba(32,224,160,0.3)]"
          : "border-red-500/50"
      }`}
    >
      <CardHeader className="flex flex-row items-start gap-6 pb-2">
        <div className="w-2/5 aspect-square">
          <img
            src={assetConfig?.image}
            alt={assetConfig?.name}
            className={`w-full h-full object-cover rounded-lg ${
              (!prerequisitesMet || !hasEnoughResources) && "opacity-50"
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
                <TooltipTrigger className="text-primary/70 font-medium">
                  Level {tech.level}/{research.max_level}
                </TooltipTrigger>
                <TooltipContent>
                  <p>Maximum level: {research.max_level}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <span className="text-primary/30">•</span>
            <div className="text-secondary/70 uppercase">
              {assetConfig?.category}
            </div>
          </div>

          <p className="text-sm text-muted-foreground text-left">
            {assetConfig?.description}
          </p>

          {!prerequisitesMet && (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <Lock className="h-4 w-4" />
              <div>
                Requires:{" "}
                {research.prerequisites
                  .map(
                    (prereq: any) =>
                      `${RESEARCH_ASSETS[prereq.technology_id].name} ${
                        prereq.required_level
                      }`
                  )
                  .join(", ")}
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4 border-t border-primary/20">
        {tech.is_researching && (
          <div className="p-3 bg-primary/10 rounded-lg border border-primary/30">
            <div className="flex items-center">
              <div className="animate-pulse mr-2 w-2 h-2 bg-primary rounded-full"></div>
              <p className="text-primary font-medium">Research in Progress</p>
            </div>
            <p className="text-muted-foreground text-sm mt-1">
              Completes: {new Date(tech.research_finish_time!).toLocaleString()}
            </p>
          </div>
        )}

        <div className="p-3 bg-black/30 rounded-lg border border-primary/20">
          <h4 className="font-medium text-primary/70 mb-2">Research Time</h4>
          <div className="text-muted-foreground text-sm">
            {formatResearchTime(researchTime)}
          </div>
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-full p-3 bg-black/30 rounded-lg border border-primary/20">
                <h4 className="font-medium text-primary/70 mb-2">
                  Resource Cost
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {research.cost.base_metal > 0 && (
                    <div className="flex items-center gap-2">
                      <Hammer className="h-4 w-4 text-secondary" />
                      <span
                        className={`text-sm truncate ${
                          currentResources.metal < costs.metal
                            ? "text-red-400"
                            : "text-muted-foreground"
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
                            : "text-muted-foreground"
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
                            : "text-muted-foreground"
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
                            : "text-muted-foreground"
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
            !hasEnoughResources
          }
          className={`w-full px-4 py-2 rounded-lg font-medium transition-colors border ${
            tech.is_researching ||
            tech.level >= research.max_level ||
            !prerequisitesMet ||
            !hasEnoughResources
              ? "bg-gray-800/50 text-gray-500 border-gray-700 cursor-not-allowed"
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
  const { state, currentResources } = useGame();

  if (!state.researchsConfig || !state.planetResearchs) {
    return <div>Loading...</div>;
  }

  const startResearch = async (researchId: TechnologyId) => {
    if (!state.selectedPlanet?.id) return;

    const research = state.researchsConfig!.available_researchs[researchId];
    if (!research) return;

    const currentTech = state.planetResearchs?.technologies[researchId] || {
      level: 0,
      is_researching: false,
      research_start_time: null,
      research_finish_time: null,
    };

    if (currentTech.is_researching) {
      alert("Already researching something!");
      return;
    }

    if (currentTech.level >= research.max_level) {
      alert("Research already at max level!");
      return;
    }

    const costMultiplier = Math.pow(
      1 + research.cost.percent_increase_per_level / 100,
      currentTech.level
    );
    const costs = {
      metal: research.cost.base_metal * costMultiplier,
      deuterium: research.cost.base_deuterium * costMultiplier,
      science: research.cost.base_science * costMultiplier,
      microchips: research.cost.base_microchips * costMultiplier,
    };

    if (
      currentResources.metal < costs.metal ||
      currentResources.deuterium < costs.deuterium ||
      currentResources.science < costs.science ||
      currentResources.microchips < costs.microchips
    ) {
      alert("Not enough resources!");
      return;
    }

    const timeMultiplier = Math.pow(
      1 + research.time.percent_increase_per_level / 100,
      currentTech.level
    );
    const researchTime = research.time.base_seconds * timeMultiplier;

    const { error } = await supabase.rpc("start_research", {
      p_research_id: researchId,
      p_planet_id: state.selectedPlanet.id,
      p_research_time: researchTime,
      p_metal_cost: costs.metal,
      p_deuterium_cost: costs.deuterium,
      p_science_cost: costs.science,
      p_microchips_cost: costs.microchips,
    });

    if (error) {
      console.error("Error starting research:", error);
      alert("Failed to start research");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold neon-text mb-2 flex items-center gap-2">
          <Beaker className="h-8 w-8" />
          RESEARCH LABORATORY
        </h1>
        <div className="flex items-center gap-2 text-muted-foreground">
          <FolderTree className="h-5 w-5" />
          <p>Browse and unlock advanced technologies</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              />
            );
          }
        )}
      </div>
    </div>
  );
}
