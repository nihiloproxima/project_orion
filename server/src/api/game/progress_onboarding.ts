import admin from 'firebase-admin';
import db from '../../database/db';
import Joi from 'joi';
import { OnboardingStep } from '../../models';

interface ProgressOnboardingParams {
	step: OnboardingStep;
}

const schema = Joi.object<ProgressOnboardingParams>({
	step: Joi.string().required(),
});

export async function progressOnboarding(userId: string, body: ProgressOnboardingParams) {
	const params = Joi.attempt(body, schema);

	await admin.firestore().runTransaction(async (tx) => {
		db.setUser(tx, userId, {
			onboarding_step: params.step,
		});
	});
}
