import { BaseMail, CombatMail, MissionMail, SpyMail } from '@/models';
import { Beaker, Bell, Building, Eye, MessageSquare, Rocket, Ship, Sword } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { api } from '@/lib/api';
import { Button } from './ui/button';

interface MailContentProps {
	mail: BaseMail;
}

export function MailContent({ mail }: MailContentProps) {
	const router = useRouter();

	const { t } = useTranslation('mail');

	const welcomeMailAction = async () => {
		await api.progressOnboarding('completed');
		console.log('progressing onboarding');
		router.push('/dashboard');
		console.log('pushing to dashboard');
	};

	// Spy Mail Handler
	if (mail.type === 'spy') {
		const spyData = (mail as SpyMail).data;
		return (
			<div className="space-y-6 animate-fade-in">
				<div className="flex items-center gap-2 text-yellow-500">
					<Eye className="h-5 w-5" />
					<h2 className="text-xl font-bold">Espionage Report</h2>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div className="space-y-2">
						<h3 className="font-semibold text-primary">Target Location</h3>
						<p className="text-sm whitespace-pre-line">{mail.content}</p>
						<p className="text-sm">
							Coordinates: ({spyData.target_coordinates.x}, {spyData.target_coordinates.y})
						</p>
					</div>
				</div>

				{Object.values(spyData.resources.current).some((value) => value > 0) && (
					<div className="space-y-4">
						<h3 className="font-semibold text-primary flex items-center gap-2">
							<Building className="h-4 w-4" />
							Resources
						</h3>
						<div className="grid grid-cols-2 gap-4 text-sm">
							{Object.entries(spyData.resources.current).map(([key, value]) => (
								<div key={key} className="flex items-center justify-between">
									<span className="capitalize">{key}:</span>
									<span>{(value as number).toLocaleString()}</span>
								</div>
							))}
						</div>
					</div>
				)}

				{spyData.structures.length > 0 && (
					<div className="space-y-4">
						<h3 className="font-semibold text-primary flex items-center gap-2">
							<Building className="h-4 w-4" />
							Structures
						</h3>
						<div className="grid grid-cols-2 gap-4 text-sm">
							{spyData.structures.map(
								(structure: { type: string; level: number; is_under_construction: boolean }) => (
									<div key={structure.type} className="flex items-center justify-between">
										<span className="capitalize">{structure.type.replace(/_/g, ' ')}:</span>
										<span>Level {structure.level}</span>
									</div>
								)
							)}
						</div>
					</div>
				)}

				{spyData.research.length > 0 && (
					<div className="space-y-4">
						<h3 className="font-semibold text-primary flex items-center gap-2">
							<Beaker className="h-4 w-4" />
							Research
						</h3>
						<div className="grid grid-cols-2 gap-4 text-sm">
							{spyData.research.map((tech: { id: string; level: number; is_researching: boolean }) => (
								<div key={tech.id} className="flex items-center justify-between">
									<span className="capitalize">{tech.id.replace(/_/g, ' ')}:</span>
									<span>Level {tech.level}</span>
								</div>
							))}
						</div>
					</div>
				)}
				{Object.values(spyData.ships).some((value) => value && value > 0) && (
					<div className="space-y-4">
						<h3 className="font-semibold text-primary flex items-center gap-2">
							<Ship className="h-4 w-4" />
							Ships Detected
						</h3>
						<div className="grid grid-cols-2 gap-4 text-sm">
							{Object.entries(spyData.ships).map(([shipType, count]) => {
								if (!count) return null;
								return (
									<div key={shipType} className="flex items-center gap-2">
										<Image
											src={`/images/ships/${shipType}.webp`}
											width={24}
											height={24}
											alt={shipType}
											className="w-6 h-6"
										/>
										<span className="capitalize">{shipType.replace(/_/g, ' ')}:</span>
										<span>{count}</span>
									</div>
								);
							})}
						</div>
					</div>
				)}
			</div>
		);
	}

	// Combat Mail Handler
	if (mail.type === 'combat') {
		const combatData = (mail as CombatMail).data;
		return (
			<div className="space-y-6 animate-fade-in">
				<div className="flex items-center gap-2 text-red-500">
					<Sword className="h-5 w-5" />
					<h2 className="text-xl font-bold">Combat Report</h2>
				</div>

				<div className="space-y-4">
					<div className="border border-primary/20 rounded-md p-4">
						<h3 className="text-lg font-semibold mb-2">Battle Location</h3>
						<p className="text-sm text-gray-400">
							Coordinates: ({combatData.location.coordinates.x}, {combatData.location.coordinates.y})
						</p>
					</div>

					<div className="grid grid-cols-2 gap-4">
						{/* Attackers */}
						<div className="border border-primary/20 rounded-md p-4">
							<h3 className="text-lg font-semibold mb-4 text-blue-400">Attacking Forces</h3>
							{combatData.attackers.map((attacker, index) => (
								<div key={index} className="mb-4">
									<h4 className="font-medium mb-2">{attacker.name}</h4>
									<div className="space-y-2">
										<div className="text-sm">
											<h5 className="text-gray-400 mb-1">Initial Fleet:</h5>
											{Object.entries(attacker.ships).map(([shipType, count]) => {
												if (!count) return null;
												return (
													<div key={shipType} className="flex justify-between">
														<span>{shipType.replace(/_/g, ' ')}</span>
														<span>{count}</span>
													</div>
												);
											})}
										</div>
										<div className="text-sm text-red-400">
											<h5 className="mb-1">Losses:</h5>
											{Object.entries(attacker.losses).map(([shipType, count]) => {
												if (!count) return null;
												return (
													<div key={shipType} className="flex justify-between">
														<span>{shipType.replace(/_/g, ' ')}</span>
														<span>-{count}</span>
													</div>
												);
											})}
										</div>
									</div>
								</div>
							))}
						</div>

						{/* Defenders */}
						<div className="border border-primary/20 rounded-md p-4">
							<h3 className="text-lg font-semibold mb-4 text-red-400">Defending Forces</h3>
							{combatData.defenders.map((defender, index) => (
								<div key={index} className="mb-4">
									<h4 className="font-medium mb-2">{defender.name}</h4>
									<div className="space-y-2">
										<div className="text-sm">
											<h5 className="text-gray-400 mb-1">Initial Fleet:</h5>
											{Object.entries(defender.ships).map(([shipType, count]) => {
												if (!count) return null;
												return (
													<div key={shipType} className="flex justify-between">
														<span>{shipType.replace(/_/g, ' ')}</span>
														<span>{count}</span>
													</div>
												);
											})}
										</div>
										<div className="text-sm text-red-400">
											<h5 className="mb-1">Losses:</h5>
											{Object.entries(defender.losses).map(([shipType, count]) => {
												if (!count) return null;
												return (
													<div key={shipType} className="flex justify-between">
														<span>{shipType.replace(/_/g, ' ')}</span>
														<span>-{count}</span>
													</div>
												);
											})}
										</div>
									</div>
								</div>
							))}
						</div>
					</div>

					<div className="border border-primary/20 rounded-md p-4">
						<h3 className="text-lg font-semibold mb-2">Battle Result</h3>
						<p
							className={`text-lg ${
								combatData.result === 'attacker_victory'
									? 'text-blue-400'
									: combatData.result === 'defender_victory'
									? 'text-red-400'
									: 'text-yellow-400'
							}`}
						>
							{combatData.result === 'attacker_victory'
								? 'Attacker Victory'
								: combatData.result === 'defender_victory'
								? 'Defender Victory'
								: 'Draw'}
						</p>
						{combatData.loot && (
							<div className="mt-4">
								<h4 className="font-medium mb-2">Resources Captured:</h4>
								<div className="grid grid-cols-2 gap-2 text-sm">
									{Object.entries(combatData.loot).map(([resource, amount]) => (
										<div key={resource} className="flex justify-between">
											<span className="capitalize">{resource}:</span>
											<span>{amount.toLocaleString()}</span>
										</div>
									))}
								</div>
							</div>
						)}
						{combatData.debris_field && (
							<div className="mt-4">
								<h4 className="font-medium mb-2">Debris Field:</h4>
								<div className="grid grid-cols-2 gap-2 text-sm">
									{Object.entries(combatData.debris_field).map(([resource, amount]) => (
										<div key={resource} className="flex justify-between">
											<span className="capitalize">{resource}:</span>
											<span>{amount.toLocaleString()}</span>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		);
	}

	// Mission Mail Handler
	if (mail.type === 'mission') {
		const missionMail = mail as MissionMail;

		return (
			<div className="space-y-6 animate-fade-in">
				<div className="flex items-center gap-2 text-blue-500">
					<Rocket className="h-5 w-5" />
					<h2 className="text-xl font-bold">Mission Report</h2>
				</div>

				<div className="prose prose-invert max-w-none">
					{missionMail.content && <p className="whitespace-pre-line">{missionMail.content}</p>}

					{/* {missionMail.data.resources_delivered && (
						<div className="border border-primary/20 rounded-md p-4 mt-4">
							<h3 className="text-lg font-semibold mb-2">Resources Delivered</h3>
							<div className="grid grid-cols-2 gap-2">
								{Object.entries(missionMail.data.resources_delivered).map(([resource, amount]) => (
									<div key={resource} className="flex justify-between">
										<span className="capitalize">{resource}:</span>
										<span>{(amount as number).toLocaleString()}</span>
									</div>
								))}
							</div>
						</div>
					)} */}
				</div>
			</div>
		);
	}

	// Private Mail Handler
	if (mail.type === 'private_message') {
		return (
			<div className="space-y-6 animate-fade-in">
				<div className="flex items-center gap-2 text-green-500">
					<MessageSquare className="h-5 w-5" />
					<h2 className="text-xl font-bold">Private Message</h2>
				</div>

				<div className="prose prose-invert max-w-none">
					<div className="flex items-center gap-2 mb-4">
						<span className="text-gray-400">From:</span>
						<span className="text-primary">{mail.sender_name}</span>
					</div>
					{mail.content && <p className="whitespace-pre-line">{mail.content}</p>}
				</div>
			</div>
		);
	}

	// Game Mail Handler
	if (mail.type === 'game_message') {
		return (
			<div className="space-y-6 animate-fade-in">
				<div className="flex items-center gap-2 text-yellow-500">
					<Bell className="h-5 w-5" />
					<h2 className="text-xl font-bold">System Message</h2>
				</div>

				<div className="prose prose-invert max-w-none">
					{mail.content && (
						<div className="whitespace-pre-wrap font-mono text-primary/90">{mail.content}</div>
					)}

					{mail.data.link && (
						<div className="flex justify-center">
							<Button
								onClick={welcomeMailAction}
								className="mt-4 animate-pulse bg-primary hover:bg-primary/80 text-lg font-bold"
							>
								{t('onboarding.welcome_1.action')}
							</Button>
						</div>
					)}
				</div>
			</div>
		);
	}

	// Fallback for unknown types
	return (
		<div className="text-gray-400">
			<p>Unknown message type</p>
		</div>
	);
}
