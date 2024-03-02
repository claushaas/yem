import {Request} from '../utils/Axios';
import CustomError from '../utils/CustomError';
import {type TypeServiceReturn} from '../types/ServiceReturn';
import {SecretService} from './secret.service';
import type TypeUser from '../types/User';
import {type TypeHotmartSubscription, type TypeSubscription} from '../types/Subscription';

const baseUrl = process.env.HOTMART_API_URL ?? 'https://sandbox.hotmart.com/';

export class HotmartService {
	private readonly _secretService: SecretService;

	constructor() {
		this._secretService = new SecretService();
	}

	public async getUserSubscriptions(user: TypeUser): Promise<TypeServiceReturn<TypeSubscription[]>> {
		const secrets = await this._secretService.getSecret();

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

			return {
				status: 'SUCCESSFUL',
				data: response.data.items ? this._mapSubscriptions(response.data.items as TypeHotmartSubscription[], user) : [],
			};
		} catch (error) {
			console.error('Error getting user subscriptions1', error);
			try {
				const newAccessToken = await this._getAccessToken();

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
				console.error('Error getting user subscriptions2', error);
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
			const {data: secrets} = await this._secretService.getSecret();

			const request = new Request('https://api-sec-vlc.hotmart.com', {
				'Content-Type': 'application/json',
				// eslint-disable-next-line @typescript-eslint/naming-convention
				Authorization: `Basic ${secrets.hotmartApiClientBasic}`,
			});

			const response = await request.post({
				url: 'https://api-sec-vlc.hotmart.com/security/oauth/token?grant_type=client_credentials',
				params: {
					// eslint-disable-next-line @typescript-eslint/naming-convention
					client_id: secrets.hotmartApiClientId,
					// eslint-disable-next-line @typescript-eslint/naming-convention
					client_secret: secrets.hotmartApiClientSecret,
				},
			});

			await this._secretService.setSecret({
				...secrets,
				hotmartApiAccessToken: response.data.access_token as string,
			});

			return response.data.access_token as string;
		} catch (error) {
			throw new CustomError('INVALID_DATA', (error as Error).message);
		}
	}
}
