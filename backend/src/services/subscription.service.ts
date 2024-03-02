import {PrismaClient} from '@prisma/client';
import type TypeUser from '../types/User';
import {type TypeServiceReturn} from '../types/ServiceReturn';
import Subscription from '../entities/subscription.entity';
import {type TypeSubscription} from '../types/Subscription';

export default class SubscriptionService {
	private readonly _model: PrismaClient;

	constructor(model: PrismaClient = new PrismaClient()) {
		this._model = model;
	}

	public async createOrUpdate(subscriptionData: TypeSubscription): Promise<TypeServiceReturn<unknown>> {
		const subscription = new Subscription(subscriptionData);

		const createdOrUpdatedSubscription = await this._model.userSubscriptions.upsert({
			where: {
				id: undefined,
				userId: subscription.userId,
				courseId: subscription.courseId,
			},
			update: {
				expiresAt: subscription.expiresAt,
			},
			create: {
				userId: subscription.userId,
				courseId: subscription.courseId,
				expiresAt: subscription.expiresAt,
				provider: subscription.provider,
				providerSubscriptionId: subscription.providerSubscriptionId,
			},
		});

		if (!createdOrUpdatedSubscription) {
			throw new Error('Subscription not created');
		}

		return {
			status: 'SUCCESSFUL',
			data: subscription,
		};
	}
}
