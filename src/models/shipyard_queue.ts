import { ShipType } from "./ship";

export interface ShipyardQueueCommand {
    ship_type: ShipType;
    remaining_amount: number;
    total_amount: number;
    construction_start_time: number;
    construction_finish_time: number;
    current_item_start_time: number;
    current_item_finish_time: number;
    total_metal_cost: number;
    total_deuterium_cost: number;
    total_microchips_cost: number;
}

export interface ShipyardQueue {
    planet_id: string;
    commands: Array<ShipyardQueueCommand>;
    capacity: number;
    is_processing_command: boolean;
    created_at: number;
    updated_at: number;
}
