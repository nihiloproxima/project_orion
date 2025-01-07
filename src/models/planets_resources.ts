export type ResourceType =
    | "metal"
    | "energy"
    | "deuterium"
    | "science"
    | "microchips";

export interface PlanetResources {
    planet_id: string;
    metal: number;
    microchips: number;
    deuterium: number;
    science: number;
    energy: number;
    updated_at: number;
}

export const DEFAULT_PLANET_RESOURCES: PlanetResources = {
    planet_id: "",
    metal: 500,
    microchips: 0,
    deuterium: 500,
    science: 0,
    energy: 0,
    updated_at: Date.now(),
};
