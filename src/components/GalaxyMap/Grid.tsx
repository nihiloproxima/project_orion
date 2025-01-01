import { useMemo } from "react";
import * as THREE from "three";
import { GALAXY_GRID } from "../../constants/game";

export function Grid() {
  const gridHelper = useMemo(() => {
    const size = GALAXY_GRID.SIZE;
    const divisions = size / 50; // Create a grid line every 50 units

    const grid = new THREE.GridHelper(
      size,
      divisions,
      new THREE.Color("rgb(32, 224, 160)").multiplyScalar(0.15), // Main grid lines
      new THREE.Color("rgb(32, 224, 160)").multiplyScalar(0.05) // Secondary grid lines
    );

    // Rotate grid to be horizontal (XZ plane)
    grid.rotation.x = Math.PI / 2;

    // Make grid material transparent
    if (grid.material instanceof THREE.Material) {
      grid.material.transparent = true;
      grid.material.opacity = 0.5;
    } else {
      // Handle array of materials case
      const materials = grid.material as THREE.Material[];
      materials.forEach((material: THREE.Material) => {
        material.transparent = true;
        material.opacity = 0.5;
      });
    }

    return grid;
  }, []);

  return <primitive object={gridHelper} />;
}
