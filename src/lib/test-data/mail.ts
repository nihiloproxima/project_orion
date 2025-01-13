import { BaseMail, CombatMail, SpyMail } from '@/models/mail';

const generateId = () => Math.random().toString(36).substring(2, 15);

const generateSpyReport = (ownerId: string): SpyMail => ({
	id: generateId(),
	type: 'spy',
	category: 'reports',
	created_at: Date.now() - Math.random() * 86400000, // Random time in last 24h
	owner_id: ownerId,
	sender_name: 'Spy Probe Alpha',
	title: `Spy Report: Planet (${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 100)})`,
	read: Math.random() > 0.5,
	archived: false,
	data: {
		target_planet_id: generateId(),
		target_owner_id: generateId(),
		target_coordinates: {
			x: Math.floor(Math.random() * 100),
			y: Math.floor(Math.random() * 100),
		},
		resources: {
			current: {
				metal: Math.floor(Math.random() * 100000),
				deuterium: Math.floor(Math.random() * 50000),
				microchips: Math.floor(Math.random() * 25000),
			},
		},
		structures: [
			{
				type: 'metal_mine',
				level: Math.floor(Math.random() * 10),
				is_under_construction: false,
			},
			{
				type: 'deuterium_synthesizer',
				level: Math.floor(Math.random() * 8),
				is_under_construction: false,
			},
			{
				type: 'microchip_factory',
				level: Math.floor(Math.random() * 6),
				is_under_construction: true,
			},
		],
		research: [
			{ id: 'espionage_tech', level: 1, is_researching: false },
			{ id: 'weapons_tech', level: 2, is_researching: true },
		],
		ships: [
			{ type: 'cruiser', count: Math.floor(Math.random() * 5) },
			{ type: 'transport_ship', count: Math.floor(Math.random() * 10) },
		],
		defenses: [],
	},
});

const generateCombatReport = (ownerId: string): CombatMail => ({
	id: generateId(),
	type: 'combat',
	category: 'reports',
	created_at: Date.now() - Math.random() * 86400000,
	owner_id: ownerId,
	sender_name: 'Battle Computer',
	title: 'Combat Report: Victory at Alpha Centauri',
	read: Math.random() > 0.5,
	archived: false,
	data: {
		debris_field: {
			metal: Math.floor(Math.random() * 10000),
			deuterium: Math.floor(Math.random() * 5000),
			microchips: Math.floor(Math.random() * 2500),
		},
		battle_id: generateId(),
		location: {
			planet_id: generateId(),
			coordinates: {
				x: Math.floor(Math.random() * 100),
				y: Math.floor(Math.random() * 100),
			},
		},
		attackers: [
			{
				user_id: ownerId,
				name: 'Your Fleet',
				ships: [
					{ type: 'cruiser', count: 5 },
					{ type: 'transport_ship', count: 2 },
				],
				losses: [
					{ type: 'cruiser', count: 1 },
					{ type: 'transport_ship', count: 1 },
				],
			},
		],
		defenders: [
			{
				user_id: generateId(),
				name: 'Enemy Fleet',
				ships: [{ type: 'cruiser', count: 3 }],
				losses: [{ type: 'cruiser', count: 3 }],
			},
		],
		result: 'attacker_victory',
	},
});

const generatePrivateMessage = (ownerId: string): BaseMail => ({
	id: generateId(),
	type: 'private_message',
	category: 'messages',
	created_at: Date.now() - Math.random() * 86400000,
	owner_id: ownerId,
	sender_id: generateId(),
	sender_name: 'Commander Smith',
	title: 'Alliance Proposal',
	content:
		'Hey there! Would you be interested in forming an alliance? We could use someone with your strategic skills.',
	read: Math.random() > 0.5,
	archived: false,
	data: {},
});

const generateGameMessage = (ownerId: string): BaseMail => ({
	id: generateId(),
	type: 'game_message',
	category: 'messages',
	created_at: Date.now() - Math.random() * 86400000,
	owner_id: ownerId,
	sender_name: 'System',
	title: 'Welcome to Star Command',
	content: 'Welcome, Commander! Your journey begins now. Check out the tutorial to get started.',
	read: Math.random() > 0.5,
	archived: false,
	data: {},
});

const generateAIMessage = (ownerId: string): BaseMail => ({
	id: generateId(),
	type: 'ai_message',
	category: 'messages',
	created_at: Date.now() - Math.random() * 86400000,
	owner_id: ownerId,
	sender_name: 'AI Assistant',
	title: 'Strategic Analysis Complete',
	content:
		"I've analyzed your empire's current situation. Would you like to review my recommendations for optimal resource allocation?",
	read: Math.random() > 0.5,
	archived: false,
	data: {
		ai_confidence: 0.95,
		priority_level: 'high',
	},
});

const generateMissionReport = (ownerId: string): BaseMail => ({
	id: generateId(),
	type: 'mission',
	category: 'missions',
	created_at: Date.now() - Math.random() * 86400000,
	owner_id: ownerId,
	sender_name: 'Mission Control',
	title: 'Transport Mission Complete',
	content: 'Your transport fleet has successfully delivered resources to the target planet.',
	read: Math.random() > 0.5,
	archived: false,
	data: {
		mission_type: 'transport',
		resources_delivered: {
			metal: 5000,
			deuterium: 2000,
		},
		duration: 3600, // seconds
	},
});

export const generateTestMails = (ownerId: string, count: number = 20): BaseMail[] => {
	const mails: BaseMail[] = [];
	const generators = [
		generateSpyReport,
		generateCombatReport,
		generatePrivateMessage,
		generateGameMessage,
		generateAIMessage,
		generateMissionReport,
	];

	for (let i = 0; i < count; i++) {
		const generator = generators[Math.floor(Math.random() * generators.length)];
		mails.push(generator(ownerId));
	}

	return mails.sort((a, b) => b.created_at - a.created_at);
};
