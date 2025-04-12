'use client';

import { BaseMail, MailType } from 'shared-types';
import { Bell, Eye, Mail, MessageSquare, Rocket, Sword, Trash2, Menu } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { MailContent } from '@/components/MailContent';

import { useGame } from '@/contexts/GameContext';
import { api } from '@/lib/api';
import { withIdConverter } from '@/lib/firebase';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, limit, orderBy, query, Timestamp, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useTranslation } from '@/hooks/useTranslation';

type FilterCategory = 'all' | MailType;

const ITEMS_PER_PAGE = 20;

export default function SecureCommunications() {
	const { state } = useGame();
	const { t } = useTranslation('mail');

	const MAIL_CATEGORIES = [
		{ type: 'all', icon: Mail, label: t('categories.all.label') },
		{ type: 'spy', icon: Eye, label: t('categories.spy.label') },
		{ type: 'combat', icon: Sword, label: t('categories.combat.label') },
		{ type: 'mission', icon: Rocket, label: t('categories.mission.label') },
		{ type: 'private_message', icon: MessageSquare, label: t('categories.private_message.label') },
		{ type: 'game_message', icon: Bell, label: t('categories.game_message.label') },
	] as const;

	const [mails] = useCollectionData(
		state.gameConfig && state.currentUser
			? query(
					collection(db, `users/${state.currentUser?.id}/mails`).withConverter(withIdConverter),
					where('season_id', '==', state.gameConfig.season.current),
					orderBy('created_at', 'desc'),
					limit(ITEMS_PER_PAGE)
			  )
			: null
	);

	const onboardingMails = useMemo(() => {
		const now = Timestamp.now();

		return [
			{
				id: 'welcome_1',
				type: 'game_message',
				category: 'messages',
				created_at: now,
				sender_name: t('onboarding.welcome_1.sender'),
				title: t('onboarding.welcome_1.title'),
				content: t('onboarding.welcome_1.content'),
				read: false,
				archived: false,
				data: {
					action: t('onboarding.welcome_1.action'),
					priority: t('onboarding.welcome_1.priority'),
					link: '/dashboard',
				},
				ttl: Timestamp.fromMillis(1000 * 60 * 60 * 24 * 30),
			},
			{
				id: 'welcome_2',
				type: 'private_message',
				category: 'messages',
				created_at: Timestamp.fromMillis(now.toMillis() - 1000),
				sender_name: t('onboarding.welcome_2.sender'),
				title: t('onboarding.welcome_2.title'),
				content: t('onboarding.welcome_2.content'),
				read: false,
				archived: false,
				data: {},
				ttl: Timestamp.fromMillis(1000 * 60 * 60 * 24 * 30),
			},
			{
				id: 'welcome_3',
				type: 'private_message',
				category: 'messages',
				created_at: Timestamp.fromMillis(now.toMillis() - 2000),
				sender_name: t('onboarding.welcome_3.sender'),
				title: t('onboarding.welcome_3.title'),
				content: t('onboarding.welcome_3.content'),
				read: false,
				archived: false,
				data: {
					friendship_level: t('onboarding.welcome_3.data.friendship_level'),
					blackmail_material: t('onboarding.welcome_3.data.blackmail_material'),
				},
				ttl: Timestamp.fromMillis(1000 * 60 * 60 * 24 * 30),
			},
		];
	}, [t]);

	const [selectedMail, setSelectedMail] = useState<BaseMail | null>(null);
	const [activeCategory, setActiveCategory] = useState<FilterCategory>('all');
	const [isViewingMail, setIsViewingMail] = useState(false);
	const [isSidebarOpen, setIsSidebarOpen] = useState(true);

	const getMailIcon = (type: string) => {
		const category = MAIL_CATEGORIES.find((cat) => cat.type === type);
		return category ? <category.icon className="h-4 w-4" /> : <Mail className="h-4 w-4" />;
	};

	const deleteMail = async (id: string) => {
		try {
			// Check if this is a game message
			const mailToDelete = mails?.find((m) => m.id === id);
			if (mailToDelete?.type === 'game_message' || mailToDelete?.id.startsWith('welcome')) {
				return; // Prevent deletion of game messages
			}

			await api.updateMail({ mail_id: id, deleted: true });
			if (selectedMail?.id === id) {
				setSelectedMail(null);
				setIsViewingMail(false);
			}
		} catch (error) {
			console.error('Error deleting mail:', error);
		}
	};

	const markAsRead = async (id: string) => {
		if (id.startsWith('welcome')) return;
		try {
			await api.updateMail({ mail_id: id, read: true });
		} catch (error) {
			console.error('Error marking mail as read:', error);
		}
	};

	const getUnreadCount = (category: FilterCategory) => {
		return mails?.filter((m) => !m.read && (category === 'all' || m.type === category)).length || 0;
	};

	const handleMailClick = (mail: BaseMail) => {
		setSelectedMail(mail);
		setIsViewingMail(true);
		if (!mail.read) {
			markAsRead(mail.id);
		}
	};

	const displayedMails =
		state.currentUser?.onboarding_step === 'check-mails'
			? onboardingMails
			: mails?.filter((mail) => activeCategory === 'all' || mail.type === activeCategory) || [];

	return (
		<div className="space-y-6">
			<Card className="border border-primary h-[calc(100vh-12rem)] shadow-2xl shadow-primary/20 overflow-hidden">
				<CardHeader className="border-b bg-gray-900 sticky top-0 z-10">
					<CardTitle className="text-xl flex items-center justify-between gap-2">
						<span className="text-primary font-mono">{t('page.title')}</span>
						<Button variant="ghost" className="lg:hidden" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
							<Menu className="h-5 w-5" />
						</Button>
					</CardTitle>
				</CardHeader>
				<CardContent className="p-0 h-[calc(100%-4rem)] bg-gray-900/95 relative">
					<div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] absolute inset-0">
						<div
							className={`border-r border-primary/20 p-4 space-y-4 bg-gray-900 overflow-y-auto
							${isSidebarOpen ? 'block' : 'hidden'} 
							lg:block
							${!isViewingMail ? 'absolute lg:relative inset-0 z-20' : 'hidden lg:block'}`}
						>
							<div className="space-y-2">
								{MAIL_CATEGORIES.map((category) => (
									<Button
										key={category.type}
										variant={activeCategory === category.type ? 'default' : 'ghost'}
										className="w-full justify-start gap-2 h-12"
										onClick={() => {
											setActiveCategory(category.type);
											setIsViewingMail(false);
										}}
									>
										<category.icon className="h-4 w-4" />
										<span>{category.label}</span>
										{getUnreadCount(category.type) > 0 && (
											<span className="ml-auto bg-yellow-500 text-black px-2 py-0.5 rounded-full text-xs">
												{getUnreadCount(category.type)}
											</span>
										)}
									</Button>
								))}
							</div>
						</div>

						<div
							className={`flex flex-col h-full overflow-y-auto
							${isSidebarOpen && !isViewingMail ? 'hidden lg:flex' : 'flex'}`}
						>
							{!isViewingMail ? (
								<div className="flex-1 p-4">
									<div className="space-y-2">
										{displayedMails.length === 0 ? (
											<div className="flex flex-col items-center justify-center h-48 text-gray-400">
												<Mail className="h-12 w-12 mb-4 opacity-50" />
												<p className="text-lg font-medium">{t('page.empty.title')}</p>
												<p className="text-sm">
													{activeCategory === 'all'
														? t('page.empty.inbox_empty')
														: t('page.empty.category_empty', {
																category:
																	MAIL_CATEGORIES.find(
																		(cat) => cat.type === activeCategory
																	)?.label.toLowerCase() || 'messages',
														  })}
												</p>
											</div>
										) : (
											<>
												{displayedMails.map((mail) => (
													<div
														key={mail.id}
														className={`p-3 border border-primary/30 rounded-md cursor-pointer transition-all duration-300 hover:scale-[1.01] hover:bg-gray-800 hover:border-primary ${
															!mail.read ? 'border-l-4 border-l-yellow-500' : ''
														}`}
														onClick={() => handleMailClick(mail)}
													>
														<div className="flex items-center justify-between">
															<div className="flex items-center gap-2">
																{getMailIcon(mail.type)}
																<div className="flex flex-col">
																	<span className="font-medium text-blue-400">
																		{mail.title}
																	</span>
																	<span className="text-xs text-gray-400">
																		{t('page.from')} {mail.sender_name}
																	</span>
																</div>
															</div>
															{mail.type === 'game_message' ? null : (
																<Button
																	variant="ghost"
																	size="sm"
																	onClick={(e) => {
																		e.stopPropagation();
																		deleteMail(mail.id);
																	}}
																>
																	<Trash2 className="h-4 w-4" />
																</Button>
															)}
														</div>
														<p className="text-xs text-primary/60 mt-1">
															{new Date(mail.created_at).toLocaleString()}
														</p>
													</div>
												))}
											</>
										)}
									</div>
								</div>
							) : (
								<div className="flex-1 p-6">
									<div className="mb-4 sticky top-0 bg-gray-900 z-10 py-2 flex justify-between">
										<Button
											variant="outline"
											onClick={() => setIsViewingMail(false)}
											className="gap-2"
										>
											<Mail className="h-4 w-4" />
											{t('page.back_to_inbox')}
										</Button>
										{selectedMail?.type === 'game_message' ? null : (
											<Button
												variant="destructive"
												onClick={() => deleteMail(selectedMail?.id || '')}
												className="gap-2"
											>
												<Trash2 className="h-4 w-4" />
												{t('page.delete_mail')}
											</Button>
										)}
									</div>
									{selectedMail && <MailContent mail={selectedMail} />}
								</div>
							)}
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
