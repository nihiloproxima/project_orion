import Joi from 'joi';
import admin from 'firebase-admin';
import db from '../../database/db';
import { TechnologyId } from '../../models/researchs_config';

export interface EndResearchParams {
	user_id: string;
	technology_id: TechnologyId;
	research_finish_time_ms: number;
}

const schema = Joi.object<EndResearchParams>({
	user_id: Joi.string().required(),
	technology_id: Joi.string().required(),
	research_finish_time_ms: Joi.number().required(),
});

export async function endResearch(data: EndResearchParams) {
	const params = Joi.attempt(data, schema);

	await admin.firestore().runTransaction(async (tx) => {
		const [userResearchs] = await Promise.all([db.getUserResearchs(tx, params.user_id)]);

		const technology = userResearchs.technologies[params.technology_id];
		if (
			!technology.is_researching ||
			technology.research_finish_time?.toMillis() !== params.research_finish_time_ms
		) {
			return;
		}

		technology.level += 1;
		technology.is_researching = false;
		technology.research_start_time = null;
		technology.research_finish_time = null;

		db.setUserResearchs(tx, params.user_id, userResearchs);
	});

	return {
		status: 'ok',
	};
}
