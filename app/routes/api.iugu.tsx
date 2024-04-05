import {type ActionFunctionArgs, json, type LoaderFunctionArgs} from '@remix-run/node';
import {parse} from 'qs';
import {HooksService} from '~/services/hooks.service';
import {IuguService} from '~/services/iugu.service';
import {logger} from '~/utils/logger.util';

export const loader = async ({request}: LoaderFunctionArgs) => {
	try {
		return json({
			message: 'OK',
		}, {
			status: 200,
		});
	} catch (error) {
		logger.logError(`Error sending message on iugu loader: ${(error as Error).message}`);
		return json({error: 'An error occurred'});
	}
};

export const action = async ({request}: ActionFunctionArgs) => {
	try {
		const bodyText = await request.text();
		const body = parse(bodyText) as {
			event: string;
			data: Record<string, any>;
		};

		console.log('body', body);

		await new HooksService().handleIuguWebhook(body);

		return json({
			message: 'OK',
		}, {
			status: 200,
		});
	} catch (error) {
		logger.logError(`Error sending message on iugu action: ${(error as Error).message}`);
		return json({error: 'An error occurred'}, {status: 200});
	}
};
