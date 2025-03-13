'use client';

import { useEffect, useState } from 'react';
import { Ship, MissionType } from '@/models/ship';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGame } from '@/contexts/GameContext';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Rocket, Target } from 'lucide-react';
import { api } from '@/lib/api';
import { GalaxyMap } from '@/components/ThreeMap/GalaxyMap';
import { Planet } from '@/models/planet';

interface MissionSetupViewProps {
	ship: Ship;
	onBack: () => void;
}

export const MissionSetupView = ({ ship, onBack }: MissionSetupViewProps) => {
	const { t: commonT } = useTranslation('');
	const { t } = useTranslation('fleet');
	const { state } = useGame();
	const { toast } = useToast();
	const [selectedMission, setSelectedMission] = useState<MissionType | ''>('');
	const [selectedTarget, setSelectedTarget] = useState<Planet | null>(null);
	const [selectedGalaxy, setSelectedGalaxy] = useState<number>(state.selectedPlanet?.position.galaxy || 0);
	const [isLoading, setIsLoading] = useState(false);
	const [allowedPlanets, setAllowedPlanets] = useState<string[]>([]);

	useEffect(() => {
		if (!selectedMission) return;

		const fetchAllowedPlanets = async () => {
			const response = await api.getPlanets(selectedGalaxy, selectedMission as MissionType);
			setAllowedPlanets(response.planets.map((planet: Planet) => planet.id));
		};

		fetchAllowedPlanets();
	}, [selectedGalaxy, selectedMission]);

	// Define available missions based on ship type
	const availableMissions =
		{
			battle_ship: ['attack'],
			transport: ['transport'],
			colony: ['colonize'],
			spy: ['spy'],
			recycler: ['recycle', 'expedition'],
		}[ship.type] || [];

	const handleStartMission = async () => {
		if (!selectedMission || !selectedTarget) return;

		setIsLoading(true);
		try {
			await api.startMission({
				ship_id: ship.id,
				mission_type: selectedMission,
				target_id: selectedTarget.id,
				origin_planet_id: state.selectedPlanet!.id,
			});

			toast({
				title: t('mission_setup.success.title'),
				description: t('mission_setup.success.mission_started'),
			});
			onBack();
		} catch (error) {
			toast({
				title: t('mission_setup.error.title'),
				description: t('mission_setup.error.mission_failed'),
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
					<h2 className="text-xl font-bold">{t('mission_setup.title', { ship: ship.name })}</h2>
				</div>
			</div>

			{/* Ship Info Card */}
			<Card className="p-4">
				<div className="grid grid-cols-3 gap-4">
					<div className="flex items-center gap-2">
						<Rocket className="h-4 w-4 text-primary" />
						<div className="text-sm">
							<div className="font-medium">{t('ship.type')}</div>
							<div>{ship.type.charAt(0).toUpperCase() + ship.type.slice(1)}</div>
						</div>
					</div>

					<div className="flex items-center gap-2">
						<Target className="h-4 w-4 text-primary" />
						<div className="text-sm">
							<div className="font-medium">{t('ship.stats.range')}</div>
							<div>
								{ship.stats.speed * 10} {t('units.light_years')}
							</div>
						</div>
					</div>
				</div>
			</Card>

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
								<SelectItem key={mission} value={mission}>
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
							<Select
								value={selectedGalaxy.toString()}
								onValueChange={(value) => {
									setSelectedGalaxy(parseInt(value));
									setSelectedTarget(null);
								}}
							>
								<SelectTrigger className="w-[180px]">
									<SelectValue placeholder="Select Galaxy" />
								</SelectTrigger>
								<SelectContent>
									{Array.from({ length: 10 }, (_, i) => (
										<SelectItem key={i} value={i.toString()}>
											{t('galaxy')} {i + 1}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="h-[400px] relative border rounded-lg overflow-hidden">
							<GalaxyMap
								mode="mission-target"
								onPlanetSelect={(planet) => setSelectedTarget(planet)}
								galaxyFilter={selectedGalaxy}
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
								{selectedTarget.position.galaxy}:{selectedTarget.position.x}:{selectedTarget.position.y}
							</div>
							<div>
								<span className="font-medium">Biome: </span>
								{selectedTarget.biome}
							</div>
							<div>
								<span className="font-medium">Owner: </span>
								{selectedTarget.owner_name || 'Uncolonized'}
							</div>
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
