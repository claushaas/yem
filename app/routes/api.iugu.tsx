import {type ActionFunctionArgs} from 'react-router';
import {parse} from 'qs';
import {HooksService} from '~/services/hooks.service.server';
import {logger} from '~/utils/logger.util';

export const meta = () => [
	{name: 'robots', content: 'noindex, nofollow'},
];

export const loader = async () => {
	try {
		return Response.json({
			message: 'OK',
		}, {
			status: 200,
		});
	} catch (error) {
		logger.logError(`Error sending message on iugu loader: ${(error as Error).message}`);
		return {error: 'An error occurred'};
	}
};

export const action = async ({request}: ActionFunctionArgs) => {
	try {
		const bodyText = await request.text();
		const body = parse(bodyText) as {
			event: string;
			data: Record<string, any>;
		};

		await new HooksService().handleIuguWebhook(body);

		return Response.json({
			message: 'OK',
		}, {
			status: 200,
		});
	} catch (error) {
		logger.logError(`Error sending message on iugu action: ${(error as Error).message}`);
		return Response.json({error: 'An error occurred'}, {status: 200});
	}
};
