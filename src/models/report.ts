import { ShipType } from "./ship";

export type ReportType = "spy" | "combat" | "mission";

export interface BaseReport {
    id: string;
    type: ReportType;
    created_at: number;
    owner_id: string;
    title: string;
    read: boolean;
}

export interface ResourcesInfo {
    current: {
        metal: number;
        deuterium: number;
        microchips: number;
        science: number;
    };
}

export interface StructureInfo {
    type: string;
    level: number;
    is_under_construction: boolean;
}

export interface ResearchInfo {
    id: string;
    level: number;
    is_researching: boolean;
}

export interface ShipInfo {
    type: ShipType;
    count: number;
}

export interface SpyReport extends BaseReport {
    type: "spy";
    target_planet_id: string;
    target_owner_id: string;
    target_coordinates: {
        x: number;
        y: number;
    };
    resources: ResourcesInfo;
    structures: StructureInfo[];
    research: ResearchInfo[];
    defense_score: number;
    ships: ShipInfo[];
}
