import {Request} from '../utils/Axios.js';
import CustomError from '../utils/CustomError.js';
import {type TypeServiceReturn} from '../types/ServiceReturn.js';
import {SecretService} from './secret.service.js';
import {type AxiosResponse} from 'axios';
import {logger} from '../utils/Logger.js';
const baseUrl = process.env.BOTMAKER_API_URL ?? 'https://api.botmaker.com/v2.0';
const whatsappChannelId = process.env.BOTMAKER_WHATSAPP_CHANNEL_ID;

export class BotmakerService {
	private readonly _secretService: SecretService;

	constructor() {
		this._secretService = new SecretService();
	}

	public async addToBlackList(phoneNumber: string): Promise<TypeServiceReturn<AxiosResponse>> {
		const {data: {botmakerApiAccessToken}} = await this._secretService.getSecret();

		const request = new Request(baseUrl, {
			'Content-Type': 'application/json',
			// eslint-disable-next-line @typescript-eslint/naming-convention
			Accept: 'application/json',
			'access-token': botmakerApiAccessToken,
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
	): Promise<TypeServiceReturn<AxiosResponse>> {
		logger.logDebug('Sending WP template');
		const {data: {botmakerApiAccessToken}} = await this._secretService.getSecret();

		const request = new Request(baseUrl, {
			'Content-Type': 'application/json',
			// eslint-disable-next-line @typescript-eslint/naming-convention
			Accept: 'application/json',
			'access-token': botmakerApiAccessToken,
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
