/** biome-ignore-all lint/style/useTemplate: . */
import { convertSubscriptionIdentifierToCourseSlug } from '~/utils/subscription-identifier-to-course-id.js';
import type { TServiceReturn } from '../types/service-return.type.js';
import type {
	TIuguInvoiceResponse,
	TIuguSubscription,
	TIuguSubscriptionResponse,
	TPlanIdentifier,
	TSubscription,
} from '../types/subscription.type.js';
import type { TUser } from '../types/user.type.js';
import { CustomError } from '../utils/custom-error.js';
import { logger } from '../utils/logger.util.js';
import { Request } from '../utils/request.js';

export class IuguService {
	private readonly _request: Request;

	constructor() {
		const token = process.env.IUGU_API_TOKEN ?? '';
		const base64Token = Buffer.from(token + ':').toString('base64');
		this._request = new Request(process.env.IUGU_API_URL ?? '', {
			Authorization: `Basic ${base64Token}`,
		});
	}

	public async getUserSubscriptions(
		user: TUser,
	): Promise<TServiceReturn<TSubscription[]>> {
		logger.logDebug(`Getting subscriptions for user ${user.email}`);
		try {
			const {
				data: { items },
			} = (await this._request.get('/subscriptions', {
				query: user.email,
			})) as { data: { items: TIuguSubscription[] } };

			logger.logDebug(
				`Found ${items.length} subscriptions for user ${user.email}`,
			);

			if (!items || items.length === 0) {
				return {
					data: [],
					status: 'SUCCESSFUL',
				};
			}

			return {
				data: this._mapSubscriptions(items, user),
				status: 'SUCCESSFUL',
			};
		} catch (error) {
			throw new CustomError('INVALID_DATA', (error as Error).message);
		}
	}

	public async getSubscriptionById(
		subscriptionId: string,
	): Promise<TServiceReturn<TIuguSubscriptionResponse>> {
		try {
			const { data } = (await this._request.get(
				`/subscriptions/${subscriptionId}`,
			)) as { data: TIuguSubscriptionResponse };

			return {
				data,
				status: 'SUCCESSFUL',
			};
		} catch (error) {
			throw new CustomError('INVALID_DATA', (error as Error).message);
		}
	}

	public async getInvoiceById(
		invoiceId: string,
	): Promise<TServiceReturn<TIuguInvoiceResponse>> {
		try {
			const { data } = (await this._request.get(`/invoices/${invoiceId}`)) as {
				data: TIuguInvoiceResponse;
			};

			return {
				data,
				status: 'SUCCESSFUL',
			};
		} catch (error) {
			throw new CustomError('INVALID_DATA', (error as Error).message);
		}
	}

	public hasCreditCardPaymentMethod(invoice: TIuguInvoiceResponse): boolean {
		const paymentMethod = invoice.payment_method || '';
		const payableWith = invoice.payable_with || '';

		return (
			paymentMethod.includes('credit_card') ||
			payableWith.includes('credit_card')
		);
	}

	private _mapSubscriptions(
		subscriptions: TIuguSubscription[],
		user: TUser,
	): TSubscription[] {
		return subscriptions.map((subscription) => ({
			courseSlug: convertSubscriptionIdentifierToCourseSlug(
				subscription.plan_identifier as TPlanIdentifier,
			),
			expiresAt: new Date(subscription.expires_at),
			provider: 'iugu',
			providerSubscriptionId: subscription.id,
			userId: user.id,
		}));
	}
}
