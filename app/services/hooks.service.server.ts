import {UserService} from './user.service.server.js';
import SubscriptionService from './subscription.service.server.js';
import {IuguService} from './iugu.service.server.js';
import {SlackService} from './slack.service.server.js';
import {type TServiceReturn} from '~/types/service-return.type';
import {convertSubscriptionIdentifierToCourseId} from '~/utils/subscription-identifier-to-course-id.js';
import {logger} from '~/utils/logger.util';
import {CustomError} from '~/utils/custom-error.js';
import {type TIncommingHotmartWebhook} from '~/types/subscription.type.js';

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

	public async handleHotmartWebhook(body: TIncommingHotmartWebhook): Promise<TServiceReturn<string>> {
		const {event} = body;

		try {
			switch (event) {
				case 'PURCHASE_BILLET_PRINTED': {
					// Emissão de boleto e código pix
					// 1 - Verificar se usuário existe
					// 1.1 - Criar usuário novo caso usuário não exista
					// 2 - enviar mensagem e email com dados do boleto ou pix
					await this._slackService.sendMessage(body);
					break;
				}

				case 'PURCHASE_APPROVED': {
					// Compra aprovada
					// 1 - Verificar se usuário existe
					// 1.1 - Criar usuário novo caso usuário não exista
					// 2 - Criar ou atualizar assinatura
					// 3 - Verificar se é uma compra nova ou renovação
					// 3.1 - Caso seja compra nova, enviar mensagem e email de boas vindas
					await this._slackService.sendMessage(body);
					break;
				}

				case 'PURCHASE_DELAYED': {
					// Compra com atraso
					// Enviar mensagem e email com aviso sobre atraso de pagamento
					await this._slackService.sendMessage(body);
					break;
				}

				default: {
					await this._slackService.sendMessage(body);
					break;
				}
			}

			return {
				status: 'SUCCESSFUL',
				data: 'Webhook received',
			};
		} catch (error) {
			logger.logError(`Error handling hotmart webhook: ${(error as Error).message}`);
			throw new CustomError('INVALID_DATA', `Error handling hotmart webhook: ${(error as Error).message}`);
		}
	}

	public async handleIuguWebhook(body: {
		event: string;
		data: Record<string, any>;
	}): Promise<TServiceReturn<string>> {
		const {event} = body;
		try {
			switch (event) {
				case 'invoice.status_changed': {
					await this._handleIuguInvoiceStatusChanged(body);
					break;
				}

				default: {
					await this._slackService.sendMessage(body);
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

					await this._subscriptionService.createOrUpdate({
						userId: user.id,
						courseId: convertSubscriptionIdentifierToCourseId(subscription.plan_identifier),
						expiresAt: new Date(subscription.expires_at),
						provider: 'iugu',
						providerSubscriptionId: subscription.id,
					});
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
