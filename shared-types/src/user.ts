import { Timestamp } from "./timestamp";
import { Planet } from "./planet";

export type UserTitle = string;

export type OnboardingStep =
  | "create_user"
  | "choose_homeworld"
  | "build_metal_mine";

export interface User {
  id: string;
  season: number;
  name: string;
  onboarding_step: OnboardingStep;
  home_planet_id: Planet["id"] | null;
  avatar: number;
  score: number;
  level: number;
  xp: number;
  title: UserTitle | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}
