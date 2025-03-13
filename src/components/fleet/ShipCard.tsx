'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Ship } from '@/models/ship';
import { useTranslation } from '@/hooks/useTranslation';
import { Settings, Send, Cog } from 'lucide-react';

interface ShipCardProps {
	ship: Ship;
	onSelect: () => void;
}

export const ShipCard = ({ ship, onSelect }: ShipCardProps) => {
	const { t } = useTranslation('fleet');
	const [showDetails, setShowDetails] = useState(false);

	return (
		<Card className="border-primary/20 transition-all hover:scale-[1.02]">
			<CardHeader className="pb-2">
				<CardTitle className="flex items-center justify-between text-lg">
					<div className="flex items-center gap-2">
						<Image
							src={`/images/ships/${ship.asset}.webp`}
							width={32}
							height={32}
							alt={ship.type || 'Ship'}
							className="w-8 h-8"
						/>
						{ship.name}
					</div>
					<div className="text-sm text-muted-foreground">
						{t('ship.level')} {ship.level}
					</div>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid gap-2">
					<div className="flex justify-between items-center">
						<span className="text-sm">
							{t('ship.type')}: {ship.type.charAt(0).toUpperCase() + ship.type.slice(1)}
						</span>
						<span
							className={`text-sm ${
								ship.integrity < 25
									? 'text-red-500'
									: ship.integrity < 50
									? 'text-yellow-500'
									: ship.integrity < 75
									? 'text-blue-500'
									: 'text-green-500'
							}`}
						>
							{t('ship.integrity')}: {ship.integrity}%
						</span>
					</div>

					{showDetails && (
						<div className="grid grid-cols-2 gap-2 text-sm mt-2 p-2 rounded bg-secondary/10">
							{/* Combat Stats */}
							<div className="flex items-center gap-1">
								<span>{t('ship.stats.attack')}:</span>
								<span className="text-primary">{ship.stats.attack}</span>
							</div>
							<div className="flex items-center gap-1">
								<span>{t('ship.stats.defense')}:</span>
								<span className="text-secondary">{ship.stats.defense}</span>
							</div>
							<div className="flex items-center gap-1">
								<span>{t('ship.stats.shield')}:</span>
								<span className="text-blue-400">{ship.stats.shield}</span>
							</div>
							<div className="flex items-center gap-1">
								<span>{t('ship.stats.evasion')}:</span>
								<span className="text-purple-400">{ship.stats.evasion}</span>
							</div>

							{/* Movement & Capacity */}
							<div className="flex items-center gap-1">
								<span>{t('ship.stats.speed')}:</span>
								<span className="text-accent">{ship.stats.speed}</span>
							</div>
							<div className="flex items-center gap-1">
								<span>{t('ship.stats.capacity')}:</span>
								<span>{ship.stats.capacity}</span>
							</div>

							{/* Combat Modifiers */}
							<div className="flex items-center gap-1">
								<span>{t('ship.stats.accuracy')}:</span>
								<span>{ship.stats.accuracy}%</span>
							</div>
							<div className="flex items-center gap-1">
								<span>{t('ship.stats.critical_chance')}:</span>
								<span>{ship.stats.critical_chance}%</span>
							</div>
							<div className="flex items-center gap-1">
								<span>{t('ship.stats.fire_rate')}:</span>
								<span>{ship.stats.fire_rate}</span>
							</div>
							<div className="flex items-center gap-1">
								<span>{t('ship.stats.initiative')}:</span>
								<span>{ship.stats.initiative}</span>
							</div>
						</div>
					)}

					<div className="flex justify-end gap-2 mt-2">
						<Button
							size="sm"
							variant="outline"
							onClick={() => setShowDetails(!showDetails)}
							className="gap-1"
						>
							<Settings className="h-4 w-4" />
							{showDetails ? t('ship.actions.hide') : t('ship.actions.details')}
						</Button>
						{ship.integrity < 100 && (
							<Button size="sm" variant="outline" className="gap-1 text-yellow-500 hover:text-yellow-400">
								<Cog className="h-4 w-4" />
								{t('ship.actions.repair')}
							</Button>
						)}
						<Button size="sm" variant="default" className="gap-1" onClick={onSelect}>
							<Send className="h-4 w-4" />
							{t('ship.actions.deploy')}
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};
