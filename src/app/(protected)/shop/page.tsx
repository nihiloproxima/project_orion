'use client';

import { motion } from 'framer-motion';
import { CreditCard, Crown, Rocket, User, Palette, Globe, ChevronRight, Star } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGame } from '@/contexts/GameContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { containerVariants, itemVariants } from '@/lib/animations';

// Mock data - Replace with actual data from your backend
const SHOP_ITEMS = {
	subscriptions: [
		{
			id: 'premium-monthly',
			name: 'Premium Monthly',
			price: 9.99,
			description: 'Access to premium features, +50% resource production, exclusive skins',
			features: ['Premium Ships', 'Resource Boost', 'Priority Support', 'Exclusive Themes'],
		},
		{
			id: 'premium-yearly',
			name: 'Premium Yearly',
			price: 99.99,
			description: 'All premium features at a discount + exclusive yearly rewards',
			features: ['Premium Ships', 'Resource Boost', 'Priority Support', 'Exclusive Themes', 'Yearly Rewards'],
		},
	],
	credits: [
		{ id: 'credits-500', amount: 500, price: 4.99, bonus: 0 },
		{ id: 'credits-1000', amount: 1000, price: 9.99, bonus: 50 },
		{ id: 'credits-2000', amount: 2000, price: 19.99, bonus: 150 },
		{ id: 'credits-5000', amount: 5000, price: 49.99, bonus: 500 },
	],
	ships: [
		{
			id: 'premium-cruiser',
			name: 'Premium Cruiser',
			price: 1000,
			image: '/images/ships/premium_cruiser.webp',
			stats: {
				attack: 1200,
				defense: 800,
				speed: 15000,
			},
		},
		// Add more premium ships
	],
	avatars: [
		{
			id: 'premium-avatar-1',
			name: 'Cyber Commander',
			price: 200,
			image: '/images/avatars/premium_1.webp',
		},
		// Add more premium avatars
	],
	themes: [
		{
			id: 'neon-dreams',
			name: 'Neon Dreams',
			price: 500,
			preview: '/images/themes/neon_dreams.webp',
		},
		// Add more themes
	],
	planetSkins: [
		{
			id: 'crystal-world',
			name: 'Crystal World',
			price: 800,
			preview: '/images/planets/crystal_world.webp',
		},
		// Add more planet skins
	],
};

function ShopSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
	return (
		<div className="space-y-4">
			<div className="flex items-center gap-2">
				{icon}
				<h2 className="text-xl font-bold neon-text">{title}</h2>
			</div>
			{children}
		</div>
	);
}

export default function Shop() {
	const { state } = useGame();

	return (
		<ErrorBoundary>
			<motion.div
				variants={containerVariants}
				initial="hidden"
				animate="show"
				className="container mx-auto space-y-6"
			>
				<motion.div variants={itemVariants} className="flex justify-between items-center">
					<div>
						<h1 className="text-3xl font-bold neon-text mb-2">GALACTIC MARKETPLACE</h1>
						<p className="text-muted-foreground">
							Enhance your empire with premium items and exclusive content
						</p>
					</div>
					<div className="flex items-center gap-2">
						<Star className="h-5 w-5 text-yellow-400" />
						<span className="text-lg font-bold">{0} Credits</span>
					</div>
				</motion.div>

				<Tabs defaultValue="subscriptions" className="space-y-4">
					<TabsList className="grid grid-cols-3 lg:grid-cols-6 gap-2">
						<TabsTrigger value="subscriptions" className="flex items-center gap-2">
							<Crown className="h-4 w-4" /> Premium
						</TabsTrigger>
						<TabsTrigger value="credits" className="flex items-center gap-2">
							<CreditCard className="h-4 w-4" /> Credits
						</TabsTrigger>
						<TabsTrigger value="ships" className="flex items-center gap-2">
							<Rocket className="h-4 w-4" /> Ships
						</TabsTrigger>
						<TabsTrigger value="avatars" className="flex items-center gap-2">
							<User className="h-4 w-4" /> Avatars
						</TabsTrigger>
						<TabsTrigger value="themes" className="flex items-center gap-2">
							<Palette className="h-4 w-4" /> Themes
						</TabsTrigger>
						<TabsTrigger value="planetSkins" className="flex items-center gap-2">
							<Globe className="h-4 w-4" /> Planet Skins
						</TabsTrigger>
					</TabsList>

					<TabsContent value="subscriptions" className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{SHOP_ITEMS.subscriptions.map((sub) => (
								<Card
									key={sub.id}
									className="bg-card/50 backdrop-blur-sm neon-border hover:shadow-[0_0_20px_rgba(32,224,160,0.3)] transition-all duration-300"
								>
									<CardHeader>
										<CardTitle className="flex justify-between items-center">
											<span className="flex items-center gap-2">
												<Crown className="h-5 w-5 text-yellow-400" />
												{sub.name}
											</span>
											<span className="text-2xl font-bold">${sub.price}</span>
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										<p className="text-muted-foreground">{sub.description}</p>
										<ul className="space-y-2">
											{sub.features.map((feature) => (
												<li key={feature} className="flex items-center gap-2">
													<ChevronRight className="h-4 w-4 text-primary" />
													{feature}
												</li>
											))}
										</ul>
										<Button className="w-full">Subscribe Now</Button>
									</CardContent>
								</Card>
							))}
						</div>
					</TabsContent>

					<TabsContent value="credits" className="space-y-4">
						<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
							{SHOP_ITEMS.credits.map((pack) => (
								<Card
									key={pack.id}
									className="bg-card/50 backdrop-blur-sm neon-border hover:shadow-[0_0_20px_rgba(32,224,160,0.3)] transition-all duration-300"
								>
									<CardHeader>
										<CardTitle className="text-center">
											<div className="text-2xl font-bold text-primary">
												{pack.amount.toLocaleString()} Credits
											</div>
											{pack.bonus > 0 && (
												<div className="text-sm text-green-400">+{pack.bonus} Bonus</div>
											)}
										</CardTitle>
									</CardHeader>
									<CardContent>
										<Button className="w-full">${pack.price.toFixed(2)}</Button>
									</CardContent>
								</Card>
							))}
						</div>
					</TabsContent>

					{/* Add similar TabsContent components for ships, avatars, themes, and planetSkins */}
					{/* Each section should follow the same pattern but with appropriate layouts and content */}
				</Tabs>
			</motion.div>
		</ErrorBoundary>
	);
}
