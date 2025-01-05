import { ResourcePayload } from "@/models/fleet_movement";
import { MissionType, ShipType } from "../models/ship";
import { StructureType } from "../models/structure";
import { supabase } from "./supabase";

function getAuthToken() {
  return supabase.auth.getSession().then(({ data: { session } }) => {
    return session?.access_token;
  });
}

async function post(
  group: string,
  endpoint: string,
  data: Record<string, any>
) {
  const token = await getAuthToken();
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}${group}/${endpoint}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const api = {
  admin: {
    updateConfig: async (id: string, config_data: Record<string, any>) => {
      return post("admin", "updateConfig", { id, config_data });
    },
  },
  researchs: {
    startResearch: async (technologyId: string, planetId: string) => {
      return post("researchs", "startResearch", {
        technology_id: technologyId,
        planet_id: planetId,
      });
    },
  },
  chat: {
    sendMessage: async (channelId: string, text: string) => {
      return post("chat", "sendMessage", { channel_id: channelId, text });
    },
  },
  users: {
    register: async (name: string) => {
      return post("users", "register", { name });
    },
    update: async (name: string, avatar: string) => {
      return post("users", "update", { name, avatar });
    },
  },
  planets: {
    claim: async (planetId: string, homeworld: boolean) => {
      return post("planets", "claim", { planet_id: planetId, homeworld });
    },
  },
  structures: {
    construct: async (planetId: string, type: StructureType) => {
      return post("structures", "construct", {
        planet_id: planetId,
        structure_type: type,
      });
    },
    upgrade: async (planetId: string, type: StructureType) => {
      return post("structures", "upgrade", {
        planet_id: planetId,
        structure_type: type,
      });
    },
  },
  fleet: {
    buildShip: async (shipType: ShipType, planetId: string, amount: number) => {
      return post("fleet", "buildShip", {
        ship_type: shipType,
        planet_id: planetId,
        amount,
      });
    },
    renameShip: async (shipId: string, newName: string) => {
      return post("fleet", "renameShip", {
        ship_id: shipId,
        new_name: newName,
      });
    },
    sendMission: async (params: {
      ships_ids: string[];
      mission_type: MissionType;
      planet_id: string;
      resources?: ResourcePayload;
    }) => {
      return post("fleet", "sendMission", params);
    },
    cancelMission: async (fleet_movement_id: string) => {
      return post("fleet", "cancelMission", {
        fleet_movement_id,
      });
    },
  },
  rankings: {
    getRankings: async (params: {
      type: "global" | "defense" | "attack";
      page: number;
    }): Promise<{
      status: "ok";
      rankings: {
        user_id: string;
        name: string;
        avatar: string;
        score: number;
        planets_count: number;
      }[];
      page: number;
      users_per_page: number;
    }> => {
      return post("rankings", "getRankings", params);
    },
  },
};
