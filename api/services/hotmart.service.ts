import {Request} from '../utils/Axios.js';
import {CustomError} from '../utils/CustomError.js';
import {type TServiceReturn} from '../types/ServiceReturn.js';
import {SecretService} from './secret.service.js';
import {type TUser} from '../types/User.js';
import {type THotmartSubscription, type TSubscription} from '../types/Subscription.js';
import {logger} from '../utils/Logger.js';
import axios from 'axios';

const baseUrl = process.env.HOTMART_API_URL ?? 'https://sandbox.hotmart.com/';

export class HotmartService {
	private readonly _secretService: SecretService;

	constructor() {
		this._secretService = new SecretService();
	}

	public async getUserSchoolSubscriptions(user: TUser): Promise<TServiceReturn<TSubscription[]>> {
		logger.logDebug('Starting to get user hotmart subscriptions');

		const secrets = await this._secretService.getSecret();
		logger.logDebug(`Got secrets: ${JSON.stringify(secrets)}`);

		logger.logDebug('Creating new request for hotmart');
		const request = new Request(baseUrl, {
			// eslint-disable-next-line @typescript-eslint/naming-convention
			'Content-Type': 'application/json',
			Authorization: `Bearer ${secrets.data.hotmartApiAccessToken}`,
		});

		const url = '/payments/api/v1/subscriptions';
		const params = {
			// eslint-disable-next-line camelcase
			subscriber_email: user.email,
			// eslint-disable-next-line camelcase
			product_id: '135340',
		};

		try {
			logger.logDebug('Sending subscription request to hotmart');
			const response = await request.get(url, params);
			logger.logDebug(`Got response: ${JSON.stringify(response.data)}`);

			return {
				status: 'SUCCESSFUL',
				data: response.data.items ? this._mapSubscriptions(response.data.items as THotmartSubscription[], user) : [],
			};
		} catch (error) {
			logger.logError(`Error getting user subscriptions on first try: ${JSON.stringify((error as Record<string, string>).data)}`);
			try {
				logger.logDebug('Getting new access token');
				const newAccessToken = await this._getAccessToken();
				logger.logDebug('Got new access token');

				logger.logDebug('Trying to get user subscriptions again');
				const request = new Request(baseUrl, {
					// eslint-disable-next-line @typescript-eslint/naming-convention
					'Content-Type': 'application/json',
					Authorization: `Bearer ${newAccessToken}`,
				});

				const response = await request.get(url, params);

				return {
					status: 'SUCCESSFUL',
					data: response.data.items ? this._mapSubscriptions(response.data.items as THotmartSubscription[], user) : [],
				};
			} catch (error) {
				console.log(error);
				logger.logError(`Error getting user subscriptions on second try: ${JSON.stringify((error as Record<string, string>).data)}`);
				throw new CustomError('INVALID_DATA', (error as Error).message);
			}
		}
	}

	private _mapSubscriptions(subscriptions: THotmartSubscription[], user: TUser): TSubscription[] {
		return subscriptions.map(subscription => ({
			userId: user.id,
			courseId: 'TODO: pesquisar id do curso pelo id do produto no hotmart',
			expiresAt: new Date(subscription.date_next_charge),
			provider: 'hotmart',
			providerSubscriptionId: subscription.subscription_id,
		}));
	}

	private async _getAccessToken(): Promise<string> {
		try {
			logger.logDebug('Getting new access token: _getAccessToken');
			logger.logDebug('Getting secrets');
			const {data: secrets} = await this._secretService.getSecret();
			logger.logDebug('Got secrets');

			logger.logDebug('Sending request for hotmart auth service');

			const response = await axios.post(
				'https://api-sec-vlc.hotmart.com/security/oauth/token',
				null,
				{
					headers: {
						// eslint-disable-next-line @typescript-eslint/naming-convention
						'Content-Type': 'application/json',
						Authorization: process.env.HOTMART_API_BASIC ?? '',
					},
					params: {
						// eslint-disable-next-line camelcase
						grant_type: 'client_credentials',
						// eslint-disable-next-line camelcase
						client_id: process.env.HOTMART_API_CLIENT_ID ?? '',
						// eslint-disable-next-line camelcase
						client_secret: process.env.HOTMART_API_SECRET ?? '',
					},
				},
			);
			logger.logDebug('Got response');

			logger.logDebug('Sending new hotmart access token to secret service');
			await this._secretService.setSecret({
				...secrets,
				hotmartApiAccessToken: response.data.access_token as string,
			});
			logger.logDebug('Saved new hotmart access token to secret service');

			return response.data.access_token as string;
		} catch (error) {
			logger.logError(`Error getting new access token: ${JSON.stringify((error as Record<string, string>).data)}`);
			throw new CustomError('INVALID_DATA', (error as Error).message);
		}
	}
}
