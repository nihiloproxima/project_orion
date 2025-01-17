export type DefenseType =
    | "missile_launcher"
    | "light_laser"
    | "heavy_laser"
    | "gauss_cannon"
    | "ion_cannon"
    | "plasma_turret"
    | "small_shield_dome"
    | "large_shield_dome";

export interface Defense {
    type: DefenseType;
    amount: number;
}

export interface PlanetDefenses {
    planet_id: string;
    defenses: Defense[];
    updated_at: number;
}

export const DEFAULT_PLANET_DEFENSES: PlanetDefenses = {
    planet_id: "",
    defenses: [],
    updated_at: Date.now(),
};
