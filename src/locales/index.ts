import enCommon from './en/common.json';
import enAuth from './en/auth.json';
import enDashboard from './en/dashboard.json';
import enStructures from './en/structures.json';
import enResearchs from './en/researchs.json';
import enUser from './en/user.json';
import enTrading from './en/trading.json';
import enRankings from './en/rankings.json';
import enHome from './en/home.json';

import frCommon from './fr/common.json';
import frAuth from './fr/auth.json';
import frDashboard from './fr/dashboard.json';
import frStructures from './fr/structures.json';
import frResearchs from './fr/researchs.json';
import frUser from './fr/user.json';
import frTrading from './fr/trading.json';
import frRankings from './fr/rankings.json';
import frHome from './fr/home.json';

export type Locale = 'en' | 'fr';

export const resources = {
	en: {
		common: enCommon,
		auth: enAuth,
		dashboard: enDashboard,
		structures: enStructures,
		researchs: enResearchs,
		user: enUser,
		trading: enTrading,
		rankings: enRankings,
		home: enHome,
	},
	fr: {
		common: frCommon,
		auth: frAuth,
		dashboard: frDashboard,
		structures: frStructures,
		researchs: frResearchs,
		user: frUser,
		trading: frTrading,
		rankings: frRankings,
		home: frHome,
	},
};

export const defaultLocale: Locale = 'en';
