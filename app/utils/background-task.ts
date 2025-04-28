import { remember } from '@epic-web/remember';

const executeAndRepeatFunction = async (
	targetPromise: () => Promise<any>,
	milliseconds: number,
) => {
	if (process.env.NODE_ENV === 'test') {
		return targetPromise();
	}

	const scheduleNextExecution = () =>
		setTimeout(
			async () => executeAndRepeat(targetPromise, milliseconds),
			milliseconds,
		);

	try {
		const result = await targetPromise(); // eslint-disable-line @typescript-eslint/no-unsafe-assignment
		scheduleNextExecution();
		return result; // eslint-disable-line @typescript-eslint/no-unsafe-return
	} catch (error) {
		scheduleNextExecution();
		throw error;
	}
};

export const executeAndRepeat = remember(
	'executeAndRepeat',
	() => executeAndRepeatFunction,
);
