import { Structure } from "../models/structure";

import { useGame } from "../contexts/GameContext";
import { StructureType } from "../models/structure";
import { useCallback } from "react";
import { api } from "../lib/api";

interface UseStructuresReturn {
  startConstruction: (type: StructureType) => Promise<void>;
  upgradeStructure: (structure: Structure) => Promise<void>;
  canAffordResources: (
    metal: number,
    deuterium: number,
    energy: number
  ) => boolean;
  calculateProductionRate: (structure: Structure) => number;
}

export function useStructures(): UseStructuresReturn {
  const { state } = useGame();

  const startConstruction = useCallback(
    async (type: StructureType) => {
      if (!state.selectedPlanet) return;
      try {
        await api.structures.construct(state.selectedPlanet.id, type);
      } catch (error) {
        console.error("Error starting construction:", error);
      }
    },
    [state.selectedPlanet]
  );

  const upgradeStructure = useCallback(
    async (structure: Structure) => {
      if (!state.selectedPlanet) return;
      try {
        await api.structures.upgrade(state.selectedPlanet.id, structure.id);
      } catch (error) {
        console.error("Error upgrading structure:", error);
      }
    },
    [state.selectedPlanet]
  );

  // ... other functions ...

  return {
    startConstruction,
    upgradeStructure,
    canAffordResources,
    calculateProductionRate,
  };
}
