export type UserTitle = string;

export interface User {
    id: string;
    name: string;
    home_planet_id: string | null;
    avatar: string;
    credits: number;
    global_score: number;
    defense_score: number;
    attack_score: number;
    created_at: number;
    updated_at: number;
    reputation_level: number;
    reputation_points: number;
    title: UserTitle | null;
}
