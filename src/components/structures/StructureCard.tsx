interface StructureCardProps {
  info: StructureInfo;
  existingStructure?: Structure;
  config: GameStructuresConfig[keyof GameStructuresConfig];
  state: GameState; // Replace 'any' with proper type
  onUpgrade: (structure: Structure) => void;
  onConstruct: (type: StructureType) => void;
}

export function StructureCard({
  info,
  existingStructure,
  config,
  state,
  onUpgrade,
  onConstruct,
}: StructureCardProps) {
  // ... existing StructureCard code ...
}
