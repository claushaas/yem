import {type PrismaClient} from '@prisma/client';
import {type TUser} from '../types/user.type.js';
import {type TServiceReturn} from '../types/service-return.type.js';
import {Subscription} from '../entities/subscription.entity.server.js';
import {type TPrismaPayloadGetUserSubscriptions, type TSubscription} from '../types/subscription.type.js';
import {logger} from '../utils/logger.util.js';
import {database} from '../database/database.server.js';
import {HotmartService} from './hotmart.service.server.js';
import {IuguService} from './iugu.service.server.js';
import {MauticService} from './mautic.service.server.js';
import {CustomError} from '~/utils/custom-error.js';
import {convertSubscriptionIdentifierToCourseSlug} from '~/utils/subscription-identifier-to-course-id.js';
import {memoryCache} from '~/cache/memory-cache.js';
import {userHasOldFormationRoles, userHasYPGRoles, userHasVinyasaRoles} from '~/utils/test-user-roles-for-old-courses.js';

export default class SubscriptionService {
	private static cache: typeof memoryCache;
	private readonly _model: PrismaClient;
	private readonly _hotmartService: HotmartService;
	private readonly _iuguService: IuguService;
	private readonly _mauticService: MauticService;

	constructor(model: PrismaClient = database) {
		this._model = model;
		this._hotmartService = new HotmartService();
		this._iuguService = new IuguService();
		SubscriptionService.cache = memoryCache;
		this._mauticService = new MauticService();
	}

	public async createOrUpdate(subscriptionData: TSubscription): Promise<TServiceReturn<Subscription>> {
		const subscription = new Subscription(subscriptionData);

		const createdOrUpdatedSubscription = await this._model.userSubscriptions.upsert({
			where: {
				// eslint-disable-next-line @typescript-eslint/naming-convention
				userId_courseSlug_providerSubscriptionId: {
					userId: subscription.userId,
					courseSlug: subscription.courseSlug,
					providerSubscriptionId: subscription.providerSubscriptionId,
				},
			},
			update: {
				expiresAt: subscription.expiresAt,
			},
			create: {
				userId: subscription.userId,
				courseSlug: subscription.courseSlug,
				expiresAt: subscription.expiresAt,
				provider: subscription.provider,
				providerSubscriptionId: subscription.providerSubscriptionId,
			},
		});

		if (new Date(createdOrUpdatedSubscription.expiresAt) > new Date()) {
			SubscriptionService.cache.set(`${subscription.courseSlug}:${subscription.userId}`, JSON.stringify(createdOrUpdatedSubscription));
		}

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
				&& (subscription.courseSlug === 'escola-online' || subscription.courseSlug === 'escola-anual')));
		const hasHotmartFormationSubscriptions = actualSubscriptions?.some(subscription =>
			(subscription.provider === 'hotmart' && subscription.courseSlug === 'formacao-em-yoga-introducao'));
		const hasBeginnerSubscription = actualSubscriptions?.some(subscription => subscription.courseSlug === 'yoga-para-iniciantes');
		const hasOldFormationSubscriptions = actualSubscriptions?.some(subscription => subscription.courseSlug === 'formacao-de-instrutores');
		const hasYPGSubscription = actualSubscriptions?.some(subscription => subscription.courseSlug === 'formacao-em-yoga-para-gestantes');
		const hasVinyasaSubscription = actualSubscriptions?.some(subscription => subscription.courseSlug === 'especializacao-em-vinyasa-yoga');

		if (!hasIuguSubscriptions || !hasHotmartSchoolSubscriptions || !hasHotmartFormationSubscriptions || !hasBeginnerSubscription || !hasOldFormationSubscriptions || !hasYPGSubscription || !hasVinyasaSubscription) {
			await Promise.all([
				!hasIuguSubscriptions && this._createUserIuguSubscriptions(user),
				!hasHotmartSchoolSubscriptions && this._createUserHotmartSchoolSubscriptions(user),
				!hasHotmartFormationSubscriptions && this._createUserHotmartFormationSubscriptions(user),
				!hasBeginnerSubscription && this._createOrUpdateBeginnerSubscription(user),
				!hasOldFormationSubscriptions && this._createOrUpdateOldFormationSubscription(user),
				!hasYPGSubscription && this._createOrUpdateYPGSubscription(user),
				!hasVinyasaSubscription && this._createOrUpdateVinyasaSubscription(user),
			]);
		}

		return {
			status: 'NO_CONTENT',
			data: 'Subscriptions created or updated successfully',
		};
	}

	public async resetUserSubscriptions(user: TUser): Promise<TServiceReturn<string>> {
		try {
			await this._model.userSubscriptions.deleteMany({
				where: {
					userId: user.id,
				},
			});

			await this.createUserInitialSubscriptions(user);

			return {
				status: 'NO_CONTENT',
				data: 'Subscriptions reset successfully',
			};
		} catch (error) {
			logger.logError(`Error resetting user subscriptions: ${(error as Error).message}`);
			throw new CustomError('UNKNOWN', `Error resetting user subscriptions: ${(error as Error).message}`);
		}
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
				await Promise.all([
					iuguSubscriptions.map(async subscription => {
						await this.createOrUpdate(subscription);
					}),
					this._mauticService.addContactToSegmentByEmail(user.email, 6),
				]);
			} else if (iuguSubscriptions.length === 0) {
				await this.createOrUpdate({
					userId: user.id,
					courseSlug: convertSubscriptionIdentifierToCourseSlug('escola_mensal'),
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
				await Promise.all([
					hotmartSubscriptions.map(async subscription => {
						await this.createOrUpdate(subscription);
					}),
					this._mauticService.addContactToSegmentByEmail(user.email, 6),
				]);
			} else if (hotmartSubscriptions.length === 0) {
				await this.createOrUpdate({
					userId: user.id,
					courseSlug: convertSubscriptionIdentifierToCourseSlug('escola_mensal'),
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

			if (hotmartSubscriptions.length > 0 || (hotmartSubscriptions.length === 0 && user.roles?.includes('novaFormacao'))) {
				await Promise.all([
					hotmartSubscriptions.length > 0 && hotmartSubscriptions.map(async subscription => {
						await this.createOrUpdate(subscription);
					}),
					(hotmartSubscriptions.length === 0 && user.roles?.includes('novaFormacao')) && this.createOrUpdate({
						userId: user.id,
						courseSlug: convertSubscriptionIdentifierToCourseSlug('1392822'),
						provider: 'hotmart',
						providerSubscriptionId: `no-hotmart-formation-${user.id}`,
						expiresAt: new Date(2_556_113_460_000),
					}),
					this._mauticService.addContactToSegmentByEmail(user.email, 2),
				]);
			} else if (hotmartSubscriptions.length === 0 && !user.roles?.includes('novaFormacao')) {
				await this.createOrUpdate({
					userId: user.id,
					courseSlug: convertSubscriptionIdentifierToCourseSlug('1392822'),
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
			courseSlug: convertSubscriptionIdentifierToCourseSlug('beginner'),
			provider: 'manual',
			providerSubscriptionId: `begginner-${user.id}`,
			expiresAt: new Date(2_556_113_460_000),
		});
	}

	private async _createOrUpdateOldFormationSubscription(user: TUser): Promise<void> {
		if (userHasOldFormationRoles(user)) {
			await Promise.all([
				this.createOrUpdate({
					userId: user.id,
					courseSlug: convertSubscriptionIdentifierToCourseSlug('oldFormation'),
					provider: 'manual',
					providerSubscriptionId: `old-formation-${user.id}`,
					expiresAt: new Date(2_556_113_460_000),
				}),
				this._mauticService.addContactToSegmentByEmail(user.email, 5),
			]);
		} else {
			await this.createOrUpdate({
				userId: user.id,
				courseSlug: convertSubscriptionIdentifierToCourseSlug('oldFormation'),
				provider: 'manual',
				providerSubscriptionId: `no-oldFormation-${user.id}`,
				expiresAt: new Date(946_684_800),
			});
		}
	}

	private async _createOrUpdateYPGSubscription(user: TUser): Promise<void> {
		if (userHasYPGRoles(user)) {
			await this.createOrUpdate({
				userId: user.id,
				courseSlug: convertSubscriptionIdentifierToCourseSlug('ypg'),
				provider: 'manual',
				providerSubscriptionId: `ypg-${user.id}`,
				expiresAt: new Date(2_556_113_460_000),
			});
		} else {
			await this.createOrUpdate({
				userId: user.id,
				courseSlug: convertSubscriptionIdentifierToCourseSlug('ypg'),
				provider: 'manual',
				providerSubscriptionId: `no-ypg-${user.id}`,
				expiresAt: new Date(946_684_800),
			});
		}
	}

	private async _createOrUpdateVinyasaSubscription(user: TUser): Promise<void> {
		if (userHasVinyasaRoles(user)) {
			await this.createOrUpdate({
				userId: user.id,
				courseSlug: convertSubscriptionIdentifierToCourseSlug('vinyasa'),
				provider: 'manual',
				providerSubscriptionId: `vinyasa-${user.id}`,
				expiresAt: new Date(2_556_113_460_000),
			});
		} else {
			await this.createOrUpdate({
				userId: user.id,
				courseSlug: convertSubscriptionIdentifierToCourseSlug('vinyasa'),
				provider: 'manual',
				providerSubscriptionId: `no-vinyasa-${user.id}`,
				expiresAt: new Date(946_684_800),
			});
		}
	}
}
