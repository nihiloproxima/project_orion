import Joi from 'joi';
import admin from 'firebase-admin';
import assert from '../../rules/asserts';
import db from '../../database/db';
import planetCalculations from '../../rules/planet_calculations';
import structuresCalculations from '../../rules/structures_calculations';
import utils from '../../rules/utils';
import { StructureType } from '../../models';
import { Timestamp } from 'firebase-admin/firestore';
import { addJob } from '../../bullmq/queue';

interface UpgradeStructureParams {
	planet_id: string;
	structure_type: StructureType;
	upgrades_count: number;
}

const schema = Joi.object<UpgradeStructureParams>({
	planet_id: Joi.string().required(),
	structure_type: Joi.string().required(),
	upgrades_count: Joi.number().required(),
});

export async function upgradeStructure(userId: string, body: UpgradeStructureParams) {
	const params = Joi.attempt(body, schema);

	const gameConfig = await db.getGameConfig();

	const job = await admin.firestore().runTransaction(async (tx) => {
		const [planet, userResearchs, userTasks] = await Promise.all([
			db.getPlanet(tx, gameConfig.season.current, params.planet_id),
			db.getUserResearchs(tx, userId),
			db.getUserTasks(tx, userId),
		]);

		assert.isEqual(planet.owner_id, userId);

		// Calculate planet resources
		planetCalculations.calculatePlanetResources(gameConfig, planet, userResearchs);

		const structureConfig = utils.getStructureConfig(gameConfig, params.structure_type);
		const structure = utils.getStructure(planet, params.structure_type);

		if (structureConfig.max_level) {
			assert.isNotEqual(
				structure.level + params.upgrades_count,
				structureConfig.max_level,
				`Can not upgrade structure ${params.structure_type}. Max level reached`
			);
		}

		const canUpgradeStructure = structuresCalculations.canUpgradeStructure(
			gameConfig,
			planet,
			structure.type,
			structure.level,
			params.upgrades_count
		);

		assert.isEqual(canUpgradeStructure.allowed, true, canUpgradeStructure.reason);

		// Update planet structure
		structure.construction_levels = params.upgrades_count;
		structure.construction_start_time = Timestamp.now();
		structure.construction_finish_time = Timestamp.fromMillis(
			Date.now() + utils.secondsToMs(structureConfig.construction_time.seconds * params.upgrades_count)
		);

		planet.resources.metal -= canUpgradeStructure.metal_cost;

		db.setPlanet(tx, gameConfig.season.current, planet.id, planet);

		// Update userTasks
		db.setUserTasks(tx, userId, userTasks);

		return {
			construction_end_ms: structure.construction_finish_time.toMillis(),
			delay: utils.msUntil(structure.construction_finish_time),
		};
	});

	if (job) {
		await addJob(
			'endStructureUpgrade',
			{
				planet_id: params.planet_id,
				structure_type: params.structure_type,
				construction_end_ms: job.construction_end_ms,
			},
			job.delay
		);
	}

	return {
		status: 'ok',
	};
}
