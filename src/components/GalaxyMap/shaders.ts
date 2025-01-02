import * as THREE from "three";

export function getAtmosphereShader(color: string) {
  return {
    uniforms: {
      color: { value: new THREE.Color(color) },
      viewVector: { value: new THREE.Vector3() },
    },
    vertexShader: `
      uniform vec3 viewVector;
      varying float intensity;
      void main() {
        vec3 vNormal = normalize(normalMatrix * normal);
        vec3 vNormel = normalize(normalMatrix * viewVector);
        intensity = pow(0.7 - dot(vNormal, vNormel), 2.0);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 color;
      varying float intensity;
      void main() {
        gl_FragColor = vec4(color, 1.0) * intensity;
      }
    `,
  };
}
