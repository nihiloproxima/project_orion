import enCommon from './en/common.json';
import enAuth from './en/auth.json';
import enDashboard from './en/dashboard.json';
import enStructures from './en/structures.json';
import enResearchs from './en/researchs.json';
import enUser from './en/user.json';
import enTrading from './en/trading.json';
import enRankings from './en/rankings.json';
import enHome from './en/home.json';
import enTechnologies from './en/technologies.json';
import enPlanets from './en/planets.json';
import enFleet from './en/fleet.json';
import enGalaxy from './en/galaxy.json';
import enShipyard from './en/shipyard.json';
import enMail from './en/mail.json';
import frCommon from './fr/common.json';
import frAuth from './fr/auth.json';
import frDashboard from './fr/dashboard.json';
import frStructures from './fr/structures.json';
import frResearchs from './fr/researchs.json';
import frUser from './fr/user.json';
import frTrading from './fr/trading.json';
import frRankings from './fr/rankings.json';
import frHome from './fr/home.json';
import frTechnologies from './fr/technologies.json';
import frPlanets from './fr/planets.json';
import frFleet from './fr/fleet.json';
import frGalaxy from './fr/galaxy.json';
import frShipyard from './fr/shipyard.json';
import frMail from './fr/mail.json';
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
		technologies: enTechnologies,
		planets: enPlanets,
		fleet: enFleet,
		galaxy: enGalaxy,
		shipyard: enShipyard,
		mail: enMail,
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
		technologies: frTechnologies,
		planets: frPlanets,
		fleet: frFleet,
		galaxy: frGalaxy,
		shipyard: frShipyard,
		mail: frMail,
	},
};

export const defaultLocale: Locale = 'en';
