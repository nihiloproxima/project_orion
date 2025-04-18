'use client';

import { Sidebar } from '../Sidebar';
import { ResourceBar } from '../ResourceBar';
import { useGame } from '../../contexts/GameContext';
import { useEffect, useState } from 'react';
import { LoadingScreen } from '../LoadingScreen';

export function AuthLayout({ children }: { children: React.ReactNode }) {
	const loadingDuration = 1000;
	const { state } = useGame();
	const [showLoading, setShowLoading] = useState(true);
	const [showMobileSidebar, setShowMobileSidebar] = useState(false);

	useEffect(() => {
		const timer = setTimeout(() => {
			setShowLoading(false);
		}, loadingDuration);

		return () => clearTimeout(timer);
	}, []);

	useEffect(() => {
		setShowMobileSidebar(false);
	}, []);

	if (state.loading || showLoading) {
		return <LoadingScreen duration={loadingDuration} />;
	}

	return (
		<div className="flex h-screen">
			{/* Backdrop */}
			{showMobileSidebar && (
				<div
					className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
					onClick={() => setShowMobileSidebar(false)}
				/>
			)}

			{/* Sidebar */}
			<div
				className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:relative md:transform-none ${
					showMobileSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
				}`}
			>
				<Sidebar />
			</div>

			{/* Main Content */}
			<div className="flex-1 flex flex-col overflow-hidden">
				<ResourceBar showMobileSidebar={showMobileSidebar} setShowMobileSidebar={setShowMobileSidebar} />
				<main className="flex-1 overflow-auto p-4 md:p-8">{children}</main>
			</div>
		</div>
	);
}
