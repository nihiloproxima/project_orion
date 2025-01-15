export type ShipType = 'colony_ship' | 'transport_ship' | 'spy_probe' | 'recycler_ship' | 'cruiser' | 'destroyer';

export type ShipStatus = 'stationed' | 'traveling' | 'returning';

export type MissionType = 'transport' | 'colonize' | 'attack' | 'spy' | 'recycle' | 'move';

export interface Ship {
	id: string;
	name: string;
	speed: number;
	cargo_capacity: number;
	attack_power: number;
	defense: number;
	owner_id: string;
	current_planet_id: string | null;
	type: ShipType;
	status: ShipStatus;
	mission_type: MissionType | null;
	destination_x: number | null;
	destination_y: number | null;
	departure_time: number | null;
	arrival_time: number | null;
}
