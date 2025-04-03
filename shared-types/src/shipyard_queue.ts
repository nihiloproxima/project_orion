import { Timestamp } from "./timestamp";
import { Planet } from "./planet";
import { Ship, ShipBlueprint } from "./ship";

export interface ShipyardQueueCommand {
  ship: Partial<Ship>;
  construction_start_time: Timestamp;
  construction_finish_time: Timestamp;
  base_cost: ShipBlueprint["base_cost"];
}

export interface ShipyardQueue {
  planet_id: Planet["id"];
  commands: Array<ShipyardQueueCommand>;
  capacity: number;
  created_at: Timestamp;
  updated_at: Timestamp;
}
