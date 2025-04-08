'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './ui/button';
import {
	LogOut,
	Terminal,
	Computer,
	Building,
	FlaskConical,
	Eye,
	User,
	ArrowRight,
	Trophy,
	MailIcon,
	Factory,
	MessageSquare,
} from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import { auth } from '@/lib/firebase';

// Create a reusable NavLink component
const NavLink = ({ item, badge }: { item: any; badge?: number }) => {
	const { t } = useLanguage();

	return (
		<Link key={item.to} href={item.to}>
			<Button
				variant="ghost"
				className={`w-full justify-start text-${item.color}-400 hover:bg-${item.color}-500/10 
					border border-transparent hover:border-${item.color}-500/30 
					group transition-all duration-300 relative
					${location.pathname === item.to ? `bg-${item.color}-500/10 border-${item.color}-500/30` : ''}`}
			>
				<item.icon
					className={`mr-2 ${location.pathname === item.to ? 'animate-pulse' : 'group-hover:animate-pulse'}`}
				/>
				<span
					className={`font-mono ${
						location.pathname === item.to
							? 'text-primary'
							: 'group-hover:text-primary group-hover:animate-glitch'
					}`}
				>
					{`> ${t('common', `navigation.${item.translationKey}`)}`}
				</span>
				{badge !== undefined && badge > 0 && (
					<span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-2 py-0.5 rounded-full">
						{badge}
					</span>
				)}
			</Button>
		</Link>
	);
};

export function Sidebar() {
	const { logout } = useAuth();
	const { state } = useGame();
	const { t } = useLanguage();
	const router = useRouter();

	// Add this to track completed tasks
	const completedTasksCount = state.userTasks?.tasks.filter((task) => task.status === 'completed')?.length || 0;

	const handleLogout = () => {
		logout();
		router.push('/auth/login');
	};

	const isCreateUserPage = location.pathname === '/create-user';

	// Add this constant outside the component
	const NAVIGATION_ITEMS: Record<
		string,
		{ to: string; icon: any; translationKey: string; color: string; hasBadge?: boolean }[]
	> = {
		MAIN: [
			{
				to: '/dashboard',
				icon: Computer,
				translationKey: 'dashboard',
				color: 'primary',
			},
			{
				to: '/secure-communications',
				icon: MailIcon,
				translationKey: 'secure_coms',
				color: 'blue',
			},
			{
				to: `/user/${auth.currentUser?.uid}`,
				icon: User,
				translationKey: 'user_profile',
				color: 'blue',
			},
			{
				to: '/galaxy',
				icon: Eye,
				translationKey: 'galaxy_map',
				color: 'purple',
			},
			{
				to: '/rankings',
				icon: Trophy,
				translationKey: 'rankings',
				color: 'blue',
			},
			{
				to: '/fleet',
				icon: ArrowRight,
				translationKey: 'fleet',
				color: 'blue',
			},
			// {
			// 	to: '/trading',
			// 	icon: ArrowLeftRight,
			// 	translationKey: 'trading',
			// 	color: 'green',
			// },
		],
		PLANET: [
			{
				to: '/structures',
				icon: Building,
				translationKey: 'structures',
				color: 'primary',
			},
			{
				to: '/researchs',
				icon: FlaskConical,
				translationKey: 'research_lab',
				color: 'green',
			},
			{
				to: '/shipyard',
				icon: Factory,
				translationKey: 'shipyard',
				color: 'blue',
			},
		],
		OTHER: [
			{
				to: 'https://discord.gg/yabgbdGJGs',
				icon: MessageSquare,
				translationKey: 'discord',
				color: 'blue',
			},
		],
	};

	return (
		<div className="w-[280px] md:w-64 bg-black/95 border-r border-primary/30 h-full flex flex-col relative overflow-hidden font-mono">
			{/* Matrix-like rain effect overlay */}
			<div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,255,0,0.03)1px,transparent_1px)] bg-[size:100%_2px] animate-matrix-rain pointer-events-none" />

			{/* Terminal-like header */}
			<div className="mb-4 md:mb-8 p-4 border-b border-primary/30 relative">
				<div className="flex">
					<Terminal className="mt-2  mr-1 h-4 w-4 text-primary animate-pulse" />
					<h2 className="text-xl font-bold text-primary tracking-wider effect">Project Orion</h2>
				</div>
				<div className="text-xs text-primary/70 mt-2 typing-effect-delay">
					<span className="inline-block w-2 h-2 bg-primary/80  mr-2" />v{state.gameConfig?.version}
				</div>
			</div>

			{!isCreateUserPage && (
				<div className="flex-1 px-2 md:px-4 overflow-y-auto">
					<nav className="space-y-1">
						{state.selectedPlanet && (
							<>
								{Object.entries(NAVIGATION_ITEMS).map(([section, items]) => (
									<div key={section} className="mb-4">
										<div className="text-xs text-primary/50 mb-2 pl-2">{section}</div>
										{items.map((item) => (
											<NavLink
												key={item.to}
												item={item}
												badge={item.hasBadge ? completedTasksCount : undefined}
											/>
										))}
									</div>
								))}
							</>
						)}
						{!state.selectedPlanet && (
							<NavLink
								item={NAVIGATION_ITEMS.MAIN.find((item) => item.translationKey === 'secure_coms')}
							/>
						)}
					</nav>
				</div>
			)}

			<div className="mt-auto">
				{/* Logout section with warning styling */}
				<div className="p-2 md:p-4 border-t border-red-500/30">
					<Button
						variant="ghost"
						onClick={handleLogout}
						className="w-full justify-start text-red-500 hover:bg-red-500/10 
						border border-transparent hover:border-red-500/30 
						group transition-all duration-300"
					>
						<LogOut className="mr-2 group-hover:animate-pulse" />
						<span className="font-mono group-hover:animate-glitch">
							{'>'} {t('common', 'navigation.terminate_session')}
						</span>
					</Button>
				</div>
			</div>
		</div>
	);
}
