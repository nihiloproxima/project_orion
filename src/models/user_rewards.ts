import { Planet } from "./planet";
import { ResourceType } from "./planets_resources";

export interface UserReward {
    id: string;
    user_id: string;
    data: ResourcesReward | CreditsReward | ReputationReward;
    created_at: number;
    updated_at: number;
}

export interface ResourcesReward {
    type: "resources";
    planet_id: Planet["id"];
    resources: {
        [K in ResourceType]?: number;
    };
}

export interface CreditsReward {
    type: "credits";
    credits: number;
}

export interface ReputationReward {
    type: "reputation";
    reputation_points: number;
}
