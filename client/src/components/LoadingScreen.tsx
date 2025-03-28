import { useEffect, useState } from 'react';
import { Terminal } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface LoadingScreenProps {
	message?: string;
	steps?: string[];
	duration?: number; // Duration in milliseconds
}

export function LoadingScreen({ message, steps, duration = 3000 }: LoadingScreenProps) {
	const { t } = useLanguage();

	const DEFAULT_LOADING_MESSAGES = [
		t('common', 'loading.initializing_system'),
		t('common', 'loading.establishing_connection'),
		t('common', 'loading.scanning_star_systems'),
		t('common', 'loading.loading_planet_data'),
		t('common', 'loading.fetching_resources'),
		t('common', 'loading.loading_research_status'),
		t('common', 'loading.checking_structures'),
		t('common', 'loading.initializing_game_state'),
	];

	const loadingSteps = steps || DEFAULT_LOADING_MESSAGES;

	const [progress, setProgress] = useState(0);
	const [currentMessage, setCurrentMessage] = useState(0);

	useEffect(() => {
		// Calculate intervals based on duration and steps
		const progressInterval = duration / 100; // Split duration into 100 progress steps
		const messageInterval = duration / loadingSteps.length;

		// Progress bar animation
		const progressTimer = setInterval(() => {
			setProgress((prev) => {
				if (prev >= 100) {
					clearInterval(progressTimer);
					return 100;
				}
				return prev + 1;
			});
		}, progressInterval);

		// Cycle through messages
		const messageTimer = setInterval(() => {
			setCurrentMessage((prev) => (prev + 1) % loadingSteps.length);
		}, messageInterval);

		return () => {
			clearInterval(progressTimer);
			clearInterval(messageTimer);
		};
	}, [duration, loadingSteps.length]);

	return (
		<div className="min-h-screen bg-background cyber-grid flex items-center justify-center">
			<div className="absolute inset-0 bg-primary/5 blur-[100px] rounded-full" />

			<div className="w-[600px] max-w-full px-6 sm:px-4 space-y-8 z-10">
				{/* Header */}
				<div className="flex items-center justify-center gap-2 px-2">
					<Terminal className="h-6 w-6 sm:h-8 sm:w-8 text-primary animate-pulse" />
					<h1 className="text-2xl sm:text-4xl font-bold neon-text tracking-wider px-2">
						{message || 'SYSTEM BOOT SEQUENCE'}
					</h1>
				</div>

				{/* Matrix-like effect overlay */}
				<div className="relative h-[300px] border border-primary/30 bg-black/80 overflow-hidden font-mono mx-2">
					<div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,255,0,0.03)1px,transparent_1px)] bg-[size:100%_2px] animate-matrix-rain" />

					{/* Scrolling terminal text */}
					<div className="p-4 space-y-2 text-primary/70">
						{loadingSteps.map((msg, i) => (
							<div
								key={i}
								className={`transition-opacity duration-500 ${
									i === currentMessage ? 'opacity-100' : 'opacity-30'
								}`}
							>
								{'> '}
								{msg}
							</div>
						))}
					</div>
				</div>

				{/* Progress bar */}
				<div className="space-y-2 mx-4">
					<div className="flex justify-between text-sm text-primary/70 font-mono">
						<span>INITIALIZATION PROGRESS</span>
						<span>{progress}%</span>
					</div>
					<div className="relative h-2 bg-primary/10 rounded-full overflow-hidden">
						<div className="absolute inset-y-0 left-0 bg-primary/30" style={{ width: `${progress}%` }} />
						<div
							className="absolute inset-y-0 left-0 bg-primary animate-pulse"
							style={{
								width: '2px',
								left: `${progress}%`,
								boxShadow:
									'0 0 10px theme(colors.primary.DEFAULT), 0 0 5px theme(colors.primary.DEFAULT)',
							}}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
