import { TechnologyId } from "./researchs_config";

export interface ResearchPrerequisites {
  technology_id: TechnologyId;
  required_level: number;
}

export interface ResearchConfig {
  name: string;
  description: string;
  max_level: number;
  prerequisites: ResearchPrerequisites[];
  cost: {
    base_metal: number;
    base_deuterium: number;
    base_science: number;
    base_microchips: number;
    percent_increase_per_level: number;
  };
  time: {
    base_seconds: number;
    percent_increase_per_level: number;
  };
}
