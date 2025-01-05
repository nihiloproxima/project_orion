export interface Technology {
  level: number;
  is_researching: boolean;
  research_start_time: number | null;
  research_finish_time: number | null;
}

export interface PlanetResearchs {
  planet_id: string; // UUID type
  technologies: {
    [technology_id: string]: Technology;
  };
  last_update: number;
  is_researching: boolean;
}
