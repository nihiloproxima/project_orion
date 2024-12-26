export interface User {
    id: string;
    name: string | null;
    avatar_url: string | null;
    home_planet_id: string | null;
    score: number | null;
    created_at: number;
    updated_at: number;
}
