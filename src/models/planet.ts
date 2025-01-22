export type PlanetBiome = 'desert' | 'ocean' | 'jungle' | 'ice' | 'volcanic';

export interface Planet {
	id: string;
	name: string;
	coordinate_x: number;
	coordinate_y: number;
	coordinate_z: number; // Galaxy number (0-10)
	owner_id: string | null;
	is_homeworld: boolean;
	owner_name?: string;
	biome: PlanetBiome;
	size_km: number;
	created_at: number;
	updated_at: number;
}
