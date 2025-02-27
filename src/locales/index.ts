import enCommon from './en/common.json';
// import enAuth from './en/auth.json';
// import enDashboard from './en/dashboard.json';
// import enStructures from './en/structures.json';
// import enResearch from './en/research.json';
// import enUser from './en/user.json';
// import enTrading from './en/trading.json';
// import enRankings from './en/rankings.json';

import frCommon from './fr/common.json';
// import frAuth from './fr/auth.json';
// import frDashboard from './fr/dashboard.json';
// import frStructures from './fr/structures.json';
// import frResearch from './fr/research.json';
// import frUser from './fr/user.json';
// import frTrading from './fr/trading.json';
// import frRankings from './fr/rankings.json';

export type Locale = 'en' | 'fr';

export const resources = {
	en: {
		common: enCommon,
		// auth: enAuth,
		// dashboard: enDashboard,
		// structures: enStructures,
		// research: enResearch,
		// user: enUser,
		// trading: enTrading,
		// rankings: enRankings,
	},
	fr: {
		common: frCommon,
		// auth: frAuth,
		// dashboard: frDashboard,
		// structures: frStructures,
		// research: frResearch,
		// user: frUser,
		// trading: frTrading,
		// rankings: frRankings,
	},
};

export const defaultLocale: Locale = 'en';
