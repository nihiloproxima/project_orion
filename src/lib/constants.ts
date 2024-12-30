import { ResearchCategory } from "../models";

import espionageTechImg from "../assets/researchs/espionage_tech.png";
import ansibleNetworkImg from "../assets/researchs/ansible_network.png";
import enhancedMiningImg from "../assets/researchs/enhanced_mining.png";
import advancedAIImg from "../assets/researchs/advanced_ai.png";
import cryogenicEfficiencyImg from "../assets/researchs/cryogenic_efficiency.png";
import naniteConstructorsImg from "../assets/researchs/nanite_constructors.png";
import neuralNetworkImg from "../assets/researchs/neural_network.png";
import energyEfficiencyImg from "../assets/researchs/energy_efficiency.png";
import combatTechImg from "../assets/researchs/combat_tech.png";
import transportTechImg from "../assets/researchs/espionage_tech.png";
import colonizationTechImg from "../assets/researchs/colonization_tech.png";
import { TechnologyId } from "../models";

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
  transport_tech: {
    name: "Transport Technology",
    image: transportTechImg,
    description: "Unlocks transport ships and technologies.",
    category: "ship",
    unlocks: {
      ships: ["Transport Ship"],
    },
  },
  colonization_tech: {
    name: "Life Detection Systems",
    image: colonizationTechImg,
    description:
      "Advanced scanners and analysis tools for detecting habitable worlds and assessing their colonization potential. Unlocks colony ships and planetary settlement capabilities.",
    category: "ship",
    unlocks: {
      ships: ["Colony Ship"],
    },
  },
  combat_tech: {
    name: "Plasma Propulsion Systems",
    image: combatTechImg,
    description:
      "Advanced propulsion technology utilizing superheated plasma to generate powerful thrust. This breakthrough in rocket science enables the construction of larger military vessels capable of interstellar combat.",
    category: "ship",
    unlocks: {
      ships: ["Cruiser"],
    },
  },
  espionage_tech: {
    name: "Espionage Technology",
    image: espionageTechImg,
    description:
      "Increases your ability to gather intelligence on other players and their planets. Each level improves the accuracy and detail of espionage reports.",
    category: "ship",
    unlocks: {
      ships: ["Spy Probe"],
    },
  },
  structures_construction_speed: {
    name: "Nanite Constructors",
    image: naniteConstructorsImg,
    description:
      "Microscopic robots assist in construction, increasing building speed with each level of research.",
    category: "infrastructure",
  },
  deuterium_production_boost: {
    name: "Cryogenic Efficiency",
    image: cryogenicEfficiencyImg,
    description:
      "Optimizes the cooling systems needed to store and transport deuterium, reducing losses.",
    category: "resource",
  },
  energy_efficiency: {
    name: "Energy Efficiency",
    image: energyEfficiencyImg,
    description: "Improves the energy production efficiency.",
    category: "resource",
  },
  microchips_production_boost: {
    name: "Advanced AI",
    image: advancedAIImg,
    description:
      "Develops sophisticated artificial intelligence systems that accelerate research by automating experiments, analyzing data patterns, and optimizing research methodologies. Each level enhances the AI's capabilities to assist in scientific discoveries.",
    category: "infrastructure",
  },
  metal_production_boost: {
    name: "Enhanced Mining",
    image: enhancedMiningImg,
    description: "Improves resource extraction efficiency.",
    category: "resource",
  },
  science_production_boost: {
    name: "Neural Network",
    image: neuralNetworkImg,
    description:
      "Develops synthetic neural matrices that mimic organic brain structures, enabling advanced computational processing and machine consciousness.",
    category: "infrastructure",
  },
  global_researchs: {
    name: "Ansible Network",
    image: ansibleNetworkImg,
    description:
      "Enables research sharing between planets through quantum entanglement.",
    category: "infrastructure",
  },
};
