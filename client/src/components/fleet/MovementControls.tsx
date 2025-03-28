import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from '@/hooks/useTranslation';

interface MovementControlsProps {
	missionFilter: string;
	setMissionFilter: (value: string) => void;
	sortBy: string;
	setSortBy: (value: string) => void;
	displayMode: 'grid' | 'rows';
	setDisplayMode: (value: 'grid' | 'rows') => void;
}

export const MovementControls = ({
	missionFilter,
	setMissionFilter,
	sortBy,
	setSortBy,
	displayMode,
	setDisplayMode,
}: MovementControlsProps) => {
	const { t } = useTranslation('fleet');

	return (
		<div className="flex flex-wrap gap-4 mb-4" onClick={(e) => e.stopPropagation()}>
			<Select
				value={missionFilter}
				onValueChange={(value) => {
					setMissionFilter(value);
				}}
			>
				<SelectTrigger className="w-[180px]">
					<SelectValue placeholder={t('filter.mission')} />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">{t('filter.all')}</SelectItem>
					<SelectItem value="attack">{t('filter.attack')}</SelectItem>
					<SelectItem value="transport">{t('filter.transport')}</SelectItem>
					<SelectItem value="colonize">{t('filter.colonize')}</SelectItem>
				</SelectContent>
			</Select>

			<Select
				value={sortBy}
				onValueChange={(value) => {
					setSortBy(value);
				}}
			>
				<SelectTrigger className="w-[180px]">
					<SelectValue placeholder={t('sort.by')} />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="arrival">{t('sort.arrival')}</SelectItem>
					<SelectItem value="departure">{t('sort.departure')}</SelectItem>
					<SelectItem value="ships">{t('sort.ships')}</SelectItem>
					<SelectItem value="resources">{t('sort.resources')}</SelectItem>
				</SelectContent>
			</Select>

			<Select
				value={displayMode}
				onValueChange={(value: 'grid' | 'rows') => {
					setDisplayMode(value);
				}}
			>
				<SelectTrigger className="w-[180px]">
					<SelectValue placeholder={t('display.mode')} />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="grid">{t('display.grid')}</SelectItem>
					<SelectItem value="rows">{t('display.rows')}</SelectItem>
				</SelectContent>
			</Select>
		</div>
	);
};
