import { useCallback } from "react";
import { api } from "@/lib/api";
import { MissionType } from "@/models/ship";
import { ResourcePayload } from "@/models/fleet_movement";
import { Planet } from "@/models/planet";
import { useToast } from "@/hooks/use-toast";

interface SendMissionParams {
  ships_ids: string[];
  mission_type: MissionType;
  target_planet: Planet;
  resources?: ResourcePayload;
}

interface QuickMissionParams {
  ship_id: string;
  target_planet: Planet;
}

export function useFleetMissions() {
  const { toast } = useToast();

  const sendMission = useCallback(
    async ({
      ships_ids,
      mission_type,
      target_planet,
      resources,
    }: SendMissionParams) => {
      try {
        await api.fleet.sendMission({
          ships_ids,
          mission_type,
          planet_id: target_planet.id,
          resources,
        });

        toast({
          title: "Success",
          description: "Mission launched successfully.",
        });

        return true;
      } catch (error) {
        console.error("Failed to send mission:", error);
        toast({
          title: "Error",
          description: "Failed to launch mission. Please try again.",
          variant: "destructive",
        });
        return false;
      }
    },
    [toast]
  );

  // Convenience methods for quick missions
  const sendSpyMission = useCallback(
    async ({ ship_id, target_planet }: QuickMissionParams) => {
      return sendMission({
        ships_ids: [ship_id],
        mission_type: "spy",
        target_planet,
      });
    },
    [sendMission]
  );

  const sendAttackMission = useCallback(
    async ({ ship_id, target_planet }: QuickMissionParams) => {
      return sendMission({
        ships_ids: [ship_id],
        mission_type: "attack",
        target_planet,
      });
    },
    [sendMission]
  );

  return {
    sendMission,
    sendSpyMission,
    sendAttackMission,
  };
}
