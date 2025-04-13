import Joi from 'joi';
import admin from 'firebase-admin';
import db from '../../database/db';
import planetCalculations from '../../rules/planet_calculations';
import researchsCalculations from '../../rules/researchs_calculations';
import utils from '../../rules/utils';
import { Planet, TechnologyId } from '../../models';
import { Timestamp } from 'firebase-admin/firestore';
import { addJob } from '../../bullmq/queue';
import { assert } from '../../rules/asserts';

interface StartResearchParams {
	planet_id: Planet['id'];
	technology_id: TechnologyId;
}

const schema = Joi.object<StartResearchParams>({
	planet_id: Joi.string().required(),
	technology_id: Joi.string().required(),
});
export async function startResearch(userId: string, body: StartResearchParams) {
	const params = Joi.attempt(body, schema);

	const gameConfig = await db.getGameConfig();

	const job = await admin.firestore().runTransaction(async (tx) => {
		const [userResearchs, planet] = await Promise.all([
			db.getUserResearchs(tx, userId),
			db.getPlanet(tx, gameConfig.season.current, params.planet_id),
		]);

		planetCalculations.calculatePlanetResources(gameConfig, planet, userResearchs);

		assert.isEqual(planet.owner_id, userId, 'User does not own this planet');

		const activeResearchCount = Object.values(userResearchs.technologies).filter(
			(tech) => tech.is_researching
		).length;

		assert.isGreaterThan(
			userResearchs.capacity,
			activeResearchCount,
			`Research capacity reached (${activeResearchCount}/${userResearchs.capacity})`
		);

		const researchConfig = utils.getResearchConfig(gameConfig, params.technology_id);

		// Check prerequisites
		for (const prereq of researchConfig.prerequisites) {
			const prerequisiteTech = userResearchs.technologies[prereq.technology_id];

			assert.isNotEqual(
				prerequisiteTech,
				undefined,
				`Missing prerequisite: ${prereq.technology_id} level ${prereq.required_level}`
			);
			assert.isGreaterThan(
				prerequisiteTech.level,
				prereq.required_level,
				`Missing prerequisite: ${prereq.technology_id} level ${prereq.required_level}`
			);
		}

		let technology = userResearchs.technologies[params.technology_id];

		if (!technology) {
			technology = {
				is_researching: false,
				researching_planet_id: planet.id,
				researching_planet_name: planet.name,
				research_finish_time: null,
				research_start_time: null,
				level: 0,
			};
		}

		assert.isNotEqual(technology.level, researchConfig.max_level, 'Research already maxed');
		assert.isEqual(technology.is_researching, false, 'Research already started');

		// Calculate costs with level scaling
		const costIncreaseCoef = Math.pow(2, technology.level);

		const costs = {
			metal: researchConfig.cost.base_metal * costIncreaseCoef,
			deuterium: researchConfig.cost.base_deuterium * costIncreaseCoef,
			microchips: researchConfig.cost.base_microchips * costIncreaseCoef,
		};

		for (const resource in costs) {
			assert.isGreaterThan(planet.resources[resource], costs[resource], `Insufficent ${resource} on planet`);
			planet.resources[resource] -= costs[resource];
		}

		// Calculate research time
		const now = Date.now();
		const researchTime = researchsCalculations.calculateResearchTimeMs(
			gameConfig,
			userResearchs,
			params.technology_id
		);
		const researchFinishTime = now + researchTime;

		// Update technology
		technology.is_researching = true;
		technology.research_start_time = Timestamp.fromMillis(now);
		technology.research_finish_time = Timestamp.fromMillis(researchFinishTime);
		userResearchs.technologies[params.technology_id] = technology;

		// Update user researchs
		db.setUserResearchs(tx, userId, userResearchs);

		// Update planet
		db.setPlanet(tx, gameConfig.season.current, planet.id, planet);

		return {
			delay: utils.msUntil(technology.research_finish_time),
			research_finish_time_ms: researchFinishTime,
		};
	});

	if (job) {
		await addJob(
			'endResearch',
			{
				user_id: userId,
				technology_id: params.technology_id,
				research_finish_time_ms: job.research_finish_time_ms,
			},
			job.delay
		);
	}

	return {
		status: 'ok',
	};
}
