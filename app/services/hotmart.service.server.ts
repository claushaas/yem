import axios from 'axios';
import {Request} from '../utils/request.js';
import {CustomError} from '../utils/custom-error.js';
import {type TServiceReturn} from '../types/service-return.type.js';
import {type TUser} from '../types/user.type.js';
import {
	type TPlanIdentifier,
	type THotmartSubscription,
	type TSubscription,
	type THotmartFormationPurchase,
} from '../types/subscription.type.js';
import {logger} from '../utils/logger.util.js';
import {SecretService} from './secret.service.server.js';
import {convertSubscriptionIdentifierToCourseSlug} from '~/utils/subscription-identifier-to-course-id.js';

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
			'Content-Type': 'application/json', // eslint-disable-line @typescript-eslint/naming-convention
			Authorization: `Bearer ${secrets.data.hotmartApiAccessToken}`,
		});

		const url = '/payments/api/v1/subscriptions';
		const parameters = {
			subscriber_email: user.email,
			product_id: '135340',
		};

		try {
			logger.logDebug('Sending subscription request to hotmart');
			const response = await request.get(url, parameters);
			logger.logDebug(`Got response: ${JSON.stringify(response.data)}`);

			return {
				status: 'SUCCESSFUL',
				data: response.data.items ? this._mapSchoolSubscriptions(response.data.items as THotmartSubscription[], user) : [],
			};
		} catch (error) {
			logger.logError(`Error getting user subscriptions on first try: ${JSON.stringify((error as Record<string, string>).data)}`);
			try {
				logger.logDebug('Getting new access token');
				const newAccessToken = await this._getAccessToken();
				logger.logDebug('Got new access token');

				logger.logDebug('Trying to get user subscriptions again');
				const request = new Request(baseUrl, {
					'Content-Type': 'application/json', // eslint-disable-line @typescript-eslint/naming-convention
					Authorization: `Bearer ${newAccessToken}`,
				});

				const response = await request.get(url, parameters);
				logger.logDebug(`Got response: ${JSON.stringify(response.data)}`);

				return {
					status: 'SUCCESSFUL',
					data: response.data.items ? this._mapSchoolSubscriptions(response.data.items as THotmartSubscription[], user) : [],
				};
			} catch (error) {
				logger.logError(`Error getting user subscriptions on second try: ${JSON.stringify((error as Record<string, string>).data)}`);
				throw new CustomError('INVALID_DATA', (error as Error).message);
			}
		}
	}

	public async getUserFormationSubscriptions(user: TUser): Promise<TServiceReturn<TSubscription[]>> {
		const secrets = await this._secretService.getSecret();
		const request = new Request(baseUrl, {
			'Content-Type': 'application/json', // eslint-disable-line @typescript-eslint/naming-convention
			Authorization: `Bearer ${secrets.data.hotmartApiAccessToken}`,
		});

		const url = '/payments/api/v1/sales/history';
		const parameters = {
			buyer_email: user.email,
			product_id: '1392822',
		};

		try {
			const response = await request.get(url, parameters) as {data: {items: THotmartFormationPurchase[]}};
			logger.logDebug(`Got response: ${JSON.stringify(response.data)}`);

			const {data: {items}} = response;
			console.log(items);
			if (items.length > 1) {
				items.sort((a, b) => new Date(b.purchase.approved_date).getTime() - new Date(a.purchase.approved_date).getTime());
			}

			return {
				status: 'SUCCESSFUL',
				data: items.length > 0 ? this._mapFormationSubscriptions([items[0]], user) : [],
			};
		} catch (error) {
			logger.logError(`Error getting user formation subscriptions on first try: ${JSON.stringify((error as Record<string, string>).data)}`);

			try {
				const newAccessToken = await this._getAccessToken();

				const request = new Request(baseUrl, {
					'Content-Type': 'application/json', // eslint-disable-line @typescript-eslint/naming-convention
					Authorization: `Bearer ${newAccessToken}`,
				});

				const response = await request.get(url, parameters) as {data: {items: THotmartFormationPurchase[]}};
				const {data: {items}} = response;
				items.sort((a, b) => new Date(b.purchase.approved_date).getTime() - new Date(a.purchase.approved_date).getTime());

				return {
					status: 'SUCCESSFUL',
					data: items ? this._mapFormationSubscriptions([items[0]], user) : [],
				};
			} catch (error) {
				logger.logError(`Error getting user formation subscriptions on second try: ${JSON.stringify((error as Record<string, string>).data)}`);
				throw new CustomError('INVALID_DATA', (error as Error).message);
			}
		}
	}

	private _mapFormationSubscriptions(subscriptions: THotmartFormationPurchase[], user: TUser): TSubscription[] {
		return subscriptions.map(subscription => ({
			userId: user.id,
			courseSlug: convertSubscriptionIdentifierToCourseSlug(subscription.product.id.toString() as TPlanIdentifier),
			expiresAt: this._getFormationSubscriptionExpiresAt(subscription),
			provider: 'hotmart',
			providerSubscriptionId: subscription.purchase.transaction,
		}));
	}

	private _getFormationSubscriptionExpiresAt(subscription: THotmartFormationPurchase): Date {
		const futureDate = new Date(subscription.purchase.approved_date);
		futureDate.setDate(futureDate.getDate() + 32);

		let expiresAt: Date;

		if (subscription.purchase.offer.payment_mode === 'MULTIPLE_PAYMENTS') {
			expiresAt = subscription.purchase.recurrency_number < subscription.purchase.payment.installments_number ? futureDate : new Date(2_556_113_460_000);
		} else {
			expiresAt = new Date(2_556_113_460_000);
		}

		return expiresAt;
	}

	private _mapSchoolSubscriptions(subscriptions: THotmartSubscription[], user: TUser): TSubscription[] {
		return subscriptions.map(subscription => ({
			userId: user.id,
			courseSlug: convertSubscriptionIdentifierToCourseSlug(subscription.plan.name as TPlanIdentifier),
			expiresAt: subscription.date_next_charge ? new Date(subscription.date_next_charge) : new Date(subscription.accession_date),
			provider: 'hotmart',
			providerSubscriptionId: subscription.subscriber_code,
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
						'Content-Type': 'application/json', // eslint-disable-line @typescript-eslint/naming-convention
						Authorization: process.env.HOTMART_API_BASIC ?? '',
					},
					params: {

						grant_type: 'client_credentials',

						client_id: process.env.HOTMART_API_CLIENT_ID ?? '',

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
