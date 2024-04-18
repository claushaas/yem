import {type PrismaClient} from '@prisma/client';
import {type TUser} from '../types/user.type.js';
import {type TServiceReturn} from '../types/service-return.type.js';
import {Subscription} from '../entities/subscription.entity.server.js';
import {type TPrismaPayloadGetUserSubscriptions, type TSubscription} from '../types/subscription.type.js';
import {logger} from '../utils/logger.util.js';
import {db} from '../database/db.js';
import {HotmartService} from './hotmart.service.server.js';
import {IuguService} from './iugu.service.server.js';
import {CustomError} from '~/utils/custom-error.js';
import {convertSubscriptionIdentifierToCourseId} from '~/utils/subscription-identifier-to-course-id.js';

export default class SubscriptionService {
	private readonly _model: PrismaClient;
	private readonly _hotmartService: HotmartService;
	private readonly _iuguService: IuguService;

	constructor(model: PrismaClient = db) {
		this._model = model;
		this._hotmartService = new HotmartService();
		this._iuguService = new IuguService();
	}

	public async createOrUpdate(subscriptionData: TSubscription): Promise<TServiceReturn<Subscription>> {
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

	public async createUserInitialSubscriptions(user: TUser): Promise<TServiceReturn<string>> {
		const {data: actualSubscriptions} = await this.getUserSubscriptions(user);

		const hasIuguSubscriptions = actualSubscriptions?.some(subscription => subscription.provider === 'iugu');
		const hasHotmartSchoolSubscriptions = actualSubscriptions?.some(subscription => (subscription.provider === 'hotmart'
				&& (subscription.courseId === '750c5893-e395-411c-8438-1754e1fd0663' || subscription.courseId === 'c15efa5f-17f3-4db2-8e5a-b3cb287065d3')));
		const hasHotmartFormationSubscriptions = actualSubscriptions?.some(subscription =>
			(subscription.provider === 'hotmart' && subscription.courseId === 'db66f261-f832-4f0b-9565-53d8f8422d51'));
		const hasBeginnerSubscription = actualSubscriptions?.some(subscription => subscription.courseId === '8c49ad51-dcb3-4a69-bbeb-2f95970194ae');

		if (!hasIuguSubscriptions || !hasHotmartSchoolSubscriptions || !hasHotmartFormationSubscriptions || !hasBeginnerSubscription) {
			await Promise.all([
				hasIuguSubscriptions && this._createUserIuguSubscriptions(user),
				hasHotmartSchoolSubscriptions && this._createUserHotmartSchoolSubscriptions(user),
				hasHotmartFormationSubscriptions && this._createUserHotmartFormationSubscriptions(user),
				hasBeginnerSubscription && this._createOrUpdateBeginnerSubscription(user),
			]);
		}

		return {
			status: 'NO_CONTENT',
			data: 'Subscriptions created or updated successfully',
		};
	}

	public async getUserSubscriptions(user: TUser): Promise<TServiceReturn<TPrismaPayloadGetUserSubscriptions[] | undefined>> {
		try {
			const subscriptions = await this._model.userSubscriptions.findMany({
				where: {
					userId: user.id,
				},
				include: {
					course: {
						select: {
							id: true,
							name: true,
							slug: true,
						},
					},
				},
			});

			if (!subscriptions) {
				return {
					status: 'NO_CONTENT',
					data: undefined,
				};
			}

			return {
				status: 'SUCCESSFUL',
				data: subscriptions,
			};
		} catch (error) {
			logger.logError(`Error getting user subscriptions: ${(error as Error).message}`);
			throw new CustomError('UNKNOWN', `Error getting user subscriptions: ${(error as Error).message}`);
		}
	}

	private async _createUserIuguSubscriptions(user: TUser): Promise<void> {
		try {
			const {data: iuguSubscriptions} = await this._iuguService.getUserSubscriptions(user);

			if (iuguSubscriptions.length > 0) {
				await Promise.all(
					iuguSubscriptions.map(async subscription => {
						await this.createOrUpdate(subscription);
					}),
				);
			} else if (iuguSubscriptions.length === 0) {
				await this.createOrUpdate({
					userId: user.id,
					courseId: convertSubscriptionIdentifierToCourseId('escola_mensal'),
					provider: 'iugu',
					providerSubscriptionId: `no-iugu-${user.id}`,
					expiresAt: new Date(946_684_800),
				});
			}
		} catch (error) {
			logger.logError(`Error getting iugu subscriptions: ${(error as Error).message}`);
		}
	}

	private async _createUserHotmartSchoolSubscriptions(user: TUser): Promise<void> {
		try {
			const {data: hotmartSubscriptions} = await this._hotmartService.getUserSchoolSubscriptions(user);

			if (hotmartSubscriptions.length > 0) {
				await Promise.all(
					hotmartSubscriptions.map(async subscription => {
						await this.createOrUpdate(subscription);
					}),
				);
			} else if (hotmartSubscriptions.length === 0) {
				await this.createOrUpdate({
					userId: user.id,
					courseId: convertSubscriptionIdentifierToCourseId('escola_mensal'),
					provider: 'hotmart',
					providerSubscriptionId: `no-hotmart-school-${user.id}`,
					expiresAt: new Date(946_684_800),
				});
			}
		} catch (error) {
			logger.logError(`Error getting hotmart subscriptions: ${(error as Error).message}`);
		}
	}

	private async _createUserHotmartFormationSubscriptions(user: TUser): Promise<void> {
		try {
			const {data: hotmartSubscriptions} = await this._hotmartService.getUserFormationSubscriptions(user);

			if (hotmartSubscriptions.length > 0) {
				await Promise.all([
					hotmartSubscriptions.map(async subscription => {
						await this.createOrUpdate(subscription);
					}),
				]);
			} else if (hotmartSubscriptions.length === 0) {
				await this.createOrUpdate({
					userId: user.id,
					courseId: convertSubscriptionIdentifierToCourseId('1392822'),
					provider: 'hotmart',
					providerSubscriptionId: `no-hotmart-formation-${user.id}`,
					expiresAt: new Date(946_684_800),
				});
			}
		} catch (error) {
			logger.logError(`Error getting hotmart subscriptions: ${(error as Error).message}`);
		}
	}

	private async _createOrUpdateBeginnerSubscription(user: TUser): Promise<void> {
		await this.createOrUpdate({
			userId: user.id,
			courseId: convertSubscriptionIdentifierToCourseId('beginner'),
			provider: 'manual',
			providerSubscriptionId: `begginner-${user.id}`,
			expiresAt: new Date(2_556_113_460_000),
		});
	}
}
