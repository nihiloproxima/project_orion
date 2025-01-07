import { StructureType } from "./planet_structures";
import { ResourceType } from "./planets_resources";
import { TechnologyId } from "./researchs_config";

export interface StructureConfig {
    type: StructureType;

    cost: {
        resources: {
            metal: number;
            deuterium: number;
            microchips: number;
            science: number;
        };
        percent_increase_per_level: number;
    };

    prerequisites: {
        structures: {
            type: StructureType;
            level: number;
        }[];
        technologies: {
            id: TechnologyId;
            level: number;
        }[];
    };

    production: {
        base: number | null;
        percent_increase_per_level: number | null;
        resource: ResourceType | null;
    };

    storage: {
        increase_per_level: number | null;
        resource: ResourceType | null;
    };

    time: {
        base_seconds: number;
        percent_increase_per_level: number;
        max_seconds: number;
    };

    energy_consumption: {
        base: number;
        percent_increase_per_level: number;
    };
}
