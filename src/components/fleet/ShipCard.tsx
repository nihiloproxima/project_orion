'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Ship } from '@/models/ship';
import { useTranslation } from '@/hooks/useTranslation';

interface ShipCardProps {
	ship: Ship;
}

export const ShipCard = ({ ship }: ShipCardProps) => {
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
						<span className="text-sm">
							{t('ship.integrity')}: {ship.integrity}%
						</span>
					</div>

					{showDetails && (
						<div className="grid grid-cols-2 gap-2 text-sm mt-2 p-2 rounded bg-secondary/10">
							<div className="flex items-center gap-1">
								<span>{t('ship.stats.attack')}:</span>
								<span className="text-primary">{ship.stats.attack}</span>
							</div>
							<div className="flex items-center gap-1">
								<span>{t('ship.stats.defense')}:</span>
								<span className="text-secondary">{ship.stats.defense}</span>
							</div>
							<div className="flex items-center gap-1">
								<span>{t('ship.stats.speed')}:</span>
								<span className="text-accent">{ship.stats.speed}</span>
							</div>
							<div className="flex items-center gap-1">
								<span>{t('ship.stats.capacity')}:</span>
								<span>{ship.stats.capacity}</span>
							</div>
						</div>
					)}

					<div className="flex justify-end gap-2 mt-2">
						<Button size="sm" variant="outline" onClick={() => setShowDetails(!showDetails)}>
							{showDetails ? t('ship.actions.hide') : t('ship.actions.details')}
						</Button>
						<Button size="sm" variant="default">
							{t('ship.actions.deploy')}
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};
