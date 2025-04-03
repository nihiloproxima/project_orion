import { ShipBlueprint, ShipComponent } from "./ship";

export interface UserInventory {
  ship_blueprints: Array<ShipBlueprint>;
  ship_components: Array<ShipComponent>;
  credits: number;
}
