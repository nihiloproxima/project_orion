import Joi from 'joi';
import admin from 'firebase-admin';
import assert from '../../rules/asserts';
import db from '../../database/db';
import utils from '../../rules/utils';
import { StructureType } from 'shared-types';

interface EndStructureUpgradeParams {
	planet_id: string;
	structure_type: StructureType;
	construction_end_ms: number;
}

const schema = Joi.object<EndStructureUpgradeParams>({
	planet_id: Joi.string().required(),
	structure_type: Joi.string().required(),
	construction_end_ms: Joi.number().required(),
});

export async function endStructureUpgrade(body: EndStructureUpgradeParams) {
	const params = Joi.attempt(body, schema);

	const gameConfig = await db.getGameConfig();

	await admin.firestore().runTransaction(async (tx) => {
		const [planet] = await Promise.all([db.getPlanet(tx, gameConfig.season.current, params.planet_id)]);

		const structure = utils.getStructure(planet, params.structure_type);

		assert.isEqual(
			structure.construction_finish_time?.toMillis(),
			params.construction_end_ms,
			`Structure ${params.structure_type} construction finish time does not match with params`
		);

		const shouldImproveCapacity = structure.type === 'research_lab' && structure.level === 0;
		if (shouldImproveCapacity && planet.owner_id) {
			db.setUserResearchs(tx, planet.owner_id!, {
				capacity: admin.firestore.FieldValue.increment(1),
			});
		}

		structure.construction_finish_time = null;
		structure.construction_start_time = null;
		structure.level += structure.construction_levels || 0;
		structure.construction_levels = null;

		db.setPlanet(tx, gameConfig.season.current, planet.id, planet);
	});

	return {
		status: 'ok',
	};
}
