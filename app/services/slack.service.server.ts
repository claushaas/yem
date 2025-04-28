import { type TServiceReturn } from '../types/service-return.type.js';
import { CustomError } from '../utils/custom-error.js';
import { logger } from '../utils/logger.util.js';
import { Request } from '../utils/request.js';

export class SlackService {
	private readonly _request: Request;

	constructor() {
		this._request = new Request(process.env.SLACK_WEBHOOK_URL!, {
			'Content-Type': 'application/json', // eslint-disable-line @typescript-eslint/naming-convention
		});
	}

	public async sendMessage(message: any): Promise<TServiceReturn<string>> {
		try {
			await this._request.post('', { text: JSON.stringify(message) });

			return {
				data: 'Message sent successfully',
				status: 'NO_CONTENT',
			};
		} catch (error) {
			logger.logError(
				`Error sending message on slack: ${(error as Error).message}`,
			);
			throw new CustomError('INVALID_DATA', 'Error sending message on slack');
		}
	}
}
