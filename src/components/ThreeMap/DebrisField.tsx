import { Html } from '@react-three/drei';

import { DebrisField } from '@/models';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

export const DebrisFieldEffect = ({ debrisField }: { debrisField: DebrisField }) => {
	const particlesRef = useRef<THREE.Points>(null);
	// Scale particle count with resources, but keep a minimum for visibility
	const particleCount = Math.max(
		50,
		Math.min(Math.floor((debrisField.metal + debrisField.deuterium + debrisField.microchips) / 100), 200)
	);

	// Memoize the particles geometry
	const geometry = useMemo(() => {
		const geo = new THREE.BufferGeometry();
		const positions = new Float32Array(particleCount * 3);
		const sizes = new Float32Array(particleCount);
		const colors = new Float32Array(particleCount * 3);

		// Create a ring-like distribution of particles around the planet
		const innerRadius = 20; // Start just outside the planet
		const outerRadius = 50; // Extend further into space

		for (let i = 0; i < particleCount; i++) {
			const angle = Math.random() * Math.PI * 2;
			// Use square root for more even particle distribution
			const r = innerRadius + Math.sqrt(Math.random()) * (outerRadius - innerRadius);

			positions[i * 3] = Math.cos(angle) * r; // x
			positions[i * 3 + 1] = Math.sin(angle) * r; // y
			positions[i * 3 + 2] = 0; // z

			sizes[i] = Math.random() * 4 + 20; // Larger particles

			// Assign different colors based on resource type
			const resourceType = Math.random();
			if (resourceType < 0.4) {
				// Metal (silver)
				colors[i * 3] = 0.8;
				colors[i * 3 + 1] = 0.8;
				colors[i * 3 + 2] = 0.8;
			} else if (resourceType < 0.7) {
				// Deuterium (blue)
				colors[i * 3] = 0.2;
				colors[i * 3 + 1] = 0.4;
				colors[i * 3 + 2] = 1.0;
			} else {
				// Microchips (green)
				colors[i * 3] = 0.2;
				colors[i * 3 + 1] = 1.0;
				colors[i * 3 + 2] = 0.4;
			}
		}

		geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
		geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
		geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

		return geo;
	}, [particleCount]);

	const material = useMemo(() => {
		return new THREE.ShaderMaterial({
			uniforms: {
				time: { value: 0 },
			},
			vertexShader: `
				attribute float size;
				attribute vec3 color;
				uniform float time;
				varying float vAlpha;
				varying vec3 vColor;
				
				void main() {
					vColor = color;
					// More pronounced pulsing
					vAlpha = 0.3 + 0.7 * sin(time * 2.0 + position.x * 0.5 + position.y * 0.5);
					vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
					gl_PointSize = size * (300.0 / -mvPosition.z);
					gl_Position = projectionMatrix * mvPosition;
				}
			`,
			fragmentShader: `
				varying float vAlpha;
				varying vec3 vColor;
				
				void main() {
					float r = distance(gl_PointCoord, vec2(0.5));
					if (r > 0.5) discard;
					float intensity = smoothstep(0.5, 0.0, r);
					gl_FragColor = vec4(vColor, intensity * vAlpha);
				}
			`,
			transparent: true,
			depthWrite: false,
			blending: THREE.AdditiveBlending,
		});
	}, []);

	useFrame((state) => {
		if (particlesRef.current) {
			material.uniforms.time.value = state.clock.elapsedTime;

			// Faster rotation for more dynamic effect
			particlesRef.current.rotation.z += 0.002;
		}
	});

	return (
		<group position={[debrisField.coordinate_x, debrisField.coordinate_y, 0]}>
			{/* Background glow effect */}
			<mesh>
				<ringGeometry args={[20, 50, 32]} />
				<meshBasicMaterial color={0x444444} transparent opacity={0.2} blending={THREE.AdditiveBlending} />
			</mesh>

			{/* Particles */}
			<points ref={particlesRef} geometry={geometry} material={material} />

			{/* Resource amount indicator */}
			<Html position={[0, -60, 0]}>
				<div className="text-xs text-gray-300 bg-black/50 px-2 py-1 rounded whitespace-nowrap">
					Resources:{' '}
					{Math.floor(debrisField.metal + debrisField.deuterium + debrisField.microchips).toLocaleString()}
				</div>
			</Html>
		</group>
	);
};
