'use client';

import { Anchor, ChevronLeft, ChevronRight, Factory } from 'lucide-react';
import { useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { useTranslation } from '@/hooks/useTranslation';
import { Ship } from '@/models/ship';
import { Button } from '@/components/ui/button';
import { ShipControls } from './ShipControls';
import { ShipCard } from './ShipCard';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, query, where } from 'firebase/firestore';
import { db, withIdConverter } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export const StationaryShipsSection = () => {
	const { state } = useGame();
	const { t } = useTranslation('fleet');
	const router = useRouter();

	// Stationary ships state
	const [stationaryShips] = useCollectionData<Ship>(
		state.gameConfig && state.currentUser
			? query(
					collection(db, `seasons/${state.gameConfig.season.current}/ships`).withConverter(withIdConverter),
					where('owner_id', '==', state.currentUser.id),
					where('status', '==', 'stationed')
			  )
			: null
	);
	const [shipTypeFilter, setShipTypeFilter] = useState<string>('all');
	const [shipSortBy, setShipSortBy] = useState<string>('type');
	const [currentPage, setCurrentPage] = useState(1);
	const SHIPS_PER_PAGE = 25;

	// Filter and sort stationary ships
	const filterShips = (ships: Ship[]) => {
		if (shipTypeFilter === 'all') return ships;
		return ships.filter((ship) => ship.type === shipTypeFilter);
	};

	const sortShips = (ships: Ship[]) => {
		return [...ships].sort((a, b) => {
			switch (shipSortBy) {
				case 'type':
					return a.type.localeCompare(b.type);
				case 'name':
					return a.name.localeCompare(b.name);
				case 'level':
					return b.level - a.level;
				case 'integrity':
					return b.integrity - a.integrity;
				default:
					return a.type.localeCompare(b.type);
			}
		});
	};

	// Pagination
	const paginateShips = (ships: Ship[]) => {
		const startIndex = (currentPage - 1) * SHIPS_PER_PAGE;
		return ships.slice(startIndex, startIndex + SHIPS_PER_PAGE);
	};

	const filteredAndSortedShips = sortShips(filterShips(stationaryShips || []));
	const paginatedShips = paginateShips(filteredAndSortedShips);
	const totalPages = Math.ceil(filteredAndSortedShips.length / SHIPS_PER_PAGE);

	// If there are no ships at all, show a CTA to the shipyard
	if (stationaryShips && stationaryShips.length === 0) {
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

	return (
		<div className="space-y-4">
			<h2 className="text-xl font-bold flex items-center gap-2">
				<Anchor className="h-6 w-6" />
				{t('sections.stationary')}
			</h2>
			<p className="text-muted-foreground">{t('sections.stationary_description')}</p>

			<ShipControls
				shipTypeFilter={shipTypeFilter}
				setShipTypeFilter={setShipTypeFilter}
				shipSortBy={shipSortBy}
				setShipSortBy={setShipSortBy}
			/>

			{stationaryShips?.length === 0 ? (
				<div className="flex justify-center py-8">
					<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
				</div>
			) : stationaryShips?.length && stationaryShips.length > 0 ? (
				<>
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{paginatedShips.map((ship) => (
							<ShipCard key={ship.id} ship={ship} />
						))}
					</div>

					{/* Pagination Controls */}
					{totalPages > 1 && (
						<div className="flex justify-center items-center gap-4 mt-6">
							<Button
								variant="outline"
								size="sm"
								onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
								disabled={currentPage === 1}
							>
								<ChevronLeft className="h-4 w-4 mr-1" />
								{t('pagination.previous')}
							</Button>

							<span className="text-sm">
								{t('pagination.page')} {currentPage} {t('pagination.of')} {totalPages}
							</span>

							<Button
								variant="outline"
								size="sm"
								onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
								disabled={currentPage === totalPages}
							>
								{t('pagination.next')}
								<ChevronRight className="h-4 w-4 ml-1" />
							</Button>
						</div>
					)}
				</>
			) : (
				<p className="text-muted-foreground">{t('sections.no_ships')}</p>
			)}
		</div>
	);
};
