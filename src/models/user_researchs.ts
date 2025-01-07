export interface Technology {
    level: number;
    is_researching: boolean;
    research_start_time: number | null;
    research_finish_time: number | null;
    researching_planet_id: string | null; // The planet where research is happening
    researching_planet_name: string | null; // The name of the planet where research is happening
}

export interface UserResearchs {
    user_id: string; // UUID type
    technologies: {
        [technology_id: string]: Technology;
    };
    capacity: number; // amount of research labs
    updated_at: number;
}
