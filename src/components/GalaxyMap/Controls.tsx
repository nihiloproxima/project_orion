import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { GALAXY_GRID } from "../../constants/game";

export function Controls() {
  const { camera } = useThree();

  const handleZoom = (zoomIn: boolean) => {
    const zoomFactor = zoomIn ? 0.8 : 1.2;
    const newPosition = camera.position.clone();

    // Calculate new camera position
    newPosition.multiplyScalar(zoomFactor);

    // Clamp the zoom level
    const distance = newPosition.length();
    if (distance >= GALAXY_GRID.MIN_ZOOM && distance <= GALAXY_GRID.MAX_ZOOM) {
      camera.position.copy(newPosition);
    }
  };

  // Create a group for the controls that follows the camera
  const controlsGroup = new THREE.Group();
  controlsGroup.position.set(10, 10, -50); // Position further back from camera

  // Create plus button mesh
  const plusGeometry = new THREE.BoxGeometry(3, 3, 0.5); // Larger size
  const plusMaterial = new THREE.MeshBasicMaterial({
    color: 0x20e0a0,
    transparent: true,
    opacity: 0.8,
  });
  const plusMesh = new THREE.Mesh(plusGeometry, plusMaterial);
  plusMesh.position.set(0, 4, 0);
  plusMesh.userData.onClick = () => handleZoom(true);

  // Create minus button mesh
  const minusGeometry = new THREE.BoxGeometry(3, 3, 0.5); // Larger size
  const minusMaterial = new THREE.MeshBasicMaterial({
    color: 0x20e0a0,
    transparent: true,
    opacity: 0.8,
  });
  const minusMesh = new THREE.Mesh(minusGeometry, minusMaterial);
  minusMesh.position.set(0, -4, 0);
  minusMesh.userData.onClick = () => handleZoom(false);

  // Make controls face camera
  controlsGroup.lookAt(camera.position);

  controlsGroup.add(plusMesh);
  controlsGroup.add(minusMesh);

  return <primitive object={controlsGroup} />;
}
