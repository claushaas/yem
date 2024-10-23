// X-hubla-token
// 8Lui4amoPJRcDXCLN3MSiFZV9HcBiJAzxCcVynu7xcxF2RDBG9LIFopa8yDeodNz

import {json, type LoaderFunctionArgs} from '@remix-run/node';
import {HooksService} from '~/services/hooks.service.server';
import {SlackService} from '~/services/slack.service.server';
import {type THublaEvents} from '~/types/hubla.type';
import {logger} from '~/utils/logger.util';

export const meta = () => [
	{name: 'robots', content: 'noindex, nofollow'},
];

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
		const {headers} = request;
		const HUBLA_TOKEN = headers.get('x-hubla-token');

		if (HUBLA_TOKEN === process.env.HUBLA_TOKEN) {
			const body = await request.json() as THublaEvents;
			await new HooksService().handleHublaWebhook(body);

			return json({
				message: 'OK',
			}, {
				status: 200,
			});
		}

		return json({
			message: 'Unauthorized',
		}, {
			status: 401,
		});
	} catch (error) {
		logger.logError(`Error sending message on hotmart action: ${(error as Error).message}`);
		return json({error: 'An error occurred'});
	}
};
