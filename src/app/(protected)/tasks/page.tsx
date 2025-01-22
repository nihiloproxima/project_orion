'use client';

import { useGame } from '@/contexts/GameContext';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
	CheckCircle2,
	Clock,
	AlertCircle,
	Rocket,
	FlaskConical,
	Building,
	Ship,
	Gift,
	ChevronRight,
	Pin,
	ChevronDown,
	ChevronUp,
	Coins,
	Star,
	Hammer,
	Flame,
	Microchip,
	Info,
} from 'lucide-react';
import { Task, TaskStatus, BuildStructureTask, ResearchTask, ShipTask, MissionTask } from '@/models/user_tasks';
import { motion } from 'framer-motion';
import { containerVariants, itemVariants } from '@/lib/animations';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState, useMemo } from 'react';
import { SHIP_ASSETS } from '@/lib/constants';
import { STRUCTURE_INFO } from '@/lib/constants';
import { TECHNOLOGIES } from '@/lib/constants';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const TaskStatusIcons: Record<TaskStatus, React.ReactNode> = {
	pending: <Clock className="h-4 w-4 text-muted-foreground" />,
	in_progress: <Clock className="h-4 w-4 text-primary animate-pulse" />,
	completed: <CheckCircle2 className="h-4 w-4 text-green-500" />,
	failed: <AlertCircle className="h-4 w-4 text-destructive" />,
};

const TaskTypeIcons: Record<string, React.ReactNode> = {
	mission: <Rocket className="h-4 w-4" />,
	research: <FlaskConical className="h-4 w-4" />,
	structure_construction: <Building className="h-4 w-4" />,
	ship: <Ship className="h-4 w-4" />,
};

type TaskWithPin = Task & {
	isPinned?: boolean;
};

function TaskCard({ task, onTogglePin }: { task: TaskWithPin; onTogglePin: (taskId: string) => void }) {
	const { toast } = useToast();
	const [isExpanded, setIsExpanded] = useState(false);

	const getActionInfo = () => {
		switch (task.type) {
			case 'structure_construction':
				return {
					link: '/structures',
					tooltip: 'Visit Structures to build and upgrade',
				};
			case 'research':
				return {
					link: '/research',
					tooltip: 'Visit Research Lab to advance technologies',
				};
			case 'ship':
				return {
					link: '/shipyard',
					tooltip: 'Visit Shipyard to build ships',
				};
			case 'mission':
				return {
					link: '/fleet',
					tooltip: 'Visit Fleet to send ships on missions',
				};
			default:
				return null;
		}
	};

	const handleClaimReward = async () => {
		try {
			await api.users.claimTaskRewards(task.id);
			toast({
				title: 'Reward Claimed',
				description: 'Task rewards have been added to your account',
			});
		} catch (error) {
			console.error(error);
			toast({
				title: 'Error',
				description: 'Failed to claim reward',
				variant: 'destructive',
			});
		}
	};

	const renderTaskDetails = () => {
		switch (task.type) {
			case 'structure_construction':
				const structureTask = task as BuildStructureTask;
				const structureInfo = STRUCTURE_INFO[structureTask.structure_type];
				return (
					<div>
						<p>
							Build {structureInfo.name} to level {structureTask.required_level}
						</p>
					</div>
				);
			case 'research':
				const researchTask = task as ResearchTask;
				const techInfo = TECHNOLOGIES[researchTask.technology_id];
				return (
					<div>
						<p>
							Research {techInfo.name} to level {researchTask.required_level}
						</p>
					</div>
				);
			case 'ship':
				const shipTask = task as ShipTask;
				return (
					<div>
						<p>
							Build {shipTask.goal} {SHIP_ASSETS[shipTask.ship_type].name}
						</p>
						<div className="relative mt-2">
							<Progress value={(shipTask.progress / shipTask.goal) * 100} />
							<div className="absolute inset-0 flex items-center justify-center text-xs">
								{shipTask.progress}/{shipTask.goal}
							</div>
						</div>
					</div>
				);
			case 'mission':
				const missionTask = task as MissionTask;
				return (
					<div>
						<p>
							Complete{' '}
							{missionTask.mission_type
								.split('_')
								.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
								.join(' ')}{' '}
							missions
						</p>
						<div className="relative mt-2">
							<Progress value={task.status === 'completed' ? 100 : 0} />
							<div className="absolute inset-0 flex items-center justify-center text-xs">
								{task.status === 'completed' ? '1' : '0'}/1
							</div>
						</div>
					</div>
				);
			default:
				return null;
		}
	};

	return (
		<motion.div variants={itemVariants} className="my-2">
			<Card
				className={`bg-card/50 backdrop-blur-sm hover:shadow-lg transition-shadow ${
					isExpanded ? 'neon-border' : ''
				}`}
				onClick={() => setIsExpanded(!isExpanded)}
			>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<div className="flex items-center gap-4 flex-1">
						<div className="flex items-center gap-2">
							{TaskTypeIcons[task.type]}
							<h4 className="text-sm font-semibold">
								{task.type
									.split('_')
									.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
									.join(' ')}
							</h4>
						</div>
						{renderTaskDetails()}
					</div>
					<div className="flex items-center gap-2">
						{task.status !== 'completed' && getActionInfo() && (
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											variant="ghost"
											size="icon"
											className="text-muted-foreground hover:text-primary"
											onClick={(e) => {
												e.stopPropagation();
											}}
										>
											<Info className="h-4 w-4" />
										</Button>
									</TooltipTrigger>
									<TooltipContent>
										<p>{getActionInfo()!.tooltip}</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						)}
						<Button
							variant="ghost"
							size="icon"
							className={task.isPinned ? 'text-primary' : 'text-muted-foreground'}
							onClick={(e) => {
								e.stopPropagation();
								onTogglePin(task.id);
							}}
						>
							<Pin className="h-4 w-4" />
						</Button>
						<Badge
							variant={task.status === 'completed' ? 'default' : 'secondary'}
							className="flex items-center gap-1"
						>
							{TaskStatusIcons[task.status]}
							{task.status}
						</Badge>
						{isExpanded ? (
							<ChevronUp className="h-4 w-4 text-muted-foreground" />
						) : (
							<ChevronDown className="h-4 w-4 text-muted-foreground" />
						)}
					</div>
				</CardHeader>

				{isExpanded && (
					<CardContent className="space-y-4 pt-4 border-t border-primary/20">
						{task.context && <div className="text-sm text-muted-foreground">{task.context}</div>}

						{task.rewards.length > 0 && (
							<div>
								<h5 className="text-sm font-semibold flex items-center gap-2 mb-2">
									<Gift className="h-4 w-4" />
									Rewards
								</h5>
								<div className="grid grid-cols-2 gap-2">
									{task.rewards.map((reward, index) => {
										switch (reward.type) {
											case 'credits':
												return (
													<div key={index} className="flex items-center gap-2">
														<Coins className="h-4 w-4 text-yellow-500" />
														<span className="text-sm">{reward.credits} Credits</span>
													</div>
												);
											case 'reputation':
												return (
													<div key={index} className="flex items-center gap-2">
														<Star className="h-4 w-4 text-blue-500" />
														<span className="text-sm">
															{reward.reputation_points} Reputation
														</span>
													</div>
												);
											case 'resources':
												return Object.entries(reward.resources).map(([resource, amount]) => (
													<div
														key={`${index}-${resource}`}
														className="flex items-center gap-2"
													>
														{resource === 'metal' && (
															<Hammer className="h-4 w-4 text-secondary" />
														)}
														{resource === 'deuterium' && (
															<Flame className="h-4 w-4 text-primary" />
														)}
														{resource === 'microchips' && (
															<Microchip className="h-4 w-4 text-accent" />
														)}
														<span className="text-sm">
															{amount} {resource}
														</span>
													</div>
												));
											default:
												return null;
										}
									})}
								</div>
							</div>
						)}

						{task.status === 'completed' && (
							<Button
								className="w-full"
								onClick={(e) => {
									e.stopPropagation();
									handleClaimReward();
								}}
							>
								Claim Rewards
								<ChevronRight className="h-4 w-4 ml-2" />
							</Button>
						)}
					</CardContent>
				)}
			</Card>
		</motion.div>
	);
}

export default function TasksPage() {
	const { state } = useGame();
	const [pinnedTaskIds, setPinnedTaskIds] = useState<Set<string>>(new Set());

	const togglePinTask = (taskId: string) => {
		setPinnedTaskIds((prev) => {
			const newPinnedTasks = new Set(prev);
			if (newPinnedTasks.has(taskId)) {
				newPinnedTasks.delete(taskId);
			} else {
				newPinnedTasks.add(taskId);
			}
			return newPinnedTasks;
		});
	};

	const sortedTasks = useMemo(() => {
		const tasks = (state.userTasks?.tasks || []) as TaskWithPin[];
		return tasks
			.map((task) => ({
				...task,
				isPinned: pinnedTaskIds.has(task.id),
			}))
			.sort((a, b) => {
				if (a.isPinned && !b.isPinned) return -1;
				if (!a.isPinned && b.isPinned) return 1;
				return 0;
			});
	}, [state.userTasks?.tasks, pinnedTaskIds]);

	const filteredTasks = (status: TaskStatus) => sortedTasks.filter((task) => task.status === status);

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold neon-text mb-2">Tasks</h1>
				<p className="text-muted-foreground">Track your missions and claim rewards</p>
			</div>

			<Tabs defaultValue="pending">
				<TabsList>
					<TabsTrigger value="pending">
						Pending{' '}
						{filteredTasks('pending').length > 0 && (
							<Badge className="badge ml-2">{filteredTasks('pending').length}</Badge>
						)}
					</TabsTrigger>
					<TabsTrigger value="in_progress">
						In Progress{' '}
						{filteredTasks('in_progress').length > 0 && (
							<Badge className="badge ml-2">{filteredTasks('in_progress').length}</Badge>
						)}
					</TabsTrigger>
					<TabsTrigger value="completed">
						Completed{' '}
						{filteredTasks('completed').length > 0 && (
							<Badge className="badge ml-2">{filteredTasks('completed').length}</Badge>
						)}
					</TabsTrigger>
				</TabsList>

				{(['pending', 'in_progress', 'completed'] as TaskStatus[]).map((status) => (
					<TabsContent key={status} value={status}>
						<motion.div variants={containerVariants} initial="hidden" animate="show" className="my-2">
							{filteredTasks(status).map((task) => (
								<TaskCard key={task.id} task={task} onTogglePin={togglePinTask} />
							))}

							{filteredTasks(status).length === 0 && (
								<Card className="col-span-full p-8 text-center text-muted-foreground">
									<p>No {status.replace('_', ' ')} tasks available</p>
								</Card>
							)}
						</motion.div>
					</TabsContent>
				))}
			</Tabs>
		</div>
	);
}
