import {json, type LoaderFunctionArgs} from '@remix-run/node';
import {HooksService} from '~/services/hooks.service.server';
import {SlackService} from '~/services/slack.service.server';
import {type TIncommingHotmartWebhook} from '~/types/subscription.type';
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
		logger.logError(`Error sending message on hotmart loader: ${(error as Error).message}`);
		return json({error: 'An error occurred'});
	}
};

export const action = async ({request}: LoaderFunctionArgs) => {
	try {
		await new HooksService().handleHotmartWebhook(await request.json() as TIncommingHotmartWebhook);

		return json({
			message: 'OK',
		}, {
			status: 200,
		});
	} catch (error) {
		logger.logError(`Error sending message on hotmart action: ${(error as Error).message}`);
		return json({error: 'An error occurred'});
	}
};
