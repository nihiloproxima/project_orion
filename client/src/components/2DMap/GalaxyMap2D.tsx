import { useEffect, useState, Fragment, memo } from 'react';
import { Stage, Layer, Rect, Circle, Text, Group } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { Planet } from 'shared-types';
import { api } from '@/lib/api';
import { useGame } from '@/contexts/GameContext';

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
	}: {
		planet: Planet;
		index: number;
		isSelected: boolean;
		isHovered: boolean;
		onClick: () => void;
		onMouseEnter: () => void;
		onMouseLeave: () => void;
		isDiscovered: boolean;
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
					stroke={isSelected || isHovered ? '#ffffff' : 'transparent'} // Stroke for hover/selection
					strokeWidth={1.5} // Slightly thicker stroke
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
const InfoCardComponent = ({ planet }: { planet: Planet }) => {
	const cardWidth = 150;
	const cardHeight = 100;
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
		</Group>
	);
};

const GalaxyMap2D = () => {
	const { state } = useGame();

	const [planets, setPlanets] = useState<Planet[]>([]);

	const [scale, setScale] = useState(1);
	const [position, setPosition] = useState({ x: 0, y: 0 });
	const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
	const [hoveredPlanet, setHoveredPlanet] = useState<Planet | null>(null);
	// const [fleetMovements] = useCollectionData(
	// 	state.currentUser?.id && state.gameConfig
	// 		? query(
	// 				collection(db, `seasons/${state.gameConfig.season.current}/fleet_movements`).withConverter(
	// 					withIdConverter
	// 				),
	// 				where('owner_id', '==', state.currentUser?.id)
	// 		  )
	// 		: null
	// );
	// const [hostileFleetMovements] = useCollectionData(
	// 	state.currentUser?.id && state.gameConfig
	// 		? query(
	// 				collection(db, `seasons/${state.gameConfig.season.current}/fleet_movements`),
	// 				where('destination.planet_id', 'array-contains', state.userPlanets?.map((p) => p.id) || [])
	// 		  ).withConverter(withIdConverter)
	// 		: null
	// );

	useEffect(() => {
		const getPlanets = async () => {
			const data = await api.getPlanets('all');
			setPlanets(data.planets);
		};

		getPlanets();
	}, [state.currentUser?.discovered_chunks]);

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
						/>
					);
				})}

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
