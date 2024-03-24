import {type AxiosResponse} from 'axios';
import {Request} from '../utils/request.js';
import {CustomError} from '../utils/custom-error.js';
import {type TServiceReturn} from '../types/service-return.js';
import {logger} from '../utils/logger.js';
import {SecretService} from './secret.service.js';

const baseUrl = process.env.BOTMAKER_API_URL ?? 'https://api.botmaker.com/v2.0';
const whatsappChannelId = process.env.BOTMAKER_WHATSAPP_CHANNEL_ID;

export class BotmakerService {
	private readonly _secretService: SecretService;

	constructor() {
		this._secretService = new SecretService();
	}

	public async addToBlackList(phoneNumber: string): Promise<TServiceReturn<AxiosResponse>> {
		const {data: {botmakerApiAccessToken}} = await this._secretService.getSecret();

		const request = new Request(baseUrl, {
			'content-type': 'application/json', // eslint-disable-line @typescript-eslint/naming-convention
			Accept: 'application/json',
			'access-token': botmakerApiAccessToken, // eslint-disable-line @typescript-eslint/naming-convention
		});

		const url = '/notifications/contacts-blacklist';
		const data = {
			contacts: [phoneNumber],
		};

		try {
			const response = await request.post(url, data);

			return {
				status: 'SUCCESSFUL',
				data: response.data as AxiosResponse,
			};
		} catch (error) {
			logger.logError(`Error adding to blacklist: ${JSON.stringify((error as {
				response: {
					data: unknown;
				};
			}).response.data)}`);
			throw new CustomError('INVALID_DATA', `Error adding ${phoneNumber} to blacklist`);
		}
	}

	public async sendWhatsappTemplateMessate(
		userPhoneNumber: string,
		whatsappTemplateName: string,
		variables: Record<string, string>,
	): Promise<TServiceReturn<AxiosResponse>> {
		logger.logDebug('Sending WP template');
		const {data: {botmakerApiAccessToken}} = await this._secretService.getSecret();

		const request = new Request(baseUrl, {
			'Content-Type': 'application/json', // eslint-disable-line @typescript-eslint/naming-convention
			Accept: 'application/json',
			'access-token': botmakerApiAccessToken, // eslint-disable-line @typescript-eslint/naming-convention
		});

		const url = '/chats-actions/trigger-intent';
		const data = {
			chat: {
				channelId: whatsappChannelId,
				contactId: userPhoneNumber,
			},
			intentIdOrName: whatsappTemplateName,
			variables,
		};

		try {
			const response = await request.post(url, data);
			logger.logDebug('WP template sent successfully');

			return {
				status: 'SUCCESSFUL',
				data: response.data as AxiosResponse,
			};
		} catch (error) {
			logger.logError(`Error sending WP template: ${JSON.stringify((error as {
				response: {
					data: unknown;
				};
			}).response.data)}`);
			throw new CustomError('INVALID_DATA', (error as Error).message);
		}
	}
}
