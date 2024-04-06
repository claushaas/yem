import {UserService} from './user.service.js';
import SubscriptionService from './subscription.service.js';
import {IuguService} from './iugu.service.js';
import {SlackService} from './slack.service.js';
import {type TServiceReturn} from '~/types/service-return.type';
import {convertSubscriptionIdentifierToCourseId} from '~/utils/subscription-identifier-to-course-id.js';
import {logger} from '~/utils/logger.util';
import {CustomError} from '~/utils/custom-error.js';

export class HooksService {
	private readonly _userService: UserService;
	private readonly _subscriptionService: SubscriptionService;
	private readonly _slackService: SlackService;
	private readonly _iuguService: IuguService;

	constructor() {
		this._userService = new UserService();
		this._subscriptionService = new SubscriptionService();
		this._slackService = new SlackService();
		this._iuguService = new IuguService();
	}

	public async handleIuguWebhook(body: {
		event: string;
		data: Record<string, any>;
	}): Promise<TServiceReturn<string>> {
		const {event, data} = body;
		try {
			switch (event) {
				case 'invoice.status_changed': {
					await this._handleIuguInvoiceStatusChanged(body);
					break;
				}

				default: {
					await this._slackService.sendMessage(data);
					console.log('default');
					break;
				}
			}

			return {
				status: 'SUCCESSFUL',
				data: 'Webhook received',
			};
		} catch (error) {
			logger.logError(`Error handling iugu webhook: ${(error as Error).message}`);
			throw new CustomError('INVALID_DATA', `Error handling iugu webhook: ${(error as Error).message}`);
		}
	}

	private async _handleIuguInvoiceStatusChanged(body: {
		event: string;
		data: Record<string, any>;
	}): Promise<TServiceReturn<string>> {
		const {data} = body;
		try {
			switch (data.status) {
				case 'paid': {
					const {data: subscription} = await this._iuguService.getSubscriptionById(data.subscription_id as string);
					const {data: user} = await this._userService.getUserData(subscription.customer_email);

					const createdSubscription = await this._subscriptionService.createOrUpdate({
						userId: user.id,
						courseId: convertSubscriptionIdentifierToCourseId(subscription.plan_identifier),
						expiresAt: new Date(subscription.expires_at),
						provider: 'iugu',
						providerSubscriptionId: subscription.id,
					});

					console.log('Subscription created', createdSubscription);
					break;
				}

				default: {
					await this._slackService.sendMessage(body);
					break;
				}
			}

			return {
				status: 'SUCCESSFUL',
				data: 'Iugu invoice status changed handled',
			};
		} catch (error) {
			logger.logError(`Error handling iugu invoice status changed webhook: ${(error as Error).message}`);
			throw new CustomError('INVALID_DATA', `Error handling iugu invoice status changed webhook: ${(error as Error).message}`);
		}
	}
}
