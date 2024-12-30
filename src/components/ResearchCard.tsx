import { formatTimerTime } from "../lib/utils";
import { ResearchConfig } from "../models";
import { TechnologyId } from "../models";
import { Technology } from "../models";
import { ResearchPrerequisites } from "../models/research_config";
import { RESEARCH_ASSETS } from "../pages/Researchs";
import { Timer } from "./Timer";
import { Progress } from "./ui/progress";
import { Beaker, Lock, AlertCircle } from "lucide-react";

interface ResearchCardProps {
  id: TechnologyId;
  research: ResearchConfig;
  tech: Technology;
  prerequisites: ResearchPrerequisites[];
  onStartResearch: (id: TechnologyId) => void;
  currentResources: any;
}

export function ResearchCard({
  id,
  research,
  tech,
  prerequisites,
  onStartResearch,
  currentResources,
}: ResearchCardProps) {
  const costMultiplier = Math.pow(
    1 + research.cost.percent_increase_per_level / 100,
    tech.level
  );

  const timeMultiplier = Math.pow(
    1 + research.time.percent_increase_per_level / 100,
    tech.level
  );

  const costs = {
    metal: research.cost.base_metal * costMultiplier,
    deuterium: research.cost.base_deuterium * costMultiplier,
    science: research.cost.base_science * costMultiplier,
    microchips: research.cost.base_microchips * costMultiplier,
  };

  const researchTime = research.time.base_seconds * timeMultiplier;
  const assetConfig = RESEARCH_ASSETS[id];

  const canAfford =
    currentResources.metal >= costs.metal &&
    currentResources.deuterium >= costs.deuterium &&
    currentResources.science >= costs.science &&
    currentResources.microchips >= costs.microchips;

  const prerequisitesMet = prerequisites.every(
    (prereq) => tech.level >= prereq.required_level
  );

  return (
    <div className="bg-gray-900/90 rounded-lg shadow-lg overflow-hidden border border-blue-500/30 hover:border-blue-500 transition-all">
      <div className="p-4">
        <div className="flex items-center mb-4">
          <div className="relative">
            <img
              src={assetConfig?.image}
              alt={assetConfig?.name}
              className={`w-16 h-16 rounded mr-4 ${
                !prerequisitesMet ? "opacity-50 grayscale" : ""
              }`}
            />
            {!prerequisitesMet && (
              <Lock className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-red-500 w-8 h-8" />
            )}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-blue-400 flex items-center gap-2">
              {assetConfig?.name}
              <Beaker className="w-4 h-4" />
            </h3>
            <div className="flex items-center mt-1">
              <Progress
                value={(tech.level / research.max_level) * 100}
                className="w-32 h-2"
              />
              <span className="ml-2 text-sm text-blue-300">
                {tech.level}/{research.max_level}
              </span>
            </div>
          </div>
        </div>

        {/* Research Status */}
        {tech.is_researching ? (
          <Timer
            startTime={tech.research_start_time!}
            finishTime={tech.research_finish_time!}
          />
        ) : (
          <>
            <p className="text-sm text-gray-400 mb-4">
              {assetConfig?.description}
            </p>

            {/* Prerequisites Warning */}
            {!prerequisitesMet && (
              <div className="mb-4 p-2 bg-red-900/30 border border-red-500/30 rounded-md flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-400">
                  Prerequisites not met
                </span>
              </div>
            )}

            {/* Estimated Research Time */}
            <div className="mb-4 p-2 bg-blue-900/20 rounded-md">
              <div className="text-sm text-blue-300">
                Estimated Research Time: {formatTimerTime(researchTime)}
              </div>
            </div>

            {/* Resource Requirements */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {/* Resource cost items */}
            </div>

            <button
              onClick={() => onStartResearch(id)}
              disabled={
                !canAfford ||
                !prerequisitesMet ||
                tech.level >= research.max_level
              }
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 
                       text-white rounded-lg font-medium transition-colors relative overflow-hidden"
            >
              {!prerequisitesMet
                ? "Prerequisites Required"
                : !canAfford
                ? "Insufficient Resources"
                : tech.level >= research.max_level
                ? "Maximum Level"
                : "Begin Research"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
