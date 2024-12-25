export type ShipType =
    | "colony_ship"
    | "transport_ship"
    | "spy_probe"
    | "recycler_ship"
    | "cruiser";

export type ShipStatus =
    | "stationed"
    | "traveling"
    | "returning";

export type MissionType =
    | "transport"
    | "colonize"
    | "attack"
    | "spy"
    | "recycle";

export interface Ship {
    id: string;
    name: string;
    speed: number;
    cargo_capacity: number;
    attack_power: number;
    defense: number;
    owner_id: string;
    home_planet_id: string;
    current_planet_id: string | null;
    type: ShipType;
    status: ShipStatus;
    mission_type: MissionType | null;
    destination_planet_id: string | null;
    departure_time: Date | null;
    arrival_time: Date | null;
}
