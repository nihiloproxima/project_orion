// outposts are NPC structures that can't be attacked by players. They serve for trading resources with players and for missions
export interface Outpost {
    id: string;
    name: string;
    coordinate_x: number;
    coordinate_y: number;
    created_at: number;
    updated_at: number;
}
