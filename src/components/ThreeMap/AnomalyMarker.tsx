import { useMemo } from 'react';

import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';

export const AnomalyMarker = ({ position }: { position: [number, number, number] }) => {
	const particlesRef = useRef<THREE.Points>(null);
	const glowRef = useRef<THREE.Mesh>(null);

	// Create particles for the anomaly effect
	const particleGeometry = useMemo(() => {
		const geometry = new THREE.BufferGeometry();
		const particleCount = 100;
		const positions = new Float32Array(particleCount * 3);
		const colors = new Float32Array(particleCount * 3);

		for (let i = 0; i < particleCount; i++) {
			const angle = Math.random() * Math.PI * 2;
			const r = Math.random() * 40;
			positions[i * 3] = Math.cos(angle) * r;
			positions[i * 3 + 1] = Math.sin(angle) * r;
			positions[i * 3 + 2] = 0;

			// Brighter purple to pink gradient
			colors[i * 3] = 0.9 + Math.random() * 0.1; // R
			colors[i * 3 + 1] = 0.3 + Math.random() * 0.2; // G
			colors[i * 3 + 2] = 0.9 + Math.random() * 0.1; // B
		}

		geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
		geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
		return geometry;
	}, []);

	useFrame((state) => {
		if (particlesRef.current) {
			// Gentle swirling for particles only
			particlesRef.current.rotation.z -= 0.001;
		}
		if (glowRef.current) {
			// Pulsing effect for the glow
			const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
			glowRef.current.scale.setScalar(scale);

			if (glowRef.current.material instanceof THREE.MeshBasicMaterial) {
				glowRef.current.material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
			}
		}
	});

	return (
		<group position={position}>
			{/* Particle effect */}
			<points ref={particlesRef} geometry={particleGeometry}>
				<pointsMaterial size={5} vertexColors transparent opacity={0.8} blending={THREE.AdditiveBlending} />
			</points>

			{/* HTML-based question mark */}
			<Html center distanceFactor={40}>
				<div
					className="text-[2px] font-bold text-fuchsia-400"
					style={{
						textShadow: '0 0 10px #d946ef, 0 0 20px #d946ef',
						transform: 'translate(-0%, -1%)',
						pointerEvents: 'none',
						width: '20px',
						height: '20px',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					?
				</div>
			</Html>
		</group>
	);
};
