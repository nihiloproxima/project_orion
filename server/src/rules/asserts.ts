export const assert = {
	isEqual: (expected: any, actual: any, message?: string) => {
		if (expected !== actual) {
			throw new Error(
				`${message ? message + ' - ' : 'Assertion failed: '}Expected: ${expected} to equal Actual: ${actual}`
			);
		}
	},
	isNotEqual: (expected: any, actual: any, message?: string) => {
		if (expected === actual) {
			throw new Error(
				`${
					message ? message + ' - ' : 'Assertion failed: '
				}Expected: ${expected} to not equal Actual: ${actual}`
			);
		}
	},
	isGreaterThan: (expected: number, actual: number, message?: string) => {
		if (expected <= actual) {
			throw new Error(
				`${
					message ? message + ' - ' : 'Assertion failed: '
				}Expected: ${expected} to be greater than Actual: ${actual}`
			);
		}
	},
	isLessThan: (expected: number, actual: number, message?: string) => {
		if (expected >= actual) {
			throw new Error(
				`${
					message ? message + ' - ' : 'Assertion failed: '
				}Expected: ${expected} to be less than Actual: ${actual}`
			);
		}
	},

	isGreaterThanOrEqual: (expected: number, actual: number, message?: string) => {
		if (expected > actual) {
			throw new Error(
				`${
					message ? message + ' - ' : 'Assertion failed: '
				}Expected: ${expected} to be greater than or equal to Actual: ${actual}`
			);
		}
	},

	isLessThanOrEqual: (expected: number, actual: number, message?: string) => {
		if (expected < actual) {
			throw new Error(
				`${
					message ? message + ' - ' : 'Assertion failed: '
				}Expected: ${expected} to be less than or equal to Actual: ${actual}`
			);
		}
	},
};

export default assert;
