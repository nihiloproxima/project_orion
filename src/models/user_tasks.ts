import {
    CreditsReward,
    DebrisField,
    MissionType,
    Outpost,
    Planet,
    ReputationReward,
    ResourcesReward,
    ShipType,
    StructureType,
    TechnologyId,
} from ".";

export type TaskId = string;
export type TaskType =
    | "ship"
    | "mission"
    | "research"
    | "structure_construction";
export type TaskStatus = "pending" | "in_progress" | "completed" | "failed";

export interface Task {
    id: TaskId;
    type: TaskType;
    context: string;
    status: TaskStatus;
    rewards: Array<ResourcesReward | CreditsReward | ReputationReward>;
}

export interface BuildStructureTask extends Task {
    id: string;
    type: "structure_construction";
    structure_type: StructureType;
    required_level: number;
}

export interface ResearchTask extends Task {
    id: string;
    type: "research";
    technology_id: TechnologyId;
    required_level: number;
}

export interface MissionTask extends Task {
    id: string;
    type: "mission";
    mission_type: MissionType;
    target_type: "planet" | "debris_field" | "anomaly" | "outpost";
    target_id: Planet["id"] | DebrisField["id"] | Outpost["id"]; // Anomaly id / outpost id
}

export interface ShipTask extends Task {
    id: string;
    type: "ship";
    ship_type: ShipType;
    goal: number;
    progress: number;
}

export interface UserTasks {
    user_id: string;
    tasks: Array<Task>;
    updated_at: number;
    created_at: number;
}
