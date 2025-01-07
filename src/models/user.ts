export interface User {
    id: string;
    name: string;
    home_planet_id: string | null;
    avatar: string;
    global_score: number;
    defense_score: number;
    attack_score: number;
    created_at: number;
    updated_at: number;
}
