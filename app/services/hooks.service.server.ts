import {UserService} from './user.service.server.js';
import SubscriptionService from './subscription.service.server.js';
import {IuguService} from './iugu.service.server.js';
import {SlackService} from './slack.service.server.js';
import {BotmakerService} from './botmaker.service.server.js';
import {MailService} from './mail.service.server.js';
import {type TServiceReturn} from '~/types/service-return.type';
import {convertSubscriptionIdentifierToCourseId} from '~/utils/subscription-identifier-to-course-id.js';
import {logger} from '~/utils/logger.util';
import {CustomError} from '~/utils/custom-error.js';
import {type TPlanIdentifier, type TIncommingHotmartWebhook} from '~/types/subscription.type.js';
import {type TUser} from '~/types/user.type.js';
import {convertStringToStartCase} from '~/utils/convert-string-to-start-case.js';
import {schoolWelcomeEmailTemplate} from '~/assets/email/school-welcome.email.template.server.js';
import {formationWelcomeEmailTemplate} from '~/assets/email/formation-welcome.email.template.server.js';

export class HooksService {
	private readonly _userService: UserService;
	private readonly _subscriptionService: SubscriptionService;
	private readonly _slackService: SlackService;
	private readonly _iuguService: IuguService;
	private readonly _botMakerService: BotmakerService;
	private readonly _mailService: MailService;

	constructor() {
		this._userService = new UserService();
		this._subscriptionService = new SubscriptionService();
		this._slackService = new SlackService();
		this._iuguService = new IuguService();
		this._botMakerService = new BotmakerService();
		this._mailService = new MailService();
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
					await this._handleHotmartPurchaseAprovedWebhook(body);
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

	private async _handleHotmartPurchaseAprovedWebhook(body: TIncommingHotmartWebhook) {
		const {data} = body;

		let userData: TUser;

		try {
			const {data: user} = await this._userService.getUserData(data.buyer.email);

			userData = user;
		} catch (error) {
			logger.logError(`Error getting user data on handleHotmartPurchaseAprovedWebhook: ${(error as Error).message}`);
			console.log('error', error);
			if ((error as Error).message.includes('User does not exist')) {
				const {data: {userId}} = await this._userService.createOrFail({
					email: data.buyer.email,
					firstName: convertStringToStartCase(data.buyer.name.split(' ')[0]),
					lastName: convertStringToStartCase(data.buyer.name.split(' ').slice(1).join(' ')),
					document: data.buyer.document,
					phoneNumber: data.buyer.checkout_phone,
					roles: ['iniciantes'],
				});

				const {data: user} = await this._userService.getUserData(userId);

				userData = user;
			}
		}

		try {
			switch (data.product.id) {
				case 1_392_822: { // Formation
					if (data.purchase.recurrence_number === 1 || (!data.purchase.recurrence_number && !data.subscription)) {
						await Promise.all([
							this._botMakerService.sendWhatsappTemplateMessate(
								userData!.phoneNumber,
								'boas_vindas_formacao2',
								{
									nome: userData!.firstName,
									linkCanalRecadosFormacao: 'https://t.me/joinchat/_2UwTcWJ5to3MTAx',
									linkGrupoFormacao: 'https://t.me/joinchat/gxazJsQTmwI5YzYx',
									linkSuporte: 'https://t.me/yogaemmovimento_bot',
									linkManualDoAlunoFormacao: 'https://img.amo.yoga/MANUAL_DO_ALUNO.pdf',
								},
							),
							this._mailService.sendEmail(formationWelcomeEmailTemplate(userData!.firstName, userData!.email)),
						]);
					}

					const rolesToAdd = ['iniciantes', 'escolaOnline', 'escolaAnual', 'novaFormacao'];

					const expiresAt = data.purchase.recurrence_number
						? (data.purchase.recurrence_number < data.purchase.payment.installments_number ? new Date(data.purchase.date_next_charge!)
							: new Date(2_556_113_460_000))
						: new Date(2_556_113_460_000);

					await Promise.all([
						this._userService.addRolesToUser(userData!, rolesToAdd), // Should be deleted when old site stops being suported
						this._subscriptionService.createOrUpdate({
							userId: userData!.id,
							courseId: convertSubscriptionIdentifierToCourseId(data.product.id.toString() as TPlanIdentifier),
							expiresAt,
							provider: 'hotmart',
							providerSubscriptionId: data.subscription?.subscriber.code ?? data.purchase.transaction,
						}),
					]);

					break;
				}

				case 135_340: { // School
					if (data.purchase.recurrence_number === 1) {
						await Promise.all([
							this._mailService.sendEmail(schoolWelcomeEmailTemplate(userData!.firstName, userData!.email)),
							this._botMakerService.sendWhatsappTemplateMessate(
								userData!.phoneNumber,
								'boas_vindas_escola',
								{
									nome: userData!.firstName,
									linkDaAreaDosAlunos: 'https://escola.yogaemmovimento.com',
									linkDaAulaAoVivo: 'https://escola.yogaemmovimento.com/aluno/DfLC8966upYGytkrW',
								},
							),
						]);
					}

					const rolesToAdd
						= (data.subscription?.plan?.name === 'Mensal 77') || (data.subscription?.plan?.name === 'Mensal boleto') ? ['iniciantes', 'escolaOnline']
							: ((data.subscription?.plan?.name === 'Anual 497') || (data.subscription?.plan?.name === 'Anual - boleto') ? ['iniciantes', 'escolaOnline', 'escolaAnual']
								: ['iniciantes']);

					await Promise.all([
						this._userService.addRolesToUser(userData!, rolesToAdd), // Should be deleted when old site stops being suported
						this._subscriptionService.createOrUpdate({
							userId: userData!.id,
							courseId: convertSubscriptionIdentifierToCourseId(data.product.id.toString() as TPlanIdentifier),
							expiresAt: new Date(data.purchase.date_next_charge!),
							provider: 'hotmart',
							providerSubscriptionId: data.subscription?.subscriber.code ?? data.purchase.transaction,
						}),
					]);

					break;
				}

				default: {
					await this._slackService.sendMessage({...body, message: 'Product not found'});
					break;
				}
			}
		} catch (error) {
			await this._slackService.sendMessage({...body, message: `Error handling hotmart purchase aproved webhook: ${(error as Error).message}`});
			logger.logError(`Error handling hotmart purchase aproved webhook: ${(error as Error).message}`);
		}
	}
}
