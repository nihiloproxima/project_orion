'use client';

import { Card } from '../../../components/ui/card';
import { Eye } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import GalaxyMap2D from '@/components/2DMap/GalaxyMap2D';

export default function GalaxyObservation() {
	const { t } = useTranslation('galaxy');

	return (
		<div className="flex flex-col h-[calc(100vh-8rem)] overflow-hidden">
			<div className="flex justify-between items-center mb-4 flex-shrink-0">
				<div>
					<h1 className="text-3xl font-bold neon-text mb-2 flex items-center gap-2">
						<Eye className="h-8 w-8" />
						{t('title')}
					</h1>
					<p className="text-muted-foreground">{t('subtitle')}</p>
				</div>
			</div>

			<Card className="border-2 shadow-2xl shadow-primary/20 min-h-0 flex-1">
				<div className="h-full w-full">
					{/* <GalaxyMap mode="view-only" galaxyFilter={currentGalaxy} /> */}
					<GalaxyMap2D />
				</div>
			</Card>
		</div>
	);
}
