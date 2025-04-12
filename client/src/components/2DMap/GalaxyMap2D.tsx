import { useEffect, useState, Fragment, memo } from 'react';
import { Stage, Layer, Rect, Circle, Text, Group, Line } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { Planet, FleetMovement } from 'shared-types';
import { api } from '@/lib/api';
import { useGame } from '@/contexts/GameContext';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, query, where } from 'firebase/firestore';
import { db, withIdConverter } from '@/lib/firebase';
import utils from '@/lib/utils';

// Planet component (Memoized and Simplified)
const PlanetComponent = memo(
	({
		planet,
		index,
		isSelected,
		isHovered,
		onClick,
		onMouseEnter,
		onMouseLeave,
		isDiscovered,
		isHighlighted,
	}: {
		planet: Planet;
		index: number;
		isSelected: boolean;
		isHovered: boolean;
		onClick: () => void;
		onMouseEnter: () => void;
		onMouseLeave: () => void;
		isDiscovered: boolean;
		isHighlighted?: boolean;
	}) => {
		// Only render planets in discovered chunks
		if (!isDiscovered) return null;

		return (
			<Fragment key={`planet-${index}`}>
				{/* Simplified Planet Circle - Handles visuals and clicks */}
				<Circle
					x={planet.position.x}
					y={planet.position.y}
					zIndex={100}
					radius={planet.radius}
					fill={planet.biome === 'desert' ? '#d2b48c' : planet.biome === 'ice' ? '#add8e6' : '#4caf50'}
					stroke={isHighlighted ? '#ffff00' : isSelected || isHovered ? '#ffffff' : 'transparent'} // Stroke for hover/selection/highlight
					strokeWidth={isHighlighted ? 2 : 1.5} // Slightly thicker stroke for highlighted planets
					opacity={1} // Make sure it's fully visible
					name="planet-circle" // Name for click detection
					onClick={onClick}
					onMouseEnter={onMouseEnter}
					onMouseLeave={onMouseLeave}
					listening={true} // Enable interaction
					perfectDrawEnabled={false} // Optimization for shapes
				/>

				{/* Planet name */}
				<Text
					x={planet.position.x}
					y={planet.position.y - planet.radius - 15} // Position above the circle
					text={planet.name}
					fontSize={10}
					zIndex={100}
					fill="#ffffff"
					align="center"
					width={60}
					offsetX={30} // Center the text horizontally (width/2)
					listening={false} // Text doesn't need to capture events
					perfectDrawEnabled={false} // Optimization for text
				/>

				{/* Render InfoCard ONLY when selected */}
				{isSelected && <InfoCardComponent planet={planet} />}
			</Fragment>
		);
	}
);

// Add display name to the component
PlanetComponent.displayName = 'PlanetComponent';

// InfoCard component (remains the same for now)
const InfoCardComponent = ({ planet, onSelect }: { planet: Planet; onSelect?: () => void }) => {
	const cardWidth = 150;
	const cardHeight = onSelect ? 120 : 100; // Increase height if we have a select button
	const cardX = planet.position.x + planet.radius + 10;
	const cardY = planet.position.y - cardHeight / 2;

	return (
		<Group name="info-card" listening={true}>
			<Rect
				zIndex={1000}
				x={cardX}
				y={cardY}
				width={cardWidth}
				height={cardHeight}
				fill="#1a2a3a"
				stroke="#00ff00"
				strokeWidth={1}
				cornerRadius={5}
				opacity={5}
				name="info-card"
				listening={true}
				perfectDrawEnabled={false} // Optimization
			/>
			<Text
				x={cardX + 10}
				y={cardY + 10}
				text={`Name: ${planet.name}`}
				fontSize={12}
				fill="#ffffff"
				name="info-card-text"
				listening={true}
				perfectDrawEnabled={false} // Optimization
			/>
			<Text
				x={cardX + 10}
				y={cardY + 30}
				text={`Biome: ${planet.biome}`}
				fontSize={12}
				fill="#ffffff"
				name="info-card-text"
				listening={true}
				perfectDrawEnabled={false} // Optimization
			/>
			<Text
				x={cardX + 10}
				y={cardY + 50}
				text={`Size: ${planet.radius.toFixed(1)}`}
				fontSize={12}
				fill="#ffffff"
				name="info-card-text"
				listening={true}
				perfectDrawEnabled={false} // Optimization
			/>
			<Text
				x={cardX + 10}
				y={cardY + 70}
				text={`Status: ${planet.owner_id ? 'Colonized' : 'Unclaimed'}`}
				fontSize={12}
				fill={planet.owner_id ? '#00ff00' : '#ff9900'}
				name="info-card-text"
				listening={true}
				perfectDrawEnabled={false} // Optimization
			/>

			{/* Select button for mission-target mode */}
			{onSelect && (
				<Group name="select-button" x={cardX + cardWidth / 2 - 40} y={cardY + 95}>
					<Rect
						width={80}
						height={20}
						fill="#00aa44"
						cornerRadius={3}
						name="select-button-rect"
						onClick={onSelect}
						listening={true}
						perfectDrawEnabled={false}
					/>
					<Text
						text="Select Target"
						fontSize={10}
						fill="#ffffff"
						width={80}
						align="center"
						y={5}
						name="select-button-text"
						onClick={onSelect}
						listening={true}
						perfectDrawEnabled={false}
					/>
				</Group>
			)}
		</Group>
	);
};

// Fleet Movement Tracker Component
const FleetMovementTracker = ({ fleetMovement }: { fleetMovement: FleetMovement }) => {
	const { state } = useGame();
	const [position, setPosition] = useState({ x: 0, y: 0 });

	// Determine movement type
	const isAllyMovement =
		fleetMovement.owner_id !== state.currentUser?.id && fleetMovement.mission_type === 'transport';
	const isHostileMovement =
		fleetMovement.owner_id !== state.currentUser?.id && !['transport', 'spy'].includes(fleetMovement.mission_type);

	// Get color based on movement type
	const getMovementColor = () => {
		if (isHostileMovement) {
			return '#ef4444'; // Red color for hostile movements
		}
		if (isAllyMovement) {
			return '#3b82f6'; // Blue color for ally transports
		}
		return '#20e0a0'; // Default green color for own movements
	};

	// Calculate current position based on journey progress
	useEffect(() => {
		const updatePosition = () => {
			// Calculate current position
			const now = Date.now();
			const startTime = fleetMovement.departure_time.toMillis();
			const endTime = fleetMovement.arrival_time.toMillis();
			const progress = Math.min(Math.max((now - startTime) / (endTime - startTime), 0), 1);

			// Lerp between start and end coordinates
			const x =
				fleetMovement.origin.coordinates.x +
				(fleetMovement.destination.coordinates.x - fleetMovement.origin.coordinates.x) * progress;
			const y =
				fleetMovement.origin.coordinates.y +
				(fleetMovement.destination.coordinates.y - fleetMovement.origin.coordinates.y) * progress;

			setPosition({ x, y });
		};

		// Initial update
		updatePosition();

		// Set up interval for continuous updates
		const intervalId = setInterval(updatePosition, 1000);

		// Clean up interval on unmount
		return () => clearInterval(intervalId);
	}, [fleetMovement]);

	const movementColor = getMovementColor();

	return (
		<Group>
			{/* Dotted line path */}
			<Line
				points={[
					fleetMovement.origin.coordinates.x,
					fleetMovement.origin.coordinates.y,
					fleetMovement.destination.coordinates.x,
					fleetMovement.destination.coordinates.y,
				]}
				stroke={movementColor}
				strokeWidth={1}
				dash={[5, 5]}
				opacity={0.4}
				perfectDrawEnabled={false}
			/>

			{/* Fleet marker */}
			<Group x={position.x} y={position.y}>
				<Circle radius={5} fill={movementColor} opacity={0.8} perfectDrawEnabled={false} />

				{/* Info card */}
				<Group x={10} y={-30}>
					<Rect
						width={120}
						height={60}
						fill="#1a1a1a"
						opacity={0.9}
						stroke={movementColor}
						strokeWidth={1}
						cornerRadius={3}
						perfectDrawEnabled={false}
					/>
					<Text
						x={5}
						y={5}
						text={`→ ${fleetMovement.destination.planet_name}`}
						fontSize={10}
						fill={movementColor}
						width={110}
						perfectDrawEnabled={false}
					/>
					<Text
						x={5}
						y={20}
						text={`Arrival: ${utils.formatTimeString(fleetMovement.arrival_time.toMillis() - Date.now())}`}
						fontSize={8}
						fill="#cccccc"
						width={110}
						perfectDrawEnabled={false}
					/>
					<Text
						x={5}
						y={35}
						text={fleetMovement.status === 'returning' ? 'Returning' : fleetMovement.mission_type}
						fontSize={8}
						fill="#cccccc"
						width={110}
						perfectDrawEnabled={false}
					/>
					{(isAllyMovement || isHostileMovement) && (
						<Text
							x={5}
							y={50}
							text={`From: ${fleetMovement.owner_name}`}
							fontSize={8}
							fill="#cccccc"
							width={110}
							perfectDrawEnabled={false}
						/>
					)}
				</Group>
			</Group>
		</Group>
	);
};

interface GalaxyMapProps {
	mode: 'view-only' | 'mission-target';
	onPlanetSelect?: (planet: Planet) => void;
	allowedPlanets?: string[];
	highlightedPlanets?: string[];
	focusedPlanet?: Planet | null;
}

const GalaxyMap2D = ({
	mode = 'view-only',
	onPlanetSelect,
	allowedPlanets,
	highlightedPlanets,
	focusedPlanet = null,
}: GalaxyMapProps) => {
	const { state } = useGame();

	const [planets, setPlanets] = useState<Planet[]>([]);

	const [scale, setScale] = useState(1);
	const [position, setPosition] = useState({ x: 0, y: 0 });
	const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
	const [hoveredPlanet, setHoveredPlanet] = useState<Planet | null>(null);
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
			// Adapt fetching strategy based on mode
			const data = await api.getPlanets('all');
			setPlanets(data.planets);
		};

		getPlanets();
	}, [state.currentUser?.discovered_chunks]);

	// Focus on a specific planet if provided
	useEffect(() => {
		if (focusedPlanet) {
			// Center the view on the focused planet
			setPosition({
				x: window.innerWidth / 2 - focusedPlanet.position.x * scale,
				y: window.innerHeight / 2 - focusedPlanet.position.y * scale,
			});

			// Optionally select the focused planet
			setSelectedPlanet(focusedPlanet);
		}
	}, [focusedPlanet, scale]);

	const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
		e.evt.preventDefault();

		const scaleBy = 1.1;
		const stage = e.target.getStage();
		const oldScale = scale;

		// Calculate new scale based on wheel direction
		let newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;

		// Prevent zooming out too much - set minimum scale to 0.3
		const MIN_SCALE = 1;
		if (newScale < MIN_SCALE) {
			newScale = MIN_SCALE;
		}

		// If we're already at minimum scale and trying to zoom out further, just return
		if (oldScale === MIN_SCALE && e.evt.deltaY > 0) {
			return;
		}

		// Get pointer position relative to the stage
		const pointerPosition = stage?.getPointerPosition() || { x: 0, y: 0 };

		// Calculate new position based on pointer position
		const mousePointTo = {
			x: (pointerPosition.x - position.x) / oldScale,
			y: (pointerPosition.y - position.y) / oldScale,
		};

		// Update position to zoom toward mouse position
		const newPosition = {
			x: pointerPosition.x - mousePointTo.x * newScale,
			y: pointerPosition.y - mousePointTo.y * newScale,
		};

		setScale(newScale);
		setPosition(newPosition);
	};

	const handleDragStart = () => {
		// We don't need to track dragging state since Konva handles it internally
	};

	const handleDragEnd = () => {
		// Just a cleanup function for when dragging ends
	};

	const handleDragMove = (e: KonvaEventObject<DragEvent>) => {
		setPosition({
			x: e.target.x(),
			y: e.target.y(),
		});
	};

	const handlePlanetClick = (planet: Planet) => {
		setSelectedPlanet((currentSelected) => (currentSelected === planet ? null : planet));
	};

	const handleStageClick = (e: KonvaEventObject<MouseEvent>) => {
		const target = e.target;
		// Check if the click originated on the stage itself (background)
		if (target === e.target.getStage()) {
			setSelectedPlanet(null);
			return;
		}

		// Check if click was on an interactive part of the info card or planet
		const isPlanetClicked = target.hasName('planet-circle');
		const isInfoCardClicked = target.hasName('info-card') || target.hasName('info-card-text');
		const isSelectButtonClicked = target.hasName('select-button-rect') || target.hasName('select-button-text');

		// If select button was clicked, don't deselect the planet
		if (isSelectButtonClicked) {
			return;
		}

		// If the click is not on a planet or the info card, deselect
		if (!isPlanetClicked && !isInfoCardClicked) {
			setSelectedPlanet(null);
		}
	};

	const handlePlanetMouseEnter = (planet: Planet) => {
		setHoveredPlanet(planet);
		// Improve cursor style on hover
		const stage = document.querySelector('canvas')?.closest('.konvajs-content');
		if (stage) (stage as HTMLElement).style.cursor = 'pointer';
	};

	const handlePlanetMouseLeave = () => {
		setHoveredPlanet(null);
		// Reset cursor style
		const stage = document.querySelector('canvas')?.closest('.konvajs-content');
		if (stage) (stage as HTMLElement).style.cursor = 'default';
	};

	// Helper function to check if a chunk is discovered
	const isChunkDiscovered = (chunkId: number) => {
		return state.currentUser?.discovered_chunks.includes(chunkId);
	};

	// Handle planet selection for mission target
	const handleSelectPlanet = (planet: Planet) => {
		if (mode === 'mission-target' && onPlanetSelect) {
			onPlanetSelect(planet);
		}
	};

	return (
		<Stage
			width={window.innerWidth}
			height={window.innerHeight}
			onWheel={handleWheel}
			draggable={true}
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
			onDragMove={handleDragMove}
			x={position.x}
			y={position.y}
			scale={{ x: scale, y: scale }}
			style={{ background: '#050A1F' }}
			onClick={handleStageClick}
		>
			<Layer perfectDrawEnabled={false}>
				{/* Grid of 10x10 chunks with discovery status */}
				{Array.from({ length: 10 }).map((_, i) =>
					Array.from({ length: 10 }).map((_, j) => {
						const chunkId = j * 10 + i;
						const isDiscovered = isChunkDiscovered(chunkId);
						return (
							<Rect
								key={`grid-${i}-${j}`}
								x={i * 100}
								y={j * 100}
								width={100}
								height={100}
								stroke={isDiscovered ? '#00ff00' : '#223355'}
								strokeWidth={isDiscovered ? 1 : 0.5}
								fill={isDiscovered ? 'transparent' : 'rgba(0, 0, 0, 0.5)'}
								opacity={isDiscovered ? 0.3 : 0.7}
								listening={false}
								perfectDrawEnabled={false}
							/>
						);
					})
				)}

				{/* Planets - only show in discovered chunks */}
				{planets.map((planet, index) => {
					const isPlanetDiscovered = isChunkDiscovered(planet.position.chunk);
					if (!isPlanetDiscovered) return null;

					// Check if this planet is highlighted
					const isHighlighted = highlightedPlanets?.includes(planet.id);

					// In mission-target mode, check if this planet is allowed
					const isAllowed =
						mode === 'mission-target' ? !allowedPlanets || allowedPlanets.includes(planet.id) : true;

					if (!isAllowed) return null;

					return (
						<PlanetComponent
							key={`planet-${index}`}
							planet={planet}
							index={index}
							isHovered={hoveredPlanet === planet}
							isSelected={selectedPlanet === planet}
							onClick={() => handlePlanetClick(planet)}
							onMouseEnter={() => handlePlanetMouseEnter(planet)}
							onMouseLeave={handlePlanetMouseLeave}
							isDiscovered={isPlanetDiscovered}
							isHighlighted={isHighlighted}
						/>
					);
				})}

				{/* Selected Planet Info Card with Select Button in mission-target mode */}
				{selectedPlanet && (
					<InfoCardComponent
						planet={selectedPlanet}
						onSelect={
							mode === 'mission-target' && onPlanetSelect
								? () => handleSelectPlanet(selectedPlanet)
								: undefined
						}
					/>
				)}

				{/* Fleet Movements */}
				{fleetMovements?.map((movement) => (
					<FleetMovementTracker key={movement.id} fleetMovement={movement} />
				))}

				{/* Hostile Fleet Movements */}
				{hostileFleetMovements?.map((movement) => (
					<FleetMovementTracker key={movement.id} fleetMovement={movement} />
				))}

				{/* Radar-like circular overlay - fixed at center of canvas (500, 500) */}
				<Circle
					x={500}
					y={500}
					radius={Math.min(window.innerWidth, window.innerHeight) / 2 - 20}
					stroke="#00ff00"
					strokeWidth={1}
					dash={[2, 5]}
					opacity={0.7}
					listening={false}
					perfectDrawEnabled={false}
				/>
				<Circle
					x={500}
					y={500}
					radius={Math.min(window.innerWidth, window.innerHeight) / 3}
					stroke="#00ff00"
					strokeWidth={0.5}
					dash={[2, 5]}
					opacity={0.7}
					listening={false}
					perfectDrawEnabled={false}
				/>
				<Circle
					x={500}
					y={500}
					radius={Math.min(window.innerWidth, window.innerHeight) / 6}
					stroke="#00ff00"
					strokeWidth={0.5}
					dash={[2, 5]}
					opacity={0.7}
					listening={false}
					perfectDrawEnabled={false}
				/>
			</Layer>
		</Stage>
	);
};

export default GalaxyMap2D;
