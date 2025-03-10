import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from '@/hooks/useTranslation';

interface ShipControlsProps {
	shipTypeFilter: string;
	setShipTypeFilter: (value: string) => void;
	shipSortBy: string;
	setShipSortBy: (value: string) => void;
}

export const ShipControls = ({ shipTypeFilter, setShipTypeFilter, shipSortBy, setShipSortBy }: ShipControlsProps) => {
	const { t } = useTranslation('fleet');

	return (
		<div className="flex flex-wrap gap-4 mb-4">
			<Select
				value={shipTypeFilter}
				onValueChange={(value) => {
					setShipTypeFilter(value);
				}}
			>
				<SelectTrigger className="w-[180px]">
					<SelectValue placeholder={t('filter.ship_type')} />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">{t('filter.all')}</SelectItem>
					<SelectItem value="battle_ship">{t('filter.battle_ship')}</SelectItem>
					<SelectItem value="transport">{t('filter.transport')}</SelectItem>
					<SelectItem value="colony">{t('filter.colony')}</SelectItem>
					<SelectItem value="recycler">{t('filter.recycler')}</SelectItem>
					<SelectItem value="spy">{t('filter.spy')}</SelectItem>
				</SelectContent>
			</Select>
		</div>
	);
};
