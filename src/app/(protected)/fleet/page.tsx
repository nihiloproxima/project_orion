'use client';

import { Rocket } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { FleetMovementsSection } from '@/components/fleet/FleetMovementsSection';
import { StationaryShipsSection } from '@/components/fleet/StationaryShipsSection';

const FleetPage = () => {
	const { t } = useTranslation('fleet');

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold neon-text mb-2 flex items-center gap-2">
					<Rocket className="h-8 w-8" />
					{t('title')}
				</h1>
				<p className="text-muted-foreground">{t('subtitle')}</p>
			</div>

			{/* Fleet Movements Section */}
			<FleetMovementsSection />

			{/* Stationary Ships Section */}
			<div className="mt-8 pt-8 border-t border-primary/20">
				<StationaryShipsSection />
			</div>
		</div>
	);
};

export default FleetPage;
