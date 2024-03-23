import {CustomError} from '../utils/CustomError.js';
import {type TServiceReturn} from '../types/ServiceReturn.js';
import api from 'api';
import {type TUser} from '../types/User.js';
import {type TIuguSubscription, type TSubscription} from '../types/Subscription.js';

export class IuguService {
	private readonly _api: {
		auth: (apiKey: string) => void;
		listarAssinaturas: ({query}: {query: string}) => Promise<{data: {items: TIuguSubscription[]}}>;
	};

	constructor() {
		this._api = api('@iugu-dev/v1.0#40ap3flrqvhoz1');

		this._api.auth(process.env.IUGU_API_TOKEN ?? '');
	}

	public async getUserSubscriptions(user: TUser): Promise<TServiceReturn<TSubscription[]>> {
		try {
			const {data: {items}} = await this._api.listarAssinaturas({query: user.email});

			if (!items || items.length === 0) {
				return {
					status: 'SUCCESSFUL',
					data: [],
				};
			}

			return {
				status: 'SUCCESSFUL',
				data: this._mapSubscriptions(items, user),
			};
		} catch (error) {
			throw new CustomError('INVALID_DATA', (error as Error).message);
		}
	}

	private _mapSubscriptions(subscriptions: TIuguSubscription[], user: TUser): TSubscription[] {
		return subscriptions.map(subscription => ({
			userId: user.id,
			courseId: 'pesquisar pelo id do curso pelo identificador do plano da iugu',
			expiresAt: new Date(subscription.expires_at),
			provider: 'iugu',
			providerSubscriptionId: subscription.id,
		}));
	}
}
