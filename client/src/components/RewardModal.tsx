import { UserReward } from '@/models';
import { Dialog, DialogContent } from './ui/dialog';
import { Button } from './ui/button';
import { motion } from 'framer-motion';
import { Coins, Hammer, Flame, Microchip } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useGame } from '@/contexts/GameContext';

export function RewardModal() {
	const { state, setState } = useGame();
	const { toast } = useToast();
	const currentReward = state.userRewards[0];

	if (!currentReward) return null;

	const handleAcceptReward = async () => {
		try {
			await api.collectReward(currentReward.id);
			setState((prev) => ({
				...prev,
				userRewards: prev.userRewards.slice(1),
			}));
			toast({
				title: 'Reward Claimed',
				description: 'The rewards have been added to your account',
			});
		} catch (error) {
			console.error('Error accepting reward:', error);
			toast({
				title: 'Error',
				description: 'Failed to claim reward',
				variant: 'destructive',
			});
		}
	};

	const renderRewardContent = (reward: UserReward) => {
		switch (reward.data.type) {
			case 'credits':
				return (
					<div className="flex items-center gap-2">
						<Coins className="h-8 w-8 text-yellow-500" />
						<span className="text-2xl">{reward.data.credits} Credits</span>
					</div>
				);
			case 'resources':
				return (
					<div className="space-y-4">
						{Object.entries(reward.data.resources).map(([resource, amount]) => (
							<div key={resource} className="flex items-center gap-2">
								{resource === 'metal' && <Hammer className="h-8 w-8 text-secondary" />}
								{resource === 'deuterium' && <Flame className="h-8 w-8 text-primary" />}
								{resource === 'microchips' && <Microchip className="h-8 w-8 text-accent" />}
								<span className="text-2xl">
									{amount} {resource}
								</span>
							</div>
						))}
					</div>
				);
		}
	};

	return (
		<Dialog
			open={true}
			onOpenChange={(open) => {
				if (!open) {
					handleAcceptReward();
				}
			}}
		>
			<DialogContent className="sm:max-w-md">
				<motion.div
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					className="space-y-6 p-6"
				>
					<h2 className="text-2xl font-bold text-center neon-text">You received a reward!</h2>
					<div className="flex flex-col items-center gap-4">{renderRewardContent(currentReward)}</div>
					<Button onClick={handleAcceptReward} className="w-full">
						Accept
					</Button>
				</motion.div>
			</DialogContent>
		</Dialog>
	);
}
