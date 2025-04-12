'use client';

import { useEffect, useState } from 'react';
import { MissionType, Planet, ShipType } from 'shared-types';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGame } from '@/contexts/GameContext';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Clock, Rocket, Target } from 'lucide-react';
import { api } from '@/lib/api';
import { GalaxyMap } from '@/components/ThreeMap/GalaxyMap';
import fleetCalculations from '@/utils/fleet_calculations';
import utils from '@/lib/utils';
import { Input } from '@/components/ui/input';
import GalaxyMap2D from '../2DMap/GalaxyMap2D';

type MissionSetupViewProps = {
	shipSelections: Record<ShipType, number>;
	onBack: () => void;
};

export const MissionSetupView = ({ shipSelections, onBack }: MissionSetupViewProps) => {
	const { t: commonT } = useTranslation('');
	const { t } = useTranslation('fleet');
	const { state } = useGame();
	const { toast } = useToast();
	const [selectedMission, setSelectedMission] = useState<MissionType | ''>('');
	const [selectedTarget, setSelectedTarget] = useState<Planet | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [allowedPlanets, setAllowedPlanets] = useState<string[]>([]);
	const [arrivalTime, setArrivalTime] = useState<{ arrivalTime: Date; travelTimeSeconds: number } | null>(null);
	const [resources, setResources] = useState({
		metal: 0,
		deuterium: 0,
		microchips: 0,
	});

	// Calculate total cargo capacity from all selected ships
	const totalCargoCapacity = Object.entries(shipSelections).reduce((total, [type, count]) => {
		const shipConfig = state.gameConfig?.ships.find((s) => s.type === type);
		return total + (shipConfig?.capacity || 0) * count;
	}, 0);
	const totalResourcesSelected = resources.metal + resources.deuterium + resources.microchips;

	useEffect(() => {
		if (!selectedMission) return;

		const fetchAllowedPlanets = async () => {
			const response = await api.getPlanets(selectedMission as MissionType);
			setAllowedPlanets(response.planets.map((planet: Planet) => planet.id));
		};

		fetchAllowedPlanets();
	}, [selectedMission]);

	useEffect(() => {
		if (!selectedTarget || !state.selectedPlanet || !state.gameConfig) return;

		const { arrivalTime, travelTimeSeconds } = fleetCalculations.calculateFleetArrivalTime(
			state.gameConfig,
			shipSelections,
			state.selectedPlanet.position,
			selectedTarget.position
		);

		setArrivalTime({
			arrivalTime: new Date(arrivalTime.toMillis()),
			travelTimeSeconds,
		});
	}, [selectedTarget, shipSelections, state.selectedPlanet, state.gameConfig]);

	// Get common available missions between all ship types
	const availableMissions = Array.from(
		new Set(
			Object.entries(shipSelections).flatMap(([type]): MissionType[] => {
				const missionsByType = {
					battleship: ['attack', 'move'] as MissionType[],
					cruiser: ['attack', 'move'] as MissionType[],
					destroyer: ['attack', 'move'] as MissionType[],
					interceptor: ['attack', 'move'] as MissionType[],
					transporter: ['transport', 'move'] as MissionType[],
					colonizer: ['colonize', 'move'] as MissionType[],
					spy_probe: ['spy', 'move'] as MissionType[],
					recycler: ['recycle', 'expedition', 'move'] as MissionType[],
				} as const;

				return (missionsByType as any)[type] || ['move'];
			})
		)
	);

	const handleResourceChange = (resource: 'metal' | 'deuterium' | 'microchips', value: string) => {
		const numValue = Math.max(0, parseInt(value) || 0);
		const otherResources = Object.entries(resources)
			.filter(([key]) => key !== resource)
			.reduce((sum, [, val]) => sum + val, 0);

		// Ensure we don't exceed cargo capacity
		const maxAllowed = totalCargoCapacity - otherResources;
		const finalValue = Math.min(numValue, maxAllowed);

		setResources((prev) => ({
			...prev,
			[resource]: finalValue,
		}));
	};

	const handleStartMission = async () => {
		if (!selectedMission || !selectedTarget || !state.selectedPlanet) return;

		setIsLoading(true);
		try {
			// Start mission with ship types and counts
			await api.startMission({
				ships_selection: shipSelections,
				mission_type: selectedMission,
				destination_planet_id: selectedTarget.id,
				origin_planet_id: state.selectedPlanet.id,
				resources: resources,
			});

			toast({
				title: t('mission_setup.success.title'),
				description: t('mission_setup.success.mission_started'),
			});
			onBack();
		} catch (error) {
			toast({
				title: t('mission_setup.error.title'),
				description: t('mission_setup.error.mission_failed') + ' ' + error,
				variant: 'destructive',
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button variant="ghost" onClick={onBack} className="gap-2">
						<ArrowLeft className="h-4 w-4" />
						{commonT('back')}
					</Button>
					<h2 className="text-xl font-bold">{t('mission_setup.title')}</h2>
				</div>
			</div>

			{/* Ships Info Card */}
			<Card className="p-4">
				<div className="space-y-4">
					{Object.entries(shipSelections).map(([type, count]) => (
						<div key={type} className="grid grid-cols-3 gap-4">
							<div className="flex items-center gap-2">
								<Rocket className="h-4 w-4 text-primary" />
								<div className="text-sm">
									<div className="font-medium">{type}</div>
									<div>Count: {count}</div>
								</div>
							</div>

							<div className="flex items-center gap-2">
								<Target className="h-4 w-4 text-primary" />
								<div className="text-sm">
									<div className="font-medium">{t('ship.stats.range')}</div>
									<div>
										{state.gameConfig?.ships.find((s) => s.type === type)?.speed ?? 0 * 10}{' '}
										{t('units.light_years')}
									</div>
								</div>
							</div>

							<div className="flex items-center gap-2">
								<div className="text-sm">
									<div className="font-medium">Cargo Capacity</div>
									<div>
										{(state.gameConfig?.ships.find((s) => s.type === type)?.capacity || 0) * count}
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			</Card>

			{/* Resources Selection */}
			{['move', 'transport'].includes(selectedMission) && (
				<Card className="p-4">
					<div className="space-y-4">
						<div className="flex justify-between items-center">
							<h3 className="font-medium">Resources to Send</h3>
							<div className="text-sm text-muted-foreground">
								{totalResourcesSelected} / {totalCargoCapacity}
							</div>
						</div>

						<div className="grid grid-cols-3 gap-4">
							<div>
								<label className="text-sm font-medium">Metal</label>
								<Input
									type="number"
									value={resources.metal}
									onChange={(e) => handleResourceChange('metal', e.target.value)}
									min="0"
									max={totalCargoCapacity}
								/>
							</div>
							<div>
								<label className="text-sm font-medium">Deuterium</label>
								<Input
									type="number"
									value={resources.deuterium}
									onChange={(e) => handleResourceChange('deuterium', e.target.value)}
									min="0"
									max={totalCargoCapacity}
								/>
							</div>
							<div>
								<label className="text-sm font-medium">Microchips</label>
								<Input
									type="number"
									value={resources.microchips}
									onChange={(e) => handleResourceChange('microchips', e.target.value)}
									min="0"
									max={totalCargoCapacity}
								/>
							</div>
						</div>
					</div>
				</Card>
			)}

			{/* Mission Selection */}
			<Card className="p-4">
				<div className="space-y-4">
					<h3 className="font-medium">{t('mission_setup.select_mission')}</h3>
					<Select
						value={selectedMission}
						onValueChange={(value: MissionType) => {
							setSelectedMission(value);
							setSelectedTarget(null); // Reset target when mission changes
						}}
					>
						<SelectTrigger>
							<SelectValue placeholder={t('mission_setup.mission_placeholder')} />
						</SelectTrigger>
						<SelectContent>
							{availableMissions.map((mission) => (
								<SelectItem key={mission as string} value={mission as string}>
									{t(`mission_setup.types.${mission}`)}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</Card>

			{/* Galaxy Map */}
			{selectedMission && (
				<Card className="p-4">
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h3 className="font-medium">{t('mission_setup.select_target')}</h3>
						</div>
						<div className="h-[400px] relative border rounded-lg overflow-hidden">
							<GalaxyMap2D
								mode="mission-target"
								onPlanetSelect={(planet) => setSelectedTarget(planet)}
								highlightedPlanets={selectedTarget ? [selectedTarget.id] : []}
								allowedPlanets={allowedPlanets}
							/>
						</div>
					</div>
				</Card>
			)}

			{/* Selected Planet Info */}
			{selectedTarget && (
				<Card className="p-4">
					<div className="space-y-2">
						<h3 className="font-medium">Selected Target</h3>
						<div className="grid grid-cols-2 gap-4 text-sm">
							<div>
								<span className="font-medium">Name: </span>
								{selectedTarget.name}
							</div>
							<div>
								<span className="font-medium">Position: </span>
								{selectedTarget.position.x}:{selectedTarget.position.y}
							</div>
							<div>
								<span className="font-medium">Biome: </span>
								{selectedTarget.biome}
							</div>
							<div>
								<span className="font-medium">Owner: </span>
								{selectedTarget.owner_name || 'Uncolonized'}
							</div>
							{arrivalTime && (
								<div className="col-span-2 flex items-center gap-2 mt-2">
									<Clock className="h-4 w-4 text-primary" />
									<div>
										<span className="font-medium">Arrival: </span>
										{arrivalTime.arrivalTime.toLocaleString()} (
										{utils.formatTimeString(arrivalTime.travelTimeSeconds * 1000)})
									</div>
								</div>
							)}
						</div>
					</div>
				</Card>
			)}

			{/* Action Buttons */}
			<div className="flex justify-end gap-2">
				<Button variant="outline" onClick={onBack}>
					{commonT('cancel')}
				</Button>
				<Button onClick={handleStartMission} disabled={!selectedMission || !selectedTarget || isLoading}>
					{t('mission_setup.start')}
				</Button>
			</div>
		</div>
	);
};
