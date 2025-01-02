import { useMemo } from "react";
import * as THREE from "three";
import { GALAXY_GRID } from "../../constants/game";

export function Grid() {
  const gridHelper = useMemo(() => {
    const size = GALAXY_GRID.SIZE;
    const divisions = size / GALAXY_GRID.CELL_SIZE; // Create grid lines based on cell size

    // Create main grid
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
      const materials = grid.material as THREE.Material[];
      materials.forEach((material: THREE.Material) => {
        material.transparent = true;
        material.opacity = 0.5;
      });
    }

    // Add coordinate system helper lines
    const axisHelper = new THREE.Group();

    // X-axis (red)
    const xAxis = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-size / 2, 0, 0),
        new THREE.Vector3(size / 2, 0, 0),
      ]),
      new THREE.LineBasicMaterial({
        color: 0xff0000,
        opacity: 0.3,
        transparent: true,
      })
    );

    // Z-axis (blue)
    const zAxis = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, -size / 2),
        new THREE.Vector3(0, 0, size / 2),
      ]),
      new THREE.LineBasicMaterial({
        color: 0x0000ff,
        opacity: 0.3,
        transparent: true,
      })
    );

    axisHelper.add(xAxis);
    axisHelper.add(zAxis);
    grid.add(axisHelper);

    return grid;
  }, []);

  return <primitive object={gridHelper} />;
}
