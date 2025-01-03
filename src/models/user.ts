export interface User {
  id: string;
  name: string;
  avatar: string;
  home_planet_id: string | null;
  global_score: number;
  defense_score: number;
  attack_score: number;
  created_at: number;
  updated_at: number;
}
