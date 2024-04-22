import Joi from 'joi';
import {type TSubscription} from '../types/subscription.type.js';
import {CustomError} from '../utils/custom-error.js';

const subscriptionSchema = Joi.object({
	userId: Joi.string().uuid().required(),
	courseSlug: Joi.string().uuid().required(),
	expiresAt: Joi.date().required(),
	provider: Joi.string().valid('hotmart', 'iugu', 'manual').required(),
	providerSubscriptionId: Joi.string().required(),
	providerSubscriptionStatus: Joi.string().allow(''),
});

export class Subscription implements TSubscription {
	private readonly _userId: string;
	private readonly _courseSlug: string;
	private readonly _expiresAt: Date;
	private readonly _provider: 'hotmart' | 'iugu' | 'manual';
	private readonly _providerSubscriptionId: string;
	private readonly _providerSubscriptionStatus?: string;

	constructor(subscription: TSubscription) {
		const {error} = subscriptionSchema.validate(subscription);

		if (error) {
			throw new CustomError('UNPROCESSABLE_ENTITY', `Invalid subscription data: ${error.message}`);
		}

		this._userId = subscription.userId;
		this._courseSlug = subscription.courseSlug;
		this._expiresAt = subscription.expiresAt;
		this._provider = subscription.provider;
		this._providerSubscriptionId = subscription.providerSubscriptionId;
		this._providerSubscriptionStatus = subscription.providerSubscriptionStatus;
	}

	get userId() {
		return this._userId;
	}

	get courseSlug() {
		return this._courseSlug;
	}

	get expiresAt() {
		return this._expiresAt;
	}

	get provider() {
		return this._provider;
	}

	get providerSubscriptionId() {
		return this._providerSubscriptionId;
	}

	get providerSubscriptionStatus() {
		return this._providerSubscriptionStatus;
	}
}
