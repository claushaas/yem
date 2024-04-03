import {json, type LoaderFunctionArgs} from '@remix-run/node';
import {SlackService} from '~/services/slack.service';
import {logger} from '~/utils/logger.util';

export const loader = async ({request}: LoaderFunctionArgs) => {
	try {
		await new SlackService().sendMessage(await request.json() as Record<string, any>);

		return json({
			message: 'OK',
		}, {
			status: 200,
		});
	} catch (error) {
		logger.logError(`Error sending message: ${(error as Error).message}`);
		return json({error: 'An error occurred'});
	}
};

export const action = async ({request}: LoaderFunctionArgs) => {
	try {
		await new SlackService().sendMessage(await request.json() as Record<string, any>);

		return json({
			message: 'OK',
		}, {
			status: 200,
		});
	} catch (error) {
		logger.logError(`Error sending message: ${(error as Error).message}`);
		return json({error: 'An error occurred'});
	}
};
