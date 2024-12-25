import { useGame } from "../contexts/GameContext";
import { Ship, Planet, MissionType, Mission } from "../types/game";
import { calculateDistance } from "../lib/utils";

export function useFleetControl() {
  const { state, dispatch } = useGame();

  const calculateTravelTime = (
    ship: Ship,
    from: Planet,
    to: Planet
  ): number => {
    const distance = calculateDistance(from.coordinates, to.coordinates);
    const timeInHours = distance / ship.speed;
    return timeInHours * 3600000; // Convert to milliseconds
  };

  const sendShipOnMission = (
    ship: Ship,
    fromPlanet: Planet,
    toPlanet: Planet,
    missionType: MissionType,
    resources?: Mission["resources"]
  ) => {
    const startTime = Date.now();
    const travelTime = calculateTravelTime(ship, fromPlanet, toPlanet);
    const endTime = startTime + travelTime;

    const mission: Mission = {
      type: missionType,
      targetPlanetId: toPlanet.id,
      startTime,
      endTime,
      resources,
    };

    dispatch({
      type: "UPDATE_SHIP_STATUS",
      payload: {
        shipId: ship.id,
        status: "TRAVELING",
      },
    });

    // Set timeout to handle mission completion
    setTimeout(() => {
      handleMissionComplete(ship, mission);
    }, travelTime);
  };

  const handleMissionComplete = (ship: Ship, mission: Mission) => {
    // Mission-specific logic here
    dispatch({
      type: "UPDATE_SHIP_STATUS",
      payload: {
        shipId: ship.id,
        status: "STATIONED",
      },
    });
  };

  return { sendShipOnMission };
}
