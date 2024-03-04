import {Request} from '../utils/Axios';
import CustomError from '../utils/CustomError';
import {type TypeServiceReturn} from '../types/ServiceReturn';
import {SecretService} from './secret.service';
import type TypeUser from '../types/User';
import {type TypeHotmartSubscription, type TypeSubscription} from '../types/Subscription';
import {logger} from '../utils/Logger';
import axios from 'axios';

const baseUrl = process.env.HOTMART_API_URL ?? 'https://sandbox.hotmart.com/';

export class HotmartService {
	private readonly _secretService: SecretService;

	constructor() {
		this._secretService = new SecretService();
	}

	public async getUserSubscriptions(user: TypeUser): Promise<TypeServiceReturn<TypeSubscription[]>> {
		logger.logDebug('Getting user subscriptions');

		const secrets = await this._secretService.getSecret();

		logger.logDebug(`Got secrets: ${JSON.stringify(secrets)}`);

		const request = new Request(baseUrl, {
			'Content-Type': 'application/json',
			// eslint-disable-next-line @typescript-eslint/naming-convention
			Authorization: `Bearer ${secrets.data.hotmartApiAccessToken}`,
		});

		const url = '/payments/api/v1/subscriptions';
		const params = {
			// eslint-disable-next-line @typescript-eslint/naming-convention
			subscriber_email: user.email,
		};

		try {
			const response = await request.get(url, params);
			logger.logDebug(`Got response: ${JSON.stringify(response.data)}`);

			return {
				status: 'SUCCESSFUL',
				data: response.data.items ? this._mapSubscriptions(response.data.items as TypeHotmartSubscription[], user) : [],
			};
		} catch (error) {
			logger.logError(`Error getting user subscriptions on first try: ${JSON.stringify((error as Record<string, string>).data)}`);
			try {
				logger.logDebug('Getting new access token');
				const newAccessToken = await this._getAccessToken();
				logger.logDebug('Got new access token');

				logger.logDebug('Trying to get user subscriptions again');
				const request = new Request(baseUrl, {
					'Content-Type': 'application/json',
					// eslint-disable-next-line @typescript-eslint/naming-convention
					Authorization: `Bearer ${newAccessToken}`,
				});

				const response = await request.get(url, params);

				return {
					status: 'SUCCESSFUL',
					data: response.data.items ? this._mapSubscriptions(response.data.items as TypeHotmartSubscription[], user) : [],
				};
			} catch (error) {
				console.log(error);
				logger.logError(`Error getting user subscriptions on second try: ${JSON.stringify((error as Record<string, string>).data)}`);
				throw new CustomError('INVALID_DATA', (error as Error).message);
			}
		}
	}

	private _mapSubscriptions(subscriptions: TypeHotmartSubscription[], user: TypeUser): TypeSubscription[] {
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

			// Logger.logDebug('Creating new request for hotmart auth service');
			// const request2 = new Request('https://api-sec-vlc.hotmart.com', {
			// 	'Content-Type': 'application/json',
			// 	// eslint-disable-next-line @typescript-eslint/naming-convention
			// 	Authorization: secrets.hotmartApiClientBasic,
			// });

			logger.logDebug('Sending request for hotmart auth service');

			const response = await axios.post(
				'https://api-sec-vlc.hotmart.com/security/oauth/token',
				null,
				{
					headers: {
						'Content-Type': 'application/json',
						// eslint-disable-next-line @typescript-eslint/naming-convention
						Authorization: process.env.HOTMART_API_BASIC ?? '',
					},
					params: {
						// eslint-disable-next-line @typescript-eslint/naming-convention
						grant_type: 'client_credentials',
						// eslint-disable-next-line @typescript-eslint/naming-convention
						client_id: process.env.HOTMART_API_CLIENT_ID ?? '',
						// eslint-disable-next-line @typescript-eslint/naming-convention
						client_secret: process.env.HOTMART_API_SECRET ?? '',
					},
				},
			);

			// Const response = await request2.post({
			// 	url: `https://api-sec-vlc.hotmart.com/security/oauth/token?grant_type=client_credentials&client_id=${secrets.hotmartApiClientId}&client_secret=${secrets.hotmartApiClientSecret}`,
			// });
			logger.logDebug('Got response');

			logger.logDebug('Sending new hotmart access token to secret service');
			await this._secretService.setSecret({
				...secrets,
				hotmartApiAccessToken: response.data.access_token as string,
			});
			logger.logDebug('Saved new hotmart access token to secret service');

			return response.data.access_token as string;
		} catch (error) {
			console.log(error);
			logger.logError(`Error getting new access token: ${JSON.stringify((error as Record<string, string>).data)}`);
			throw new CustomError('INVALID_DATA', (error as Error).message);
		}
	}
}
