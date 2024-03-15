import {type PrismaClient} from '@prisma/client';
import {type TypeUser} from '../types/User.js';
import {type TypeServiceReturn} from '../types/ServiceReturn.js';
import Subscription from '../entities/subscription.entity.js';
import {type TypeSubscription} from '../types/Subscription.js';
import {HotmartService} from './hotmart.service.js';
import {IuguService} from './iugu.service.js';
import {logger} from '../utils/Logger.js';
import {db} from '../db/db.js';

export default class SubscriptionService {
	private readonly _model: PrismaClient;
	private readonly _hotmartService: HotmartService;
	private readonly _iuguService: IuguService;

	constructor(model: PrismaClient = db) {
		this._model = model;
		this._hotmartService = new HotmartService();
		this._iuguService = new IuguService();
	}

	public async createOrUpdate(subscriptionData: TypeSubscription): Promise<TypeServiceReturn<unknown>> {
		const subscription = new Subscription(subscriptionData);

		const createdOrUpdatedSubscription = await this._model.userSubscriptions.upsert({
			where: {
				// eslint-disable-next-line @typescript-eslint/naming-convention
				userId_courseId_providerSubscriptionId: {
					userId: subscription.userId,
					courseId: subscription.courseId,
					providerSubscriptionId: subscription.providerSubscriptionId,
				},
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

	public async createOrUpdateAllUserSubscriptions(user: TypeUser): Promise<TypeServiceReturn<unknown>> {
		try {
			const {data: hotmartSubscriptions} = await this._hotmartService.getUserSchoolSubscriptions(user);

			if (hotmartSubscriptions.length > 0) {
				await Promise.all(
					hotmartSubscriptions.map(async subscription => {
						await this.createOrUpdate(subscription);
					}),
				);
			}
		} catch (error) {
			logger.logError(`Error getting hotmart subscriptions: ${(error as Error).message}`);
		}

		try {
			const {data: iuguSubscriptions} = await this._iuguService.getUserSubscriptions(user);

			if (iuguSubscriptions.length > 0) {
				await Promise.all(
					iuguSubscriptions.map(async subscription => {
						await this.createOrUpdate(subscription);
					}),
				);
			}
		} catch (error) {
			logger.logError(`Error getting iugu subscriptions: ${(error as Error).message}`);
		}

		return {
			status: 'NO_CONTENT',
			data: null,
		};
	}
}
