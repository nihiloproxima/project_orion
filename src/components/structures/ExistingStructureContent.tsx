interface ExistingStructureContentProps {
  structure: Structure;
  info: StructureInfo;
  upgradeCosts: {
    metal: number;
    deuterium: number;
    energy: number;
  };
  constructionTime: number;
  state: GameState;
  onUpgrade: (structure: Structure) => void;
}

export function ExistingStructureContent({
  structure,
  info,
  upgradeCosts,
  constructionTime,
  state,
  onUpgrade,
}: ExistingStructureContentProps) {
  // ... existing code ...
}
