import { DefenseType } from "./defense";
import { TechnologyId } from "./researchs_config";

export interface DefenseConfig {
    type: DefenseType;
    cost: {
        metal: number;
        deuterium: number;
        microchips: number;
        science: number;
    };
    stats: {
        attack_power: number;
        defense: number;
        shield: number;
    };
    construction_time: number;
    requirements: {
        defense_factory_level: number;
        technologies: Array<{
            id: TechnologyId;
            level: number;
        }>;
    };
}
