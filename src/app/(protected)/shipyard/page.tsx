'use client';

import { AlertTriangle, Factory } from 'lucide-react';
import { Card, CardHeader } from '../../../components/ui/card';

import { ErrorBoundary } from '../../../components/ErrorBoundary';
import Image from 'next/image';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { ShipyardQueue } from '../../../models/shipyard_queue';
import { Timer } from '../../../components/Timer';
import utils from '../../../lib/utils';
import { useGame } from '../../../contexts/GameContext';
import { useMediaQuery } from '@/hooks/useMediaQuery';

import { useDocumentData } from 'react-firebase-hooks/firestore';
import { doc, DocumentReference } from 'firebase/firestore';
import { db } from '@/lib/firebase';

function QueueDisplay({ queue }: { queue: ShipyardQueue | undefined }) {
	if (!queue || queue.commands.length === 0) {
		return <div className="text-muted-foreground text-sm mb-6">No ships currently in production</div>;
	}

	return (
		<div className="mb-6">
			<h2 className="text-xl font-bold mb-4 flex items-center gap-2">
				Production Queue ({queue.commands.length}/{queue.capacity})
			</h2>
			<div className="grid gap-3">
				{queue.commands.map((command, index) => {
					const asset = '';
					const isInProgress = index === 0;

					return (
						<Card key={index} className="bg-black/30">
							<CardHeader className="flex flex-row items-center p-4">
								<Image
									src={asset}
									alt={asset}
									width={100}
									height={100}
									className="w-12 h-12 rounded mr-4"
								/>
								<div className="flex-1">
									<div className="font-bold">{asset}</div>
								</div>
								<div className="flex items-center gap-2 text-primary">
									{isInProgress ? (
										<Timer
											startTime={command.construction_start_time.toMillis()}
											finishTime={command.construction_finish_time.toMillis()}
											showProgressBar={true}
										/>
									) : (
										<div className="text-sm">
											Starts in:{' '}
											{utils.formatTimerTime(
												(queue.commands.at(index - 1)!.construction_finish_time.toMillis() -
													Date.now()) /
													1000
											)}
										</div>
									)}
								</div>
							</CardHeader>
						</Card>
					);
				})}
			</div>
		</div>
	);
}

export default function Shipyard() {
	const { state } = useGame();
	const [shipyardQueue] = useDocumentData(
		state.gameConfig && state.selectedPlanet
			? (doc(
					db,
					`seasons/${state.gameConfig.season.current}/planets/${state.selectedPlanet.id}/private/shipyard_queue`
			  ) as DocumentReference<ShipyardQueue>)
			: null
	);
	const isMobile = useMediaQuery('(max-width: 768px)');

	// Check if shipyard exists
	const hasShipyard = state.selectedPlanet?.structures.some(
		(structure) => structure.type === 'shipyard' && structure.level >= 1
	);

	if (!hasShipyard) {
		return (
			<div className="flex flex-col items-center justify-center h-[80vh] space-y-6 text-center">
				<AlertTriangle className="w-16 h-16 text-red-500 animate-pulse" />
				<div className="space-y-2">
					<h2 className="text-2xl font-bold text-red-500">ACCESS DENIED</h2>
					<div className="font-mono text-sm text-muted-foreground max-w-md">
						<p className="mb-2">[ERROR CODE: NO_SHIPYARD_DETECTED]</p>
						<p>Shipyard structure required for spacecraft construction.</p>
						<p>Please construct a shipyard to access ship building capabilities.</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<ErrorBoundary>
			<div className="space-y-6">
				<div className="flex justify-between items-center">
					<div>
						<h1 className="text-3xl font-bold neon-text mb-2 flex items-center gap-2">
							<Factory className="h-8 w-8" />
							SHIPYARD
						</h1>
						<p className="text-muted-foreground">Construct and manage your fleet of spacecraft</p>
					</div>
				</div>

				<div className={`${isMobile ? '' : 'grid grid-cols-4 gap-6'}`}>
					{/* Ship Cards Display */}
					<div className={`${isMobile ? 'w-full' : 'col-span-3'} h-[calc(100vh-12rem)]`}>
						<ScrollArea className="h-full pr-4">
							<QueueDisplay queue={shipyardQueue} />

							<div className="text-center text-muted-foreground font-mono">
								<p>{'>'} SELECT A CATEGORY TO VIEW AVAILABLE SHIPS</p>
							</div>
						</ScrollArea>
					</div>
				</div>
			</div>
		</ErrorBoundary>
	);
}
