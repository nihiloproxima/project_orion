import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { useTranslation } from '@/hooks/useTranslation';

interface GalaxySelectorProps {
	currentGalaxy: number;
	onGalaxyChange: (galaxy: number) => void;
}

export function GalaxySelector({ currentGalaxy, onGalaxyChange }: GalaxySelectorProps) {
	const { t } = useTranslation('galaxy');

	return (
		<div className="flex items-center gap-4 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg">
			<Button
				variant="ghost"
				size="icon"
				onClick={() => onGalaxyChange(Math.max(0, currentGalaxy - 1))}
				disabled={currentGalaxy === 0}
			>
				<ChevronLeft className="h-4 w-4" />
			</Button>

			<div className="flex flex-col items-center">
				<span className="text-sm text-muted-foreground">{t('selector.title')}</span>
				<span className="text-xl font-bold text-primary">
					{t('selector.number', { number: currentGalaxy.toString() })}
				</span>
			</div>

			<Button
				variant="ghost"
				size="icon"
				onClick={() => onGalaxyChange(Math.min(10, currentGalaxy + 1))}
				disabled={currentGalaxy === 10}
			>
				<ChevronRight className="h-4 w-4" />
			</Button>
		</div>
	);
}
