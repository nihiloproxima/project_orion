'use client';

import * as THREE from 'three';

import { Canvas, ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import React, { useEffect, useRef, useState, useMemo, useContext } from 'react';

import { FleetMovement, Planet } from '@/models';
import utils from '@/lib/utils';
import _ from 'lodash';
import { useGame } from '@/contexts/GameContext';
import { DebrisFieldEffect } from './DebrisField';
import { AnomalyMarker } from './AnomalyMarker';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { db, withIdConverter } from '@/lib/firebase';
import { collection, query, where } from 'firebase/firestore';
import { api } from '@/lib/api';

// Add a new context at the top level to manage open cards
const OpenCardsContext = React.createContext<{
	openCards: Set<string>;
	setOpenCards: React.Dispatch<React.SetStateAction<Set<string>>>;
}>({ openCards: new Set(), setOpenCards: () => {} });

function PlanetObject({
	planet,
	isHighlighted,
	isSelectable,
	onSelect,
	mode,
}: {
	planet: Planet;
	isHighlighted: boolean;
	isSelectable: boolean;
	onSelect?: () => void;
	mode: 'view-only' | 'mission-target' | 'homeworld';
}) {
	const [isInfoCardHovered, setIsInfoCardHovered] = useState(false);
	const { openCards, setOpenCards } = useContext(OpenCardsContext);
	const isHovered = openCards.has(planet.id);
	const meshRef = useRef<THREE.Mesh>(null);
	const glowRef = useRef<THREE.Mesh>(null);
	const starRef = useRef<THREE.Mesh>(null);
	const { camera } = useThree();
	const { state } = useGame();

	const radius = Math.max(Math.log(planet.radius) * 2, 4);
	const hitboxRadius = radius * 2; // Larger hitbox for easier clicking

	const getTextStyle = () => {
		const baseSize = 12;
		const scale = Math.min(Math.max(camera.zoom * baseSize, 8), baseSize);

		return {
			fontSize: `${scale}px`,
			opacity: camera.zoom < 0.15 ? 0 : 1,
			transition: 'opacity 0.2s ease',
		};
	};

	const getBiomeColor = () => {
		switch (planet.biome) {
			case 'ocean':
				return new THREE.Color(0x38bdf8);
			case 'jungle':
				return new THREE.Color(0xeab308);
			case 'desert':
				return new THREE.Color(0xf97316);
			case 'ice':
				return new THREE.Color(0x22d3ee);
			case 'volcanic':
				return new THREE.Color(0xef4444);
			default:
				return new THREE.Color(0x20e0a0);
		}
	};

	const isOwnedByPlayer = planet.owner_id === state.currentUser?.id;

	useFrame((state) => {
		if (meshRef.current && (isHighlighted || isHovered)) {
			const scale = 1.2 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
			meshRef.current.scale.set(scale, scale, 1);
		} else if (meshRef.current) {
			meshRef.current.scale.set(1, 1, 1);
		}

		// Only animate glow for selectable planets
		if (glowRef.current && isSelectable) {
			const glowOpacity = 0.2 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
			const glowScale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
			const material = glowRef.current.material as THREE.Material;
			material.opacity = glowOpacity;
			glowRef.current.scale.set(glowScale, glowScale, 1);
		}

		// Add star animation for owned planets
		if (starRef.current && isOwnedByPlayer) {
			const starScale = 1.5 + Math.sin(state.clock.elapsedTime * 1.5) * 0.2;
			const starRotation = state.clock.elapsedTime * 0.5;
			starRef.current.scale.set(starScale, starScale, 1);
			starRef.current.rotation.z = starRotation;
		}
	});

	const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
		e.stopPropagation();
		if (e.pointerType === 'touch') {
			setOpenCards(new Set([planet.id]));
		}
	};

	const handleClick = (e: any) => {
		e.stopPropagation();
		if (mode === 'homeworld' && isSelectable && onSelect) {
			onSelect();
		}
		if (e.pointerType !== 'touch') {
			setOpenCards((current) => {
				const next = new Set(current);
				if (next.has(planet.id)) {
					next.delete(planet.id);
				} else {
					next.add(planet.id);
				}
				return next;
			});
		}
	};

	const isActive = isHovered || isInfoCardHovered;

	return (
		<group
			position={[planet.position.x, planet.position.y, 0]}
			onClick={handleClick}
			onPointerDown={handlePointerDown}
			onPointerEnter={(e) => {
				// Only set hover for mouse devices
				if (e.pointerType !== 'touch') {
					setOpenCards(new Set([planet.id]));
				}
			}}
			onPointerLeave={(e) => {
				// Only remove hover for mouse devices
				if (e.pointerType !== 'touch') {
					setOpenCards((current) => {
						const next = new Set(current);
						next.delete(planet.id);
						return next;
					});
				}
			}}
		>
			{/* Hitbox (invisible but clickable) */}
			<mesh>
				<circleGeometry args={[hitboxRadius, 32]} />
				<meshBasicMaterial visible={false} transparent opacity={isSelectable ? 1 : 0} />
			</mesh>

			{/* Main planet circle */}
			<mesh ref={meshRef}>
				<circleGeometry args={[radius, 32]} />
				<meshBasicMaterial
					color={getBiomeColor()}
					transparent
					opacity={!isSelectable ? 0.4 : isHighlighted || isHovered ? 1 : 0.8}
				/>
			</mesh>

			{/* Glow effect */}
			{(isSelectable || isHovered) && (
				<mesh ref={glowRef}>
					<circleGeometry args={[radius * 4, 32]} />
					<meshBasicMaterial
						color={getBiomeColor()}
						transparent
						opacity={0.3}
						blending={THREE.AdditiveBlending}
						depthWrite={false}
					/>
				</mesh>
			)}
			{/* Planet label */}
			<Html position={[0, radius * 2, 0]}>
				<div
					className={`text-white pointer-events-none text-center ${!isSelectable ? 'opacity-40' : ''}`}
					style={getTextStyle()}
				>
					{planet.name}
				</div>
			</Html>

			{/* Info card */}
			{isActive && (
				<Planet3DInfoCard
					planet={planet}
					position={[0, radius * 3, 0]}
					mode={mode}
					isSelectable={isSelectable}
					onSelect={onSelect}
					onHoverStart={() => setIsInfoCardHovered(true)}
					onHoverEnd={() => setIsInfoCardHovered(false)}
				/>
			)}

			{isOwnedByPlayer && (
				<mesh ref={starRef}>
					<ringGeometry args={[radius * 1.2, radius * 2, 5]} />
					<meshBasicMaterial
						color={0xffd700}
						transparent
						opacity={0.8}
						blending={THREE.AdditiveBlending}
						depthWrite={false}
					/>
				</mesh>
			)}
		</group>
	);
}

// Add this custom geometry right after the PlanetObject component
class StarGeometry extends THREE.BufferGeometry {
	constructor(innerRadius: number, outerRadius: number, points: number) {
		super();

		const vertices = [];
		const step = (Math.PI * 2) / points;

		for (let i = 0; i < points; i++) {
			const angle = i * step;

			// Center point
			vertices.push(0, 0, 0);

			// Outer point
			vertices.push(Math.cos(angle) * outerRadius, Math.sin(angle) * outerRadius, 0);

			// Inner point
			vertices.push(Math.cos(angle + step / 2) * innerRadius, Math.sin(angle + step / 2) * innerRadius, 0);
		}

		this.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
	}
}

// Register the custom geometry
THREE.BufferGeometry.prototype.starGeometry = StarGeometry;
declare module 'three' {
	interface BufferGeometry {
		starGeometry: typeof StarGeometry;
	}
}

const Planet3DInfoCard = ({
	planet,
	position,
	mode,
	isSelectable,
	onSelect,
	onHoverStart,
	onHoverEnd,
}: {
	planet: Planet;
	position: [number, number, number];
	mode: 'view-only' | 'mission-target' | 'homeworld';
	isSelectable: boolean;
	onSelect?: () => void;
	onHoverStart?: () => void;
	onHoverEnd?: () => void;
}) => {
	return (
		<Html position={position}>
			<div
				className={`bg-neutral-900/95 border-2 ${
					isSelectable ? 'border-emerald-400/30' : 'border-neutral-400/30'
				} p-3 
          -translate-x-1/2 -translate-y-1/2 text-neutral-100 font-sans text-sm 
          pointer-events-auto whitespace-nowrap rounded-md shadow-lg`}
				onMouseEnter={onHoverStart}
				onMouseLeave={onHoverEnd}
			>
				<div className="flex justify-between items-center mb-3">
					<span
						className={`${
							isSelectable ? 'text-emerald-400' : 'text-neutral-400'
						} text-base font-bold tracking-wide`}
					>
						{planet.name}
					</span>
					<span className="text-emerald-400/60 ml-4 font-mono text-xs">
						[{planet.position.x}, {planet.position.y}]
					</span>
				</div>

				<div className="mb-2 flex items-center">
					<span className="text-neutral-400 mr-2">Size:</span>
					<span className="text-neutral-200">{planet.radius.toLocaleString()} km</span>
				</div>

				<div className="mb-2 flex items-center">
					<span className="text-neutral-400 mr-2">Biome:</span>
					<span className="text-neutral-200 capitalize">{planet.biome}</span>
				</div>

				{planet.owner_name && (
					<div className="flex items-center">
						<span className="text-neutral-400 mr-2">Owner:</span>
						<span className="text-neutral-200">{planet.owner_name}</span>
					</div>
				)}

				{mode === 'mission-target' && (
					<div className="mt-3">
						{isSelectable ? (
							<button
								onClick={() => onSelect?.()}
								className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-1.5 px-3 rounded-md 
                          transition-colors duration-200 text-sm font-medium"
							>
								Select Target
							</button>
						) : (
							<div className="text-red-400 text-xs text-center">Not available as target</div>
						)}
					</div>
				)}

				{mode === 'homeworld' && (
					<div className="mt-3">
						{isSelectable ? (
							<button
								onClick={() => onSelect?.()}
								className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-1.5 px-3 rounded-md 
                          transition-colors duration-200 text-sm font-medium"
							>
								Choose as Homeworld
							</button>
						) : (
							<div className="text-red-400 text-xs text-center">Not available as homeworld</div>
						)}
					</div>
				)}
			</div>
		</Html>
	);
};

const GridSystem = () => {
	// Create a 2D grid
	return (
		<group>
			{/* Horizontal lines */}
			{Array.from({ length: 21 }, (_, i) => {
				const pos = (i - 10) * 1000; // Lines every 1000 units
				return (
					<line key={`h${i}`}>
						<bufferGeometry
							attach="geometry"
							attributes={{
								position: new THREE.BufferAttribute(new Float32Array([-5000, pos, 0, 5000, pos, 0]), 3),
							}}
						/>
						<lineBasicMaterial
							attach="material"
							color="rgba(32, 224, 160, 0.15)"
							transparent
							opacity={pos === 0 ? 0.5 : 0.15}
						/>
					</line>
				);
			})}

			{/* Vertical lines */}
			{Array.from({ length: 21 }, (_, i) => {
				const pos = (i - 10) * 1000;
				return (
					<line key={`v${i}`}>
						<bufferGeometry
							attach="geometry"
							attributes={{
								position: new THREE.BufferAttribute(new Float32Array([pos, -5000, 0, pos, 5000, 0]), 3),
							}}
						/>
						<lineBasicMaterial
							attach="material"
							color="rgba(32, 224, 160, 0.15)"
							transparent
							opacity={pos === 0 ? 0.5 : 0.15}
						/>
					</line>
				);
			})}
		</group>
	);
};

// const FleetMovementTracker = ({ fleetMovement }: { fleetMovement: FleetMovement }) => {
// 	const meshRef = useRef<THREE.Group>(null);
// 	const lineRef = useRef<THREE.Line>(null);
// 	const { state } = useGame();

// 	// Determine movement type
// 	const isAllyMovement =
// 		fleetMovement.owner_id !== state.currentUser?.id && fleetMovement.mission_type === 'transport';
// 	const isHostileMovement =
// 		fleetMovement.owner_id !== state.currentUser?.id && !['transport', 'spy'].includes(fleetMovement.mission_type);

// 	// Get color based on movement type
// 	const getMovementColor = () => {
// 		if (isHostileMovement) {
// 			return 0xef4444; // Red color for hostile movements
// 		}
// 		if (isAllyMovement) {
// 			return 0x3b82f6; // Blue color for ally transports
// 		}
// 		return 0x20e0a0; // Default green color for own movements
// 	};

// 	useFrame(() => {
// 		if (meshRef.current && lineRef.current) {
// 			const now = Date.now();
// 			const startTime = fleetMovement.departure_time.toMillis();
// 			const endTime = fleetMovement.arrival_time.toMillis();
// 			const progress = Math.min(Math.max((now - startTime) / (endTime - startTime), 0), 1);

// 			// Get galaxy numbers
// 			const originGalaxy = Math.floor(fleetMovement.origin.coordinates.x / 10000);
// 			const destGalaxy = Math.floor(fleetMovement.destination.coordinates.x / 10000);
// 			const currentGalaxy = state.selectedPlanet!.position.galaxy;

// 			// Calculate which galaxy the fleet is currently in based on progress
// 			const totalGalaxies = Math.abs(destGalaxy - originGalaxy);
// 			const galaxyProgress = progress * totalGalaxies;
// 			const fleetCurrentGalaxy =
// 				originGalaxy < destGalaxy
// 					? originGalaxy + Math.floor(galaxyProgress)
// 					: originGalaxy - Math.floor(galaxyProgress);

// 			// Only show if fleet is in current galaxy view
// 			const isVisible = fleetCurrentGalaxy === currentGalaxy;

// 			if (isVisible) {
// 				// Calculate positions relative to current galaxy view
// 				let startX, endX;
// 				let localProgress = progress;

// 				if (originGalaxy !== destGalaxy) {
// 					if (currentGalaxy === originGalaxy) {
// 						// Fleet departing to the right
// 						startX = fleetMovement.origin.coordinates.x;
// 						endX = (currentGalaxy + 1) * 10000;
// 						localProgress = (progress * totalGalaxies) % 1;
// 					} else if (currentGalaxy === destGalaxy) {
// 						// Fleet arriving from the left
// 						startX = currentGalaxy * 10000 - 10000;
// 						endX = fleetMovement.destination.coordinates.x;
// 						localProgress = (progress * totalGalaxies) % 1;
// 					} else {
// 						// Fleet passing through intermediate galaxy
// 						startX = currentGalaxy * 10000 - 10000;
// 						endX = (currentGalaxy + 1) * 10000;
// 						localProgress = (progress * totalGalaxies) % 1;
// 					}
// 				} else {
// 					// Same galaxy movement
// 					startX = fleetMovement.origin.coordinates.x;
// 					endX = fleetMovement.destination.coordinates.x;
// 					localProgress = progress;
// 				}

// 				// Calculate Y position with smooth interpolation
// 				const startY = fleetMovement.origin.coordinates.y;
// 				const endY = fleetMovement.destination.coordinates.y;

// 				// Update fleet position (both marker and card)
// 				const x = THREE.MathUtils.lerp(startX, endX, localProgress);
// 				const y = THREE.MathUtils.lerp(startY, endY, progress);
// 				meshRef.current.position.set(x, y, 0);
// 				meshRef.current.visible = true;

// 				// Update line positions
// 				const linePositions = new Float32Array([startX, startY, 0, endX, endY, 0]);
// 				lineRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
// 				lineRef.current.visible = true;

// 				// Update line dash offset for animation
// 				const material = lineRef.current.material as THREE.LineDashedMaterial;
// 				material.dashOffset = -now * 0.01; // Animate dash pattern
// 			} else {
// 				meshRef.current.visible = false;
// 				lineRef.current.visible = false;
// 			}
// 		}
// 	});

// 	const movementColor = getMovementColor();

// 	return (
// 		<group>
// 			{/* Dotted line path */}
// 			<primitive object={new THREE.Line()} ref={lineRef}>
// 				<bufferGeometry />
// 				<lineDashedMaterial
// 					attach="material"
// 					color={movementColor}
// 					dashSize={50}
// 					gapSize={50}
// 					opacity={0.4}
// 					transparent
// 					linewidth={1}
// 				/>
// 			</primitive>

// 			{/* Fleet marker with info card */}
// 			<group ref={meshRef}>
// 				<mesh>
// 					<circleGeometry args={[10, 32]} />
// 					<meshBasicMaterial color={movementColor} transparent opacity={0.8} />
// 				</mesh>

// 				<Html position={[20, 0, 0]} style={{ zIndex: 40 }}>
// 					<div
// 						className={`bg-neutral-900/95 border ${
// 							isHostileMovement
// 								? 'border-red-400/30'
// 								: isAllyMovement
// 								? 'border-blue-400/30'
// 								: 'border-emerald-400/30'
// 						} px-2 py-1
//                         text-neutral-100 font-sans text-xs
//                         pointer-events-none whitespace-nowrap rounded-sm`}
// 						style={{ zIndex: 40 }}
// 					>
// 						<div className="flex flex-col gap-0.5">
// 							<span
// 								className={
// 									isHostileMovement
// 										? 'text-red-400'
// 										: isAllyMovement
// 										? 'text-blue-400'
// 										: 'text-emerald-400'
// 								}
// 							>
// 								→ {fleetMovement.destination.planet_id}
// 							</span>
// 							<span className="text-neutral-400 text-[10px]">
// 								Arrival: {utils.formatTimeString(fleetMovement.arrival_time.toMillis() - Date.now())}
// 							</span>
// 							{fleetMovement.mission_type && (
// 								<span className="text-neutral-400 text-[10px] capitalize">
// 									{fleetMovement.status === 'returning' ? 'Returning' : fleetMovement.mission_type}
// 								</span>
// 							)}
// 							{(isAllyMovement || isHostileMovement) && (
// 								<span className="text-neutral-400 text-[10px]">From: {fleetMovement.owner_name}</span>
// 							)}
// 						</div>
// 					</div>
// 				</Html>
// 			</group>
// 		</group>
// 	);
// };

const FleetMovementTracker = ({
	fleetMovement,
	galaxyFilter,
}: {
	fleetMovement: FleetMovement;
	galaxyFilter: number;
}) => {
	const meshRef = useRef<THREE.Mesh>(null);
	const lineRef = useRef<THREE.Line>(null);
	const { state } = useGame();
	const [isVisible, setIsVisible] = useState(true);

	// Determine movement type
	const isAllyMovement =
		fleetMovement.owner_id !== state.currentUser?.id && fleetMovement.mission_type === 'transport';
	const isHostileMovement =
		fleetMovement.owner_id !== state.currentUser?.id && !['transport', 'spy'].includes(fleetMovement.mission_type);

	// Get color based on movement type
	const getMovementColor = () => {
		if (isHostileMovement) {
			return 0xef4444; // Red color for hostile movements
		}
		if (isAllyMovement) {
			return 0x3b82f6; // Blue color for ally transports
		}
		return 0x20e0a0; // Default green color for own movements
	};

	// Calculate current position based on journey progress
	useFrame(() => {
		if (meshRef.current && lineRef.current) {
			// Calculate current position
			const now = Date.now();
			const startTime = fleetMovement.departure_time.toMillis();
			const endTime = fleetMovement.arrival_time.toMillis();
			const progress = Math.min(Math.max((now - startTime) / (endTime - startTime), 0), 1);
			// Determine in which galaxy the fleet currently is based on travel progress
			const originGalaxy = fleetMovement.origin.coordinates.chunk;
			const destGalaxy = fleetMovement.destination.coordinates.chunk;

			// If crossing galaxies, determine current galaxy based on progress
			let currentGalaxy;
			if (originGalaxy === destGalaxy) {
				currentGalaxy = originGalaxy;
			} else {
				// For cross-galaxy travel, determine at what point in the journey we switch galaxies
				// This assumes linear travel between galaxies
				if (progress < 0.5) {
					currentGalaxy = originGalaxy;
				} else {
					currentGalaxy = destGalaxy;
				}
			}

			// Skip rendering if not in the filtered galaxy (when filter is applied)
			if (currentGalaxy !== galaxyFilter) {
				setIsVisible(false);
				meshRef.current.visible = false;
				lineRef.current.visible = false;
				return;
			} else {
				setIsVisible(true);
				meshRef.current.visible = true;
				lineRef.current.visible = true;
			}

			// Lerp between start and end coordinates
			const x = THREE.MathUtils.lerp(
				fleetMovement.origin.coordinates.x,
				fleetMovement.destination.coordinates.x,
				progress
			);
			const y = THREE.MathUtils.lerp(
				fleetMovement.origin.coordinates.y,
				fleetMovement.destination.coordinates.y,
				progress
			);

			meshRef.current.position.set(x, y, 0);
		}
	});

	const movementColor = getMovementColor();

	if (!isVisible) return null;

	return (
		<group>
			{/* Dotted line path */}
			<primitive object={new THREE.Line()} ref={lineRef}>
				<bufferGeometry
					attach="geometry"
					attributes={{
						position: new THREE.BufferAttribute(
							new Float32Array([
								fleetMovement.origin.coordinates.x,
								fleetMovement.origin.coordinates.y,
								fleetMovement.origin.coordinates.chunk,
								fleetMovement.destination.coordinates.x,
								fleetMovement.destination.coordinates.y,
								fleetMovement.destination.coordinates.chunk,
							]),
							3
						),
					}}
				/>
				<lineDashedMaterial
					attach="material"
					color={movementColor}
					dashSize={50}
					gapSize={50}
					opacity={0.4}
					transparent
					linewidth={1}
				/>
			</primitive>

			{/* Fleet marker with info card */}
			<group ref={meshRef} position={[fleetMovement.origin.coordinates.x, fleetMovement.origin.coordinates.y, 0]}>
				<mesh>
					<circleGeometry args={[10, 32]} />
					<meshBasicMaterial color={movementColor} transparent opacity={0.8} />
				</mesh>

				<Html position={[20, 0, 0]} style={{ zIndex: 40 }}>
					<div
						className={`bg-neutral-900/95 border ${
							isHostileMovement
								? 'border-red-400/30'
								: isAllyMovement
								? 'border-blue-400/30'
								: 'border-emerald-400/30'
						} px-2 py-1 
                        text-neutral-100 font-sans text-xs 
                        pointer-events-none whitespace-nowrap rounded-sm`}
						style={{ zIndex: 40 }}
					>
						<div className="flex flex-col gap-0.5">
							<span
								className={
									isHostileMovement
										? 'text-red-400'
										: isAllyMovement
										? 'text-blue-400'
										: 'text-emerald-400'
								}
							>
								→ {fleetMovement.destination.planet_name}
							</span>
							<span className="text-neutral-400 text-[10px]">
								Arrival: {utils.formatTimeString(fleetMovement.arrival_time.toMillis() - Date.now())}
							</span>
							{fleetMovement.mission_type && (
								<span className="text-neutral-400 text-[10px] capitalize">
									{fleetMovement.status === 'returning' ? 'Returning' : fleetMovement.mission_type}
								</span>
							)}
							{(isAllyMovement || isHostileMovement) && (
								<span className="text-neutral-400 text-[10px]">From: {fleetMovement.owner_name}</span>
							)}
						</div>
					</div>
				</Html>
			</group>
		</group>
	);
};

const StarryBackground = () => {
	// Memoize the stars array so it doesn't regenerate on every render
	const stars = useMemo(() => {
		const starsArray = [];
		const numStars = 2000;

		for (let i = 0; i < numStars; i++) {
			const x = (Math.random() - 0.5) * 12000;
			const y = (Math.random() - 0.5) * 12000;
			const size = Math.random() * 2 + 1; // Increased size range: 1 to 3
			const opacity = Math.random() * 0.6 + 0.4; // Increased opacity range: 0.4 to 1.0

			starsArray.push({ position: [x, y, -100], size, opacity });
		}
		return starsArray;
	}, []); // Empty dependency array ensures stars are generated only once

	return (
		<group>
			{stars.map((star, i) => (
				<mesh key={i} position={star.position as [number, number, number]}>
					<circleGeometry args={[star.size, 32]} />
					<meshBasicMaterial color={0xffffff} transparent opacity={star.opacity} depthWrite={false} />
				</mesh>
			))}
		</group>
	);
};

const TradingOutpostMarker = ({ position }: { position: [number, number, number] }) => {
	const meshRef = useRef<THREE.Group>(null);
	const glowRef = useRef<THREE.Mesh>(null);

	useFrame((state) => {
		if (meshRef.current) {
			// Gentle floating animation
			meshRef.current.position.y += Math.sin(state.clock.elapsedTime) * 0.01;
			meshRef.current.rotation.z += 0.005;
		}
		if (glowRef.current) {
			// Pulse effect for the glow
			const glowScale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
			glowRef.current.scale.set(glowScale, glowScale, 1);
		}
	});

	return (
		<group position={position}>
			{/* Base glow effect */}
			<mesh ref={glowRef}>
				<ringGeometry args={[15, 25, 6]} />
				<meshBasicMaterial
					color={0x4f46e5} // Indigo color
					transparent
					opacity={0.3}
					blending={THREE.AdditiveBlending}
				/>
			</mesh>

			{/* Main structure group */}
			<group ref={meshRef}>
				{/* Central hexagon */}
				<mesh>
					<ringGeometry args={[8, 12, 6]} />
					<meshBasicMaterial color={0x818cf8} /> {/* Lighter indigo */}
				</mesh>

				{/* Outer ring */}
				<mesh>
					<ringGeometry args={[15, 16, 6]} />
					<meshBasicMaterial color={0x818cf8} />
				</mesh>

				{/* Connecting lines */}
				{Array.from({ length: 6 }).map((_, i) => {
					const angle = (i * Math.PI * 2) / 6;
					return (
						<line key={i}>
							<bufferGeometry
								attach="geometry"
								attributes={{
									position: new THREE.BufferAttribute(
										new Float32Array([
											Math.cos(angle) * 12,
											Math.sin(angle) * 12,
											0,
											Math.cos(angle) * 15,
											Math.sin(angle) * 15,
											0,
										]),
										3
									),
								}}
							/>
							<lineBasicMaterial color={0x818cf8} />
						</line>
					);
				})}
			</group>

			{/* Label */}
			<Html position={[0, 25, 0]}>
				<div className="text-indigo-400 text-sm font-bold whitespace-nowrap">Trading Outpost</div>
			</Html>
		</group>
	);
};

interface GalaxyMapProps {
	mode: 'view-only' | 'mission-target' | 'homeworld';
	onPlanetSelect?: (planet: Planet) => void;
	allowedPlanets?: string[];
	highlightedPlanets?: string[];
	focusedPlanet?: Planet | null;
	galaxyFilter?: number;
}

export const GalaxyMap = ({
	mode = 'view-only',
	onPlanetSelect,
	allowedPlanets = [],
	highlightedPlanets = [],
	focusedPlanet = null,
	galaxyFilter = 0,
}: GalaxyMapProps) => {
	const { state } = useGame();
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const controlsRef = useRef(null);
	const [planets, setPlanets] = useState<Planet[]>([]);
	const [animating, setAnimating] = useState(false);
	const [openCards, setOpenCards] = useState<Set<string>>(new Set());
	const [debrisFields] = useCollectionData(
		state.gameConfig
			? collection(db, `seasons/${state.gameConfig.season.current}/debris_fields`).withConverter(withIdConverter)
			: null
	);
	const [tradingOutposts] = useCollectionData(
		state.currentUser?.id && state.gameConfig
			? query(
					collection(db, `seasons/${state.gameConfig.season.current}/trading_outposts`).withConverter(
						withIdConverter
					),
					where('owner_id', '==', state.currentUser?.id)
			  )
			: null
	);
	const [fleetMovements] = useCollectionData(
		state.currentUser?.id && state.gameConfig
			? query(
					collection(db, `seasons/${state.gameConfig.season.current}/fleet_movements`).withConverter(
						withIdConverter
					),
					where('owner_id', '==', state.currentUser?.id)
			  )
			: null
	);
	const [anomalies] = useCollectionData(
		state.currentUser?.id && state.gameConfig
			? query(
					collection(db, `seasons/${state.gameConfig.season.current}/anomalies`).withConverter(
						withIdConverter
					)
			  )
			: null
	);
	const [hostileFleetMovements] = useCollectionData(
		state.currentUser?.id && state.gameConfig
			? query(
					collection(db, `seasons/${state.gameConfig.season.current}/fleet_movements`),
					where('destination.planet_id', 'array-contains', state.userPlanets?.map((p) => p.id) || [])
			  ).withConverter(withIdConverter)
			: null
	);

	useEffect(() => {
		const getPlanets = async () => {
			const data = await api.getPlanets('all');
			setPlanets(data.planets);
		};

		getPlanets();
	}, [galaxyFilter]);

	// Add effect to handle focused planet changes
	useEffect(() => {
		if (!focusedPlanet || !controlsRef.current || animating) return;

		const controls = controlsRef.current as any;
		const camera = controls.object as THREE.OrthographicCamera;
		setAnimating(true);

		// Calculate target zoom
		const targetZoom = 0.5;
		const startZoom = controls.zoom;

		// Get current camera position
		const startPosition = new THREE.Vector3();
		camera.getWorldPosition(startPosition);

		// Calculate target position (centered on focused planet)
		const targetPosition = new THREE.Vector3(focusedPlanet.position.x, focusedPlanet.position.y, camera.position.z);

		const duration = 1000;
		const startTime = Date.now();

		const animate = () => {
			const elapsed = Date.now() - startTime;
			const progress = Math.min(elapsed / duration, 1);

			// Easing function (cubic ease-out)
			const easing = 1 - Math.pow(1 - progress, 3);

			// Update camera position and zoom
			controls.zoom = startZoom + (targetZoom - startZoom) * easing;

			camera.position.lerpVectors(startPosition, targetPosition, easing);
			controls.target.set(focusedPlanet.position.x, focusedPlanet.position.y, 0);

			controls.update();

			if (progress < 1) {
				requestAnimationFrame(animate);
			} else {
				setAnimating(false);
			}
		};

		animate();
	}, [focusedPlanet, animating]);

	const handleCanvasClick = (event: any) => {
		if (event.target.tagName === 'CANVAS') {
			setOpenCards(new Set()); // Clear all open cards
		}
	};

	return (
		<div className="relative w-full h-full">
			<OpenCardsContext.Provider value={{ openCards, setOpenCards }}>
				<Canvas
					ref={canvasRef}
					className="relative"
					orthographic
					camera={{
						position: [0, 0, 1000],
						zoom: 0.1,
						up: [0, 1, 0],
						far: 10000,
					}}
					style={{ width: '100%', height: '100%' }}
					onPointerDown={handleCanvasClick}
				>
					<StarryBackground />
					<GridSystem />

					{/* Add Trading Outposts */}
					{tradingOutposts?.map((outpost, index) => (
						<TradingOutpostMarker
							key={`outpost-${index}`}
							position={[outpost.position.x, outpost.position.y, 0]}
						/>
					))}

					{/* Add Anomalies */}
					{anomalies?.map((anomaly, index) => (
						<AnomalyMarker
							key={`anomaly-${index}`}
							position={[anomaly.position.x, anomaly.position.y, 0]}
						/>
					))}

					{/* Add debris fields before planets */}
					{debrisFields?.map((debrisField) => (
						<DebrisFieldEffect key={debrisField.id} debrisField={debrisField} />
					))}

					{/* Fleet movements */}
					{fleetMovements &&
						fleetMovements.length &&
						_.concat(fleetMovements, hostileFleetMovements).map((fleetMovement) => (
							<FleetMovementTracker
								key={fleetMovement.id}
								fleetMovement={fleetMovement}
								galaxyFilter={galaxyFilter}
							/>
						))}

					{planets.map((planet) => (
						<PlanetObject
							key={planet.id}
							planet={planet}
							isHighlighted={highlightedPlanets.includes(planet.id)}
							isSelectable={mode === 'view-only' || allowedPlanets.includes(planet.id)}
							onSelect={() => onPlanetSelect?.(planet)}
							mode={mode}
						/>
					))}
					<OrbitControls
						ref={controlsRef}
						enableRotate={false}
						enablePan={!animating}
						enableZoom={!animating}
						maxZoom={2}
						minZoom={0.05}
						screenSpacePanning={true}
						mouseButtons={{
							LEFT: THREE.MOUSE.PAN,
							MIDDLE: THREE.MOUSE.DOLLY,
							RIGHT: THREE.MOUSE.ROTATE,
						}}
						touches={{
							ONE: THREE.TOUCH.PAN,
							TWO: THREE.TOUCH.DOLLY_PAN,
						}}
						zoomSpeed={0.5}
					/>
				</Canvas>
			</OpenCardsContext.Provider>
		</div>
	);
};

export default GalaxyMap;
