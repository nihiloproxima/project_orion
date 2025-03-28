'use client';

import Link from 'next/link';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Rocket, Globe2, Cpu, Shield, Users, Zap, BarChart2 } from 'lucide-react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { AnimatedSpaceBackground } from '../components/AnimatedSpaceBackground';

export default function Home() {
	const targetRef = useRef(null);
	const { scrollYProgress } = useScroll({
		target: targetRef,
		offset: ['start start', 'end start'],
	});

	const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
	const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

	const { isAuthenticated } = useAuth();
	const { state } = useGame();
	const { t } = useLanguage();

	const container = {
		hidden: { opacity: 0 },
		show: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
			},
		},
	};

	const item = {
		hidden: { opacity: 0, y: 20 },
		show: { opacity: 1, y: 0 },
	};

	const fadeInUp = {
		initial: { opacity: 0, y: 60 },
		animate: { opacity: 1, y: 0 },
		transition: { duration: 0.6 },
	};

	const floatingAnimation = {
		initial: { y: 0 },
		animate: {
			y: [-10, 10, -10],
			transition: {
				duration: 6,
				repeat: Infinity,
				ease: 'easeInOut',
			},
		},
	};

	return (
		<div className="min-h-screen bg-background cyber-grid overflow-hidden" ref={targetRef}>
			{/* Navigation - make it fixed and ensure it's above everything */}
			{!isAuthenticated && (
				<nav className="fixed top-0 left-0 right-0 p-6 flex justify-between items-center backdrop-blur-sm border-b neon-border z-[999]">
					<div className="flex items-center gap-2">
						<Rocket className="w-8 h-8 text-primary animate-pulse" />
						<h1 className="text-2xl font-bold neon-text">PROJECT ORION</h1>
					</div>
					<div className="space-x-4">
						<Link href="/auth/login" passHref legacyBehavior>
							<Button
								type="button"
								variant="outline"
								className="neon-border hover:bg-primary/20"
								onClick={() => (window.location.href = '/auth/login')}
							>
								{t('common', 'navigation.login')}
							</Button>
						</Link>
						<Link href="/auth/register" passHref legacyBehavior>
							<Button
								type="button"
								className="bg-primary hover:bg-primary/80 text-primary-foreground"
								onClick={() => (window.location.href = '/auth/register')}
							>
								{t('common', 'navigation.register')}
							</Button>
						</Link>
					</div>
				</nav>
			)}

			{/* Enhanced Hero Section */}
			<motion.div style={{ y, opacity }} className="container mx-auto px-4 py-24 text-center relative">
				<div className="absolute inset-0 bg-primary/5 blur-[100px] rounded-full animate-pulse"></div>
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="relative z-10"
				>
					{/* Decorative elements */}
					<motion.div
						animate={{
							rotate: 360,
							scale: [1, 1.1, 1],
						}}
						transition={{
							duration: 20,
							repeat: Infinity,
							ease: 'linear',
						}}
						className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-primary/20 rounded-full"
					/>
					<motion.div
						animate={{
							rotate: -360,
							scale: [1.1, 1, 1.1],
						}}
						transition={{
							duration: 15,
							repeat: Infinity,
							ease: 'linear',
						}}
						className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 border border-primary/30 rounded-full"
					/>

					<motion.h1
						className="text-7xl font-bold mb-6 neon-text tracking-tight relative"
						variants={floatingAnimation}
						initial="initial"
						animate="animate"
					>
						{t('home', 'title')}
					</motion.h1>

					<motion.p
						className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed"
						variants={fadeInUp}
						initial="initial"
						whileInView="animate"
						viewport={{ once: true }}
					>
						{t('home', 'subtitle')}
					</motion.p>

					{/* Enhanced player count display */}
					<motion.div
						className="text-lg text-muted-foreground mb-8 flex items-center justify-center gap-2 bg-primary/5 backdrop-blur-sm p-4 rounded-lg w-fit mx-auto"
						whileHover={{ scale: 1.05 }}
					>
						<Users className="w-5 h-5 text-primary animate-pulse" />
						<span className="neon-text font-mono">{state.activePlayers.length}</span>
						<span className="typing-text">{t('home', 'players_online')}</span>
					</motion.div>

					{/* Enhanced CTA button */}
					<Link href={isAuthenticated ? '/dashboard' : '/auth/register'}>
						<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
							<Button
								size="lg"
								className="px-8 py-6 text-xl bg-primary hover:bg-primary/80 text-primary-foreground neon-border group relative overflow-hidden"
							>
								<motion.span
									className="relative z-10 flex items-center gap-2"
									animate={{
										scale: [1, 1.05, 1],
									}}
									transition={{
										duration: 2,
										repeat: Infinity,
										ease: 'easeInOut',
									}}
								>
									{isAuthenticated ? t('home', 'return_to_dashboard') : t('home', 'begin_journey')}
									<Rocket className="w-5 h-5" />
								</motion.span>
								<motion.div
									className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0"
									animate={{
										x: ['-100%', '100%'],
									}}
									transition={{
										duration: 3,
										repeat: Infinity,
										ease: 'easeInOut',
									}}
								/>
							</Button>
						</motion.div>
					</Link>
				</motion.div>
			</motion.div>

			{/* Enhanced Key Features section */}
			<motion.div
				variants={container}
				initial="hidden"
				whileInView="show"
				viewport={{ once: true }}
				className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-6"
			>
				<motion.div
					variants={item}
					whileHover={{
						scale: 1.05,
						transition: { duration: 0.2 },
					}}
				>
					<Card className="bg-card/50 backdrop-blur-sm neon-border hover:shadow-[0_0_20px_rgba(32,224,160,0.3)] transition-all duration-300">
						<CardHeader>
							<div className="flex items-center gap-3">
								<Globe2 className="w-6 h-6 text-primary" />
								<CardTitle className="neon-text-secondary">
									{t('home', 'features.expansion.title')}
								</CardTitle>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							<Image
								src="/images/homepage_colony.png"
								width={400}
								height={200}
								alt={t('home', 'features.expansion.image_alt')}
								className="rounded-lg w-full object-cover h-48"
							/>
							<p className="text-muted-foreground">{t('home', 'features.expansion.description')}</p>
						</CardContent>
					</Card>
				</motion.div>

				<motion.div
					variants={item}
					whileHover={{
						scale: 1.05,
						transition: { duration: 0.2 },
					}}
				>
					<Card className="bg-card/50 backdrop-blur-sm neon-border hover:shadow-[0_0_20px_rgba(32,224,160,0.3)] transition-all duration-300">
						<CardHeader>
							<div className="flex items-center gap-3">
								<Shield className="w-6 h-6 text-accent" />
								<CardTitle className="neon-text-accent">{t('home', 'features.combat.title')}</CardTitle>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							<Image
								src="/images/homepage_combat.png"
								width={400}
								height={200}
								alt={t('home', 'features.combat.image_alt')}
								className="rounded-lg w-full object-cover h-48"
							/>
							<p className="text-muted-foreground">{t('home', 'features.combat.description')}</p>
						</CardContent>
					</Card>
				</motion.div>

				<motion.div
					variants={item}
					whileHover={{
						scale: 1.05,
						transition: { duration: 0.2 },
					}}
				>
					<Card className="bg-card/50 backdrop-blur-sm neon-border hover:shadow-[0_0_20px_rgba(32,224,160,0.3)] transition-all duration-300">
						<CardHeader>
							<div className="flex items-center gap-3">
								<BarChart2 className="w-6 h-6 text-primary" />
								<CardTitle className="neon-text">{t('home', 'features.economy.title')}</CardTitle>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							<Image
								src="/images/homepage_economy.png"
								width={400}
								height={200}
								alt={t('home', 'features.economy.image_alt')}
								className="rounded-lg w-full object-cover h-48"
							/>
							<p className="text-muted-foreground">{t('home', 'features.economy.description')}</p>
						</CardContent>
					</Card>
				</motion.div>
			</motion.div>

			{/* Enhanced Latest Update Section */}
			<motion.div
				initial={{ opacity: 0 }}
				whileInView={{ opacity: 1 }}
				viewport={{ once: true }}
				className="container mx-auto px-4 py-12"
			>
				<Card className="bg-card/50 backdrop-blur-sm neon-border relative overflow-hidden">
					<motion.div
						className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5"
						animate={{
							backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
						}}
						transition={{
							duration: 15,
							repeat: Infinity,
							ease: 'linear',
						}}
					/>
					<CardHeader>
						<CardTitle className="text-2xl neon-text flex items-center gap-2">
							<Zap className="w-6 h-6" />
							{t('home', 'update.title', { version: 'v0.0.1' })}
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6 relative z-10">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
							<div className="space-y-4">
								<h3 className="text-lg font-semibold neon-text-secondary flex items-center gap-2">
									<Cpu className="w-5 h-5" />
									{t('home', 'update.features_title')}
								</h3>
								<ul className="space-y-2">
									{[
										t('home', 'update.features.fleet'),
										t('home', 'update.features.mail'),
										t('home', 'update.features.transport'),
										t('home', 'update.features.queue'),
									].map((feature, index) => (
										<motion.li
											key={index}
											initial={{ opacity: 0, x: -20 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ delay: index * 0.1 }}
											className="flex items-center gap-2 text-muted-foreground"
										>
											<div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
											{feature}
										</motion.li>
									))}
								</ul>
							</div>

							<div className="space-y-4">
								<h3 className="text-lg font-semibold neon-text-accent flex items-center gap-2">
									<Shield className="w-5 h-5" />
									{t('home', 'update.improvements_title')}
								</h3>
								<ul className="space-y-2">
									{[
										t('home', 'update.improvements.queue'),
										t('home', 'update.improvements.galaxy'),
										t('home', 'update.improvements.mission'),
									].map((improvement, index) => (
										<motion.li
											key={index}
											initial={{ opacity: 0, x: -20 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ delay: index * 0.1 }}
											className="flex items-center gap-2 text-muted-foreground"
										>
											<div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
											{improvement}
										</motion.li>
									))}
								</ul>
							</div>
						</div>
					</CardContent>
				</Card>
			</motion.div>

			{/* Add position-fixed and lower z-index to background */}
			<AnimatedSpaceBackground />
		</div>
	);
}
