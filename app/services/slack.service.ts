import {Request} from '../utils/request.js';
import {CustomError} from '../utils/custom-error.js';
import {type TServiceReturn} from '../types/service-return.type.js';
import {logger} from '../utils/logger.util.js';

export class SlackService {
	private readonly _request: Request;

	constructor() {
		this._request = new Request(process.env.SLACK_WEBHOOK_URL!, {
			'Content-Type': 'application/json', // eslint-disable-line @typescript-eslint/naming-convention
		});
	}

	public async sendMessage(message: any): Promise<TServiceReturn<string>> {
		console.log('mensagem', message);
		try {
			await this._request.post('', {text: `${message}`});

			return {
				status: 'NO_CONTENT',
				data: 'Message sent successfully',
			};
		} catch (error) {
			logger.logError(`Error sending message: ${(error as Error).message}`);
			throw new CustomError('INVALID_DATA', 'Error sending message');
		}
	}
}
