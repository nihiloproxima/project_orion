'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
	LogOut,
	Terminal,
	Computer,
	Building,
	FlaskConical,
	Rocket,
	Eye,
	User,
	ArrowRight,
	Trophy,
	MailIcon,
	Shield,
	ShoppingCart,
	CheckCircle2,
	Factory,
} from 'lucide-react';
import { useGame } from '../contexts/GameContext';

// Create a reusable NavLink component
const NavLink = ({ item, badge }: { item: any; badge?: number }) => (
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
				{`> ${item.label}`}
			</span>
			{badge !== undefined && badge > 0 && (
				<span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-2 py-0.5 rounded-full">
					{badge}
				</span>
			)}
		</Button>
	</Link>
);

export function Sidebar() {
	const { logout } = useAuth();
	const { state } = useGame();
	const { theme, setTheme } = useTheme();
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
		{ to: string; icon: any; label: string; color: string; hasBadge?: boolean }[]
	> = {
		MAIN: [
			{
				to: '/dashboard',
				icon: Computer,
				label: 'DASHBOARD',
				color: 'primary',
			},
			{
				to: '/secure-communications',
				icon: MailIcon,
				label: 'SECURE_COMS',
				color: 'blue',
			},
			{
				to: '/tasks',
				icon: CheckCircle2,
				label: 'TASKS',
				color: 'blue',
				hasBadge: true,
			},
			{
				to: `/user/${state?.currentUser?.id}`,
				icon: User,
				label: 'USER_PROFILE',
				color: 'blue',
			},
			{
				to: '/galaxy',
				icon: Eye,
				label: 'GALAXY_MAP',
				color: 'purple',
			},
			{
				to: '/rankings',
				icon: Trophy,
				label: 'RANKINGS',
				color: 'blue',
			},
			{
				to: '/fleet-movements',
				icon: ArrowRight,
				label: 'FLEET_MOVEMENTS',
				color: 'blue',
			},
		],
		PLANET: [
			{
				to: '/structures',
				icon: Building,
				label: 'STRUCTURES',
				color: 'primary',
			},
			{
				to: '/researchs',
				icon: FlaskConical,
				label: 'RESEARCH_LAB',
				color: 'green',
			},
			{
				to: '/defenses',
				icon: Shield,
				label: 'DEFENSES',
				color: 'blue',
			},
			{
				to: '/shipyard',
				icon: Factory,
				label: 'SHIPYARD',
				color: 'blue',
			},
			{
				to: '/fleet',
				icon: Rocket,
				label: 'FLEET',
				color: 'blue',
			},
		],
		// OTHER: [
		// {
		// 	to: '/shop',
		// 	icon: ShoppingCart,
		// 	label: 'SHOP',
		// 	color: 'blue',
		// },
		// ],
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
					<span className="inline-block w-2 h-2 bg-primary/80  mr-2" />v{state.version}
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
							<NavLink item={NAVIGATION_ITEMS.OTHER.find((item) => item.label === 'SECURE_COMS')} />
						)}
					</nav>
				</div>
			)}

			<div className="mt-auto">
				{/* Theme selector with cyberpunk styling */}
				<div className="p-2 md:p-4 border-t border-primary/30">
					<Select defaultValue={theme} onValueChange={setTheme}>
						<SelectTrigger className="w-full bg-black border-primary/30 text-primary hover:border-primary/60 transition-colors">
							<SelectValue placeholder="SELECT_THEME" />
						</SelectTrigger>
						<SelectContent className="bg-black/95 border-primary/30">
							{[
								{ value: 'default', label: 'MATRIX_GREEN', color: 'emerald' },
								{ value: 'purple', label: 'NEON_PURPLE', color: 'purple' },
								{ value: 'blue', label: 'CYBER_BLUE', color: 'blue' },
								{ value: 'synthwave', label: 'SYNTHWAVE', color: 'pink' },
							].map((item) => (
								<SelectItem
									key={item.value}
									value={item.value}
									className={`text-${item.color}-400 hover:bg-${item.color}-500/20`}
								>
									{`> ${item.label}`}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

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
						<span className="font-mono group-hover:animate-glitch">{'>'} TERMINATE_SESSION</span>
					</Button>
				</div>
			</div>
		</div>
	);
}
