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
    `${import.meta.env.VITE_API_URL}${group}/${endpoint}`,
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
  users: {
    register: async (id: string, name: string) => {
      return post("users", "register", { id, name });
    },
    update: async (name: string) => {
      return post("users", "update", { name });
    },
  },
  planets: {
    claim: async (planetId: string, homeworld: boolean) => {
      return post("planets", "claim", { planet_id: planetId, homeworld });
    },
  },
  structures: {
    construct: async (planetId: string, type: StructureType) => {
      return post("structures", "construct", { planet_id: planetId, type });
    },
  },
};
