'use client';

import { Anchor, Factory, Minus, Plus, Rocket, Shield, Ship, Zap, Wind, Target, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { useTranslation } from '@/hooks/useTranslation';
import { ShipType } from 'shared-types';
import { Button } from '@/components/ui/button';
import { ShipControls } from './ShipControls';
import { useRouter } from 'next/navigation';
import { MissionSetupView } from './MissionSetupView';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Image from 'next/image';
import { Slider } from '@/components/ui/slider';
import { SHIP_ASSETS } from '@/lib/constants';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';

export const StationaryShipsSection = () => {
	const { state } = useGame();
	const { t } = useTranslation('fleet');
	const { t: tShipyard } = useTranslation('shipyard');
	const router = useRouter();
	const [shipTypeFilter, setShipTypeFilter] = useState<string>('all');
	const [showMissionSetup, setShowMissionSetup] = useState(false);
	const [selectedShips, setSelectedShips] = useState<Record<string, number>>({});
	const [expandedShips, setExpandedShips] = useState<Record<string, boolean>>({});
	const [inputValues, setInputValues] = useState<Record<string, string>>({});

	if (!state.selectedPlanet) return null;

	// Get ships from the planet
	const planetShips = state.selectedPlanet.ships;

	// Total number of ships available
	const totalShipsAvailable = Object.values(planetShips).reduce((sum, count) => sum + count, 0);

	// Total number of ships selected
	const totalShipsSelected = Object.values(selectedShips).reduce((sum, count) => sum + count, 0);

	// Filter ships by type
	const filteredShipTypes = Object.entries(planetShips)
		.filter(([type, count]) => {
			if (count === 0) return false;
			if (shipTypeFilter === 'all') return true;
			return type === shipTypeFilter;
		})
		.map(([type]) => type as ShipType);

	const handleShipCountChange = (type: ShipType, value: number[]) => {
		setSelectedShips((prev) => ({
			...prev,
			[type]: value[0],
		}));
		// Update the input field when slider changes
		setInputValues((prev) => ({
			...prev,
			[type]: value[0].toString(),
		}));
	};

	const handleInputChange = (type: ShipType, value: string) => {
		// Update the input value
		setInputValues((prev) => ({
			...prev,
			[type]: value,
		}));

		// Only update the actual selection if the value is a valid number
		if (/^\d+$/.test(value)) {
			const numericValue = parseInt(value, 10);
			const availableCount = planetShips[type] || 0;

			// Ensure value is within valid range
			const validValue = Math.min(Math.max(0, numericValue), availableCount);

			setSelectedShips((prev) => ({
				...prev,
				[type]: validValue,
			}));
		}
	};

	const handleInputBlur = (type: ShipType) => {
		const selectedCount = selectedShips[type] || 0;

		// Ensure the input reflects the actual value when leaving the field
		setInputValues((prev) => ({
			...prev,
			[type]: selectedCount.toString(),
		}));
	};

	const toggleShipStats = (type: string) => {
		setExpandedShips((prev) => ({
			...prev,
			[type]: !prev[type],
		}));
	};

	const handleStartMission = () => {
		setShowMissionSetup(true);
	};

	// If there are no ships at all, show a CTA to the shipyard
	if (totalShipsAvailable === 0) {
		return (
			<div className="space-y-4">
				<h2 className="text-xl font-bold flex items-center gap-2">
					<Anchor className="h-6 w-6" />
					{t('sections.stationary')}
				</h2>
				<p className="text-muted-foreground">{t('sections.stationary_description')}</p>

				<div className="flex flex-col items-center justify-center py-12 space-y-4">
					<p className="text-muted-foreground text-center">{t('sections.no_ships')}</p>
					<Button onClick={() => router.push('/shipyard')} className="gap-2">
						<Factory className="h-4 w-4" />
						{t('sections.visit_shipyard')}
					</Button>
				</div>
			</div>
		);
	}

	if (showMissionSetup) {
		return <MissionSetupView shipSelections={selectedShips} onBack={() => setShowMissionSetup(false)} />;
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-xl font-bold flex items-center gap-2">
						<Anchor className="h-6 w-6" />
						{t('sections.stationary')}
					</h2>
					<p className="text-muted-foreground">{totalShipsAvailable} ships available</p>
				</div>

				<Button onClick={handleStartMission} disabled={totalShipsSelected === 0} className="gap-2">
					<Rocket className="h-4 w-4" />
					{t('ship.actions.send_in_mission')} ({totalShipsSelected})
				</Button>
			</div>

			<p className="text-muted-foreground">{t('sections.stationary_description')}</p>

			<ShipControls shipTypeFilter={shipTypeFilter} setShipTypeFilter={setShipTypeFilter} />

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{filteredShipTypes.map((type) => {
					const asset = SHIP_ASSETS[type];
					const availableCount = planetShips[type] || 0;
					const selectedCount = selectedShips[type] || 0;
					const isExpanded = !!expandedShips[type];
					const inputValue = inputValues[type] !== undefined ? inputValues[type] : selectedCount.toString();

					return (
						<Card
							key={type}
							className="bg-black/30 border-primary/30 hover:border-primary/50 transition-all"
						>
							<CardHeader className="pb-2">
								<div className="flex items-center gap-3">
									<Image
										src={asset.image}
										alt={tShipyard(`ships.${type}.name`)}
										width={50}
										height={50}
										className="rounded-md w-12 h-12 object-cover"
									/>
									<div>
										<h3 className="font-bold text-lg">{tShipyard(`ships.${type}.name`)}</h3>
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<Collapsible open={isExpanded} onOpenChange={() => toggleShipStats(type)}>
										<CollapsibleTrigger asChild>
											<Button
												variant="ghost"
												className="w-full flex items-center justify-between mb-2"
											>
												<span className="font-semibold">Stats</span>
												<ChevronDown
													className={`h-4 w-4 transition-transform duration-200 ${
														isExpanded ? 'transform rotate-180' : ''
													}`}
												/>
											</Button>
										</CollapsibleTrigger>
										<CollapsibleContent className="space-y-2">
											<div className="grid grid-cols-2 gap-2 text-sm">
												<div className="flex items-center gap-2">
													<Ship className="h-4 w-4 text-blue-400" />
													<span>
														{tShipyard('stats.speed')}:{' '}
														{state.gameConfig?.ships.find((s) => s.type === type)?.speed}
													</span>
												</div>
												<div className="flex items-center gap-2">
													<Shield className="h-4 w-4 text-green-400" />
													<span>
														{tShipyard('stats.defense')}:{' '}
														{state.gameConfig?.ships.find((s) => s.type === type)?.defense}
													</span>
												</div>
												<div className="flex items-center gap-2">
													<Rocket className="h-4 w-4 text-red-400" />
													<span>
														{tShipyard('stats.attack')}:{' '}
														{state.gameConfig?.ships.find((s) => s.type === type)?.attack}
													</span>
												</div>
												<div className="flex items-center gap-2">
													<Anchor className="h-4 w-4 text-yellow-400" />
													<span>
														{tShipyard('stats.capacity')}:{' '}
														{state.gameConfig?.ships.find((s) => s.type === type)?.capacity}
													</span>
												</div>
												<div className="flex items-center gap-2">
													<Zap className="h-4 w-4 text-purple-400" />
													<span>
														{tShipyard('stats.initiative')}:{' '}
														{
															state.gameConfig?.ships.find((s) => s.type === type)
																?.initiative
														}
													</span>
												</div>
												<div className="flex items-center gap-2">
													<Zap className="h-4 w-4 text-orange-400" />
													<span>
														{tShipyard('stats.fire_rate')}:{' '}
														{
															state.gameConfig?.ships.find((s) => s.type === type)
																?.fire_rate
														}
													</span>
												</div>
												<div className="flex items-center gap-2">
													<Wind className="h-4 w-4 text-cyan-400" />
													<span>
														{tShipyard('stats.evasion')}:{' '}
														{state.gameConfig?.ships.find((s) => s.type === type)?.evasion}
													</span>
												</div>
												<div className="flex items-center gap-2">
													<Target className="h-4 w-4 text-pink-400" />
													<span>
														{tShipyard('stats.critical_chance')}:{' '}
														{
															state.gameConfig?.ships.find((s) => s.type === type)
																?.critical_chance
														}
														%
													</span>
												</div>
											</div>
										</CollapsibleContent>
									</Collapsible>

									<div className="bg-black/20 p-3 rounded-md space-y-3">
										<div className="flex justify-between items-center">
											<span className="text-sm text-primary">{t('ship.available')}:</span>
											<span className="font-bold">{availableCount}</span>
										</div>

										<div className="flex justify-between items-center">
											<span className="text-sm text-primary">{t('ship.selected')}:</span>
											<div className="flex items-center gap-2">
												<Button
													size="icon"
													variant="ghost"
													onClick={() =>
														handleShipCountChange(type, [Math.max(0, selectedCount - 1)])
													}
													disabled={selectedCount <= 0}
													className="h-6 w-6"
												>
													<Minus className="h-3 w-3" />
												</Button>
												<Input
													type="text"
													value={inputValue}
													onChange={(e) => handleInputChange(type, e.target.value)}
													onBlur={() => handleInputBlur(type)}
													className="w-16 h-7 text-center px-1"
													aria-label={`Number of ${type} ships`}
												/>
												<Button
													size="icon"
													variant="ghost"
													onClick={() =>
														handleShipCountChange(type, [
															Math.min(availableCount, selectedCount + 1),
														])
													}
													disabled={selectedCount >= availableCount}
													className="h-6 w-6"
												>
													<Plus className="h-3 w-3" />
												</Button>
											</div>
										</div>

										<div className="flex items-center gap-2">
											<Slider
												value={[selectedCount]}
												max={availableCount}
												step={1}
												onValueChange={(value) => handleShipCountChange(type, value)}
											/>

											<Button
												variant="outline"
												size="sm"
												className="ml-2 h-6 text-xs whitespace-nowrap"
												onClick={() => handleShipCountChange(type, [availableCount])}
											>
												Max
											</Button>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>
		</div>
	);
};
