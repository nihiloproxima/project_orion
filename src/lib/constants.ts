import { ResearchCategory } from "../models";
import { TechnologyId } from "../models";

export const TECHNOLOGIES: Record<
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
    image: "transport_tech.png",
    description:
      "Advanced logistics and cargo management systems that enable the construction and operation of interstellar transport vessels.",
    category: "ship",
    unlocks: {
      ships: ["Transport Ship"],
    },
  },
  colonization_tech: {
    name: "Life Detection Systems",
    image: "colonization_tech.png",
    description:
      "Advanced scanners and analysis tools for detecting habitable worlds and assessing their colonization potential. Unlocks colony ships and planetary settlement capabilities.",
    category: "ship",
    unlocks: {
      ships: ["Colony Ship"],
    },
  },
  combat_tech: {
    name: "Plasma Propulsion Systems",
    image: "combat_tech.png",
    description:
      "Advanced propulsion technology utilizing superheated plasma to generate powerful thrust. This breakthrough in rocket science enables the construction of larger military vessels capable of interstellar combat.",
    category: "ship",
    unlocks: {
      ships: ["Cruiser"],
    },
  },
  espionage_tech: {
    name: "Espionage Technology",
    image: "espionage_tech.png",
    description:
      "Increases your ability to gather intelligence on other players and their planets. Each level improves the accuracy and detail of espionage reports.",
    category: "ship",
    unlocks: {
      ships: ["Spy Probe"],
    },
  },
  structures_construction_speed: {
    name: "Nanite Constructors",
    image: "nanite_constructors.png",
    description:
      "Microscopic robots assist in construction, increasing building speed with each level of research.",
    category: "infrastructure",
  },
  deuterium_production_boost: {
    name: "Cryogenic Efficiency",
    image: "cryogenic_efficiency.png",
    description:
      "Optimizes the cooling systems needed to store and transport deuterium, reducing losses.",
    category: "resource",
  },
  energy_efficiency: {
    name: "Energy Efficiency",
    image: "energy_efficiency.png",
    description: "Improves the energy production efficiency.",
    category: "resource",
  },
  microchips_production_boost: {
    name: "Advanced AI",
    image: "advanced_ai.png",
    description:
      "Develops sophisticated artificial intelligence systems that accelerate research by automating experiments, analyzing data patterns, and optimizing research methodologies. Each level enhances the AI's capabilities to assist in scientific discoveries.",
    category: "infrastructure",
  },
  metal_production_boost: {
    name: "Enhanced Mining",
    image: "enhanced_mining.png",
    description: "Improves resource extraction efficiency.",
    category: "resource",
  },
  science_production_boost: {
    name: "Neural Network",
    image: "neural_network.png",
    description:
      "Develops synthetic neural matrices that mimic organic brain structures, enabling advanced computational processing and machine consciousness.",
    category: "infrastructure",
  },
  global_researchs: {
    name: "Ansible Network",
    image: "ansible_network.png",
    description:
      "Enables research sharing between planets through quantum entanglement.",
    category: "infrastructure",
  },
};
