import { useState, useEffect } from 'react';
import { Progress } from './ui/progress';
import utils from '@/lib/utils';

interface TimerProps {
	startTime: number;
	finishTime: number;
	className?: string;
	showProgressBar?: boolean;
	variant?: 'primary' | 'secondary' | 'accent';
}

export function Timer({
	startTime,
	finishTime,
	className = '',
	showProgressBar = true,
	variant = 'primary',
}: TimerProps) {
	const [timeRemaining, setTimeRemaining] = useState<number>(0);
	const [progress, setProgress] = useState(() => {
		// Initialize progress based on current time on mount
		const now = Date.now();
		const total = finishTime - startTime;
		const remaining = finishTime - now;
		return Math.max(0, Math.min(100, ((total - remaining) / total) * 100));
	});

	useEffect(() => {
		const total = finishTime - startTime;

		const updateTimer = () => {
			const now = Date.now();
			const remaining = Math.max(0, finishTime - now);

			setTimeRemaining(remaining);
			// Calculate progress as percentage of remaining time
			const progressPercent = Math.max(0, Math.min(100, ((total - remaining) / total) * 100));
			setProgress(progressPercent);

			if (remaining > 0) {
				requestAnimationFrame(updateTimer);
			}
		};

		const animationId = requestAnimationFrame(updateTimer);

		return () => {
			cancelAnimationFrame(animationId);
		};
	}, [startTime, finishTime]);

	return (
		<div className={`p-3 bg-${variant}/10 rounded-lg border border-${variant}/30 ${className}`}>
			<div className="flex items-center">
				<div className="animate-pulse mr-2 w-2 h-2 bg-primary rounded-full"></div>
				<p className={`text-${variant} font-medium`}>Time remaining: {utils.formatTimeString(timeRemaining)}</p>
			</div>
			{showProgressBar && (
				<>
					<div className="mt-3 relative">
						<Progress value={progress} className="h-3 bg-background/30 [&>div]:bg-primary/80" />
						<div className="absolute inset-0 flex items-center justify-center text-xs font-mono text-white/90">
							{Math.round(progress)}%
						</div>
					</div>
					<p className="text-muted-foreground text-sm mt-2">{timeRemaining <= 0 && 'Complete!'}</p>
				</>
			)}
		</div>
	);
}
