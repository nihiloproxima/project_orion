import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const formatTimerTime = (seconds: number) => {
	const days = Math.floor(seconds / (60 * 60 * 24));
	const hours = Math.floor((seconds % (60 * 60 * 24)) / (60 * 60));
	const minutes = Math.floor((seconds % (60 * 60)) / 60);
	const remainingSeconds = Math.floor(seconds % 60);

	return [
		days > 0 && `${days}d`,
		hours > 0 && `${hours}h`,
		minutes > 0 && `${minutes}m`,
		remainingSeconds > 0 && `${remainingSeconds}s`,
	]
		.filter(Boolean)
		.join(' ');
};

export const formatTimeString = (timeRemainingMs: number) => {
	const days = Math.floor(timeRemainingMs / (1000 * 60 * 60 * 24));
	const hours = Math.floor((timeRemainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	const minutes = Math.floor((timeRemainingMs % (1000 * 60 * 60)) / (1000 * 60));
	const seconds = Math.floor((timeRemainingMs % (1000 * 60)) / 1000);

	const result = [days > 0 && `${days}d`, hours > 0 && `${hours}h`, minutes > 0 && `${minutes}m`, `${seconds}s`]
		.filter(Boolean)
		.join(' ');

	return result;
};

export const secondsToMs = (seconds: number) => seconds * 1000;
