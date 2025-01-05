// src/declarations.d.ts
import { GridHelper } from "three";
import { ReactThreeFiber } from "@react-three/fiber";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      gridHelper: ReactThreeFiber.Object3DNode<GridHelper, typeof GridHelper>;
    }
  }
}
