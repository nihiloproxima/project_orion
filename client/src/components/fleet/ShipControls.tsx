import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from '@/hooks/useTranslation';
import { SHIP_ASSETS } from '@/lib/constants';

interface ShipControlsProps {
	shipTypeFilter: string;
	setShipTypeFilter: (value: string) => void;
}

export const ShipControls = ({ shipTypeFilter, setShipTypeFilter }: ShipControlsProps) => {
	const { t } = useTranslation('fleet');
	const { t: tShipyard } = useTranslation('shipyard');

	const shipTypes = Object.keys(SHIP_ASSETS);

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
					{shipTypes.map((type) => (
						<SelectItem key={type} value={type}>
							{tShipyard(`ships.${type}.name`)}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
};
