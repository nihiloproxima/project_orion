import { Planet, ResourceType } from "./planet";
import { User } from "./user";
import { ShipType, Timestamp } from ".";

export type MissionType =
  | "transport"
  | "colonize"
  | "attack"
  | "spy"
  | "recycle"
  | "delivery"
  | "move"
  | "expedition";

export type ResourcePayload = {
  [key in ResourceType]?: number;
};

export interface FleetMovement {
  id: string;
  owner_id: string;
  owner_name: string;
  ships: {
    [shipType in ShipType]?: number;
  };
  origin: {
    planet_id: Planet["id"];
    planet_name: Planet["name"];
    coordinates: {
      x: number;
      y: number;
      galaxy: number;
    };
  };
  destination: {
    planet_id: Planet["id"];
    planet_name: Planet["name"];
    user_id: User["id"] | null;
    anomaly_id?: string;
    coordinates: {
      x: number;
      y: number;
      galaxy: number;
    };
  };
  mission_type: MissionType;
  departure_time: Timestamp;
  arrival_time: Timestamp;
  expedition_end_time?: Timestamp;
  status: "traveling" | "returning" | "expeditioning";
  resources: ResourcePayload | null;
}
