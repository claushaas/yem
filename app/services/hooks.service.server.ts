import {UserService} from './user.service.server.js';
import SubscriptionService from './subscription.service.server.js';
import {IuguService} from './iugu.service.server.js';
import {SlackService} from './slack.service.server.js';
import {BotmakerService} from './botmaker.service.server.js';
import {MailService} from './mail.service.server.js';
import {type TServiceReturn} from '~/types/service-return.type';
import {convertSubscriptionIdentifierToCourseSlug} from '~/utils/subscription-identifier-to-course-id.js';
import {logger} from '~/utils/logger.util';
import {CustomError} from '~/utils/custom-error.js';
import {type TPlanIdentifier, type TIncommingHotmartWebhook} from '~/types/subscription.type.js';
import {convertStringToStartCase} from '~/utils/convert-string-to-start-case.js';
import {schoolWelcomeEmailTemplate} from '~/assets/email/school-welcome.email.template.server.js';
import {formationWelcomeEmailTemplate} from '~/assets/email/formation-welcome.email.template.server.js';
import {getLrMessage} from '~/utils/get-lr-message.js';
import {schoolHotmartDelayedBilletEmailTemplate} from '~/assets/email/school-hotmart-delayed-billet.email.template.server.js';
import {schoolHotmartDelayedPixEmailTemplate} from '~/assets/email/school-hotmart-delayed-pix.email.template.server.js';
import {formationHotmartDelayedBilletEmailTemplate} from '~/assets/email/formation-hotmart-delayed-billet.email.template.server.js';
import {formationHotmartDelayedPixEmailTemplate} from '~/assets/email/formation-hotmart-delayed-pix.email.template.server.js';
import {schoolHotmartFailedCreditCardEmailTemplate} from '~/assets/email/school-hotmart-failed-credit-card.email.template.server.js';
import {formationHotmartFailedCreditCardEmailTemplate} from '~/assets/email/formation-hotmart-failed-credit-card.email.template.server.js';
import {schoolHotmartPrintedBilletEmailTemplate} from '~/assets/email/school-hotmart-printed-billet.email.template.server.js';
import {schoolHotmartPrintedPixEmailTemplate} from '~/assets/email/school-hotmart-printed-pix.email.template.server.js';
import {formationHotmartPrintedBilletEmailTemplate} from '~/assets/email/formation-hotmart-printed-billet.email.template.server.js';
import {formationHotmartPrintedPixEmailTemplate} from '~/assets/email/formation-hotmart-printed-pix.email.template.server.js';

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
					await this._handleHotmartBilletPrintedWebhook(body);
					break;
				}

				case 'PURCHASE_APPROVED': {
					await this._handleHotmartPurchaseAprovedWebhook(body);
					break;
				}

				case 'PURCHASE_DELAYED': {
					await this._handleHotmartPurchaseDelayedWebhook(body);
					break;
				}

				case 'PURCHASE_OUT_OF_SHOPPING_CART': {
					await this._slackService.sendMessage(body);
					break;
				}

				case 'PURCHASE_REFUNDED': {
					await this._handleHotmartPurchaseRefundedOrChargebackWebhook(body);
					break;
				}

				case 'PURCHASE_CHARGEBACK': {
					await this._handleHotmartPurchaseRefundedOrChargebackWebhook(body);
					break;
				}

				case 'PURCHASE_PROTEST': {
					break;
				}

				case 'PURCHASE_COMPLETE': {
					break;
				}

				case 'PURCHASE_CANCELED': {
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

	public async handleIuguWebhook(body: {event: string; data: Record<string, any>}): Promise<TServiceReturn<string>> {
		const {event} = body;
		try {
			switch (event) {
				case 'invoice.status_changed': {
					await this._handleIuguInvoiceStatusChanged(body);
					break;
				}

				case 'invoice.payment_failed': {
					await this._handleIuguInvoicePaymentFailedWebhook(body);
					break;
				}

				case 'invoice.dunning_action': {
					await this._handleIuguInvoiceDunningActionWebhook(body);
					break;
				}

				case 'invoice.due': {
					break;
				}

				case 'invoice.created': {
					break;
				}

				case 'invoice.released': {
					break;
				}

				case 'invoice.refund': {
					break;
				}

				case 'invoice.installment_released': {
					break;
				}

				case 'invoice.bank_slip_status': {
					break;
				}

				case 'subscription.activated': {
					break;
				}

				case 'subscription.expired': {
					break;
				}

				case 'subscription.renewed': {
					break;
				}

				case 'subscription.suspended': {
					await this._handleIuguSubscriptionSuspendedWebhook(body);
					break;
				}

				case 'customer_payment_method.new': {
					break;
				}

				case 'withdraw_request.created': {
					break;
				}

				case 'withdraw_request.status_changed': {
					break;
				}

				default: {
					await this._slackService.sendMessage({message: 'Iugu webhook not handled', ...body});
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
					const {data: user} = await this._userService.getUserData(subscription.customer_email.toLowerCase());

					await this._subscriptionService.createOrUpdate({
						userId: user.id,
						courseSlug: convertSubscriptionIdentifierToCourseSlug(subscription.plan_identifier),
						expiresAt: new Date(subscription.expires_at),
						provider: 'iugu',
						providerSubscriptionId: subscription.id,
					});

					break;
				}

				case 'expired': {
					break;
				}

				case 'pending': {
					await this._slackService.sendMessage({message: 'Iugu invoice status changed not handled', ...body});
					break;
				}

				default: {
					await this._slackService.sendMessage({message: 'Iugu invoice status changed not handled', ...body});
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

	private async _handleIuguInvoicePaymentFailedWebhook(body: {
		event: string;
		data: Record<string, any>;
	}): Promise<TServiceReturn<string>> {
		const {data} = body;

		try {
			const {data: invoice} = await this._iuguService.getInvoiceById(data.id as string);
			const {data: user} = await this._userService.getUserData(invoice.payer_email.toLowerCase());

			const lrMessage = getLrMessage(data.lr as string);

			await this._botMakerService.sendWhatsappTemplateMessate(
				user.phoneNumber,
				'falha_de_pagamento',
				{
					primeiroNome: user.firstName,
					codigoDoErro: data.lr as string,
					descricaoDoErro: lrMessage,
					linkDaFatura: invoice.secure_url,
				},
			);

			return {
				status: 'SUCCESSFUL',
				data: 'Iugu invoice payment failed handled',
			};
		} catch (error) {
			logger.logError(`Error handling iugu invoice payment failed webhook: ${(error as Error).message}`);
			throw new CustomError('INVALID_DATA', `Error handling iugu invoice payment failed webhook: ${(error as Error).message}`);
		}
	}

	private async _handleIuguInvoiceDunningActionWebhook(body: {
		event: string;
		data: Record<string, any>;
	}): Promise<TServiceReturn<string>> {
		const {data} = body;

		try {
			const {data: invoice} = await this._iuguService.getInvoiceById(data.id as string);
			const {data: user} = await this._userService.getUserData(invoice.payer_email.toLowerCase());

			if (this._iuguService.hasCreditCardPaymentMethod(invoice)) {
				return {
					status: 'SUCCESSFUL',
					data: 'Iugu invoice dunning action handled',
				};
			}

			await Promise.all([
				this._botMakerService.sendWhatsappTemplateMessate(
					user.phoneNumber,
					'acao_de_cobranca',
					{
						nome: user.firstName,
						dataDeVencimento: new Date(invoice.due_date).toLocaleDateString(),
						linkDaFatura: invoice.secure_url,
					},
				),
				this._userService.removeRolesFromUser(user, ['escolaOnline', 'escolaAnual']),
			]);

			return {
				status: 'SUCCESSFUL',
				data: 'Iugu invoice dunning action handled',
			};
		} catch (error) {
			logger.logError(`Error handling iugu invoice dunning action webhook: ${(error as Error).message}`);
			throw new CustomError('INVALID_DATA', `Error handling iugu invoice dunning action webhook: ${(error as Error).message}`);
		}
	}

	private async _handleIuguSubscriptionSuspendedWebhook(body: {
		event: string;
		data: Record<string, any>;
	}) {
		try {
			const {data} = body;
			const {data: subscription} = await this._iuguService.getSubscriptionById(data.id as string);
			const {data: user} = await this._userService.getUserData(subscription.customer_email.toLowerCase());

			const rolesToRemove = ['escolaOnline', 'escolaAnual'];

			await this._userService.removeRolesFromUser(user, rolesToRemove);
		} catch (error) {
			logger.logError(`Error handling iugu subscription suspended webhook: ${(error as Error).message}`);
			throw new CustomError('INVALID_DATA', `Error handling iugu subscription suspended webhook: ${(error as Error).message}`);
		}
	}

	private async _handleHotmartPurchaseAprovedWebhook(body: TIncommingHotmartWebhook) {
		const {data} = body;

		const {data: {userData}} = await this._userService.createOrUpdate({
			email: data.buyer.email.toLowerCase(),
			firstName: convertStringToStartCase(data.buyer.name.split(' ')[0]),
			lastName: convertStringToStartCase(data.buyer.name.split(' ').slice(1).join(' ')),
			document: data.buyer.document,
			phoneNumber: data.buyer.checkout_phone,
			roles: ['iniciantes'],
		});

		try {
			switch (data.product.id) {
				case 1_392_822: { // Formation
					if (data.purchase.recurrence_number === 1 || (!data.purchase.recurrence_number && !data.subscription)) {
						await Promise.all([
							this._botMakerService.sendWhatsappTemplateMessate(
								userData.phoneNumber,
								'boas_vindas_formacao2',
								{
									nome: userData.firstName,
									linkCanalRecadosFormacao: 'https://t.me/joinchat/_2UwTcWJ5to3MTAx',
									linkGrupoFormacao: 'https://t.me/joinchat/gxazJsQTmwI5YzYx',
									linkSuporte: 'https://t.me/yogaemmovimento_bot',
									linkManualDoAlunoFormacao: 'https://img.amo.yoga/MANUAL_DO_ALUNO.pdf',
								},
							),
							this._mailService.sendEmail(formationWelcomeEmailTemplate(userData.firstName, userData.email)),
							fetch(process.env.SLACK_WEBHOOK_URL_FORMATION!, {
								method: 'POST',
								headers: {
									'Content-Type': 'application/json', // eslint-disable-line @typescript-eslint/naming-convention
								},
								body: JSON.stringify({text: `Novo Aluno na Formação\nNome: ${userData.firstName} ${userData.lastName}\nEmail: ${userData.email}\nTelefone: ${userData.phoneNumber}`}),
							}),
						]);
					}

					const rolesToAdd = ['iniciantes', 'escolaOnline', 'escolaAnual', 'novaFormacao'];

					let expiresAt: Date;
					if (data.purchase.recurrence_number) {
						expiresAt = data.purchase.recurrence_number < data.purchase.payment.installments_number ? new Date(data.purchase.date_next_charge!) : new Date(2_556_113_460_000);
					} else {
						expiresAt = new Date(2_556_113_460_000);
					}

					await Promise.all([
						this._userService.addRolesToUser(userData, rolesToAdd), // Should be deleted when old site stops being suported
						this._subscriptionService.createOrUpdate({
							userId: userData.id,
							courseSlug: convertSubscriptionIdentifierToCourseSlug(data.product.id.toString() as TPlanIdentifier),
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
							this._mailService.sendEmail(schoolWelcomeEmailTemplate(userData.firstName, userData.email)),
							this._botMakerService.sendWhatsappTemplateMessate(
								userData.phoneNumber,
								'escola_boas_vindas_2',
								{
									nome: userData.firstName,
									linkDaAreaDosAlunos: 'https://escola.yogaemmovimento.com',
									linkDoGrupoDeRecados: 'https://t.me/+_-lrXmqVqD1mMDk5',
									linkDaFichaMedica: 'https://img.amo.yoga/ficha-medica.pdf',
								},
							),
						]);
					}

					let rolesToAdd: string[] = [];

					if (data.subscription?.plan?.name === 'Mensal 77' || data.subscription?.plan?.name === 'Mensal boleto' || data.subscription?.plan?.name === 'Mensal') {
						rolesToAdd = ['iniciantes', 'escolaOnline'];
					} else if (data.subscription?.plan?.name === 'Anual 497' || data.subscription?.plan?.name === 'Anual - boleto' || data.subscription?.plan?.name === 'Anual') {
						rolesToAdd = ['iniciantes', 'escolaOnline', 'escolaAnual'];
					} else {
						rolesToAdd = ['iniciantes'];
					}

					await Promise.all([
						this._userService.addRolesToUser(userData, rolesToAdd), // Should be deleted when old site stops being suported
						this._subscriptionService.createOrUpdate({
							userId: userData.id,
							courseSlug: convertSubscriptionIdentifierToCourseSlug(data.subscription?.plan?.name as TPlanIdentifier) ?? convertSubscriptionIdentifierToCourseSlug(data.product.id.toString() as TPlanIdentifier),
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

	private async _handleHotmartBilletPrintedWebhook(body: TIncommingHotmartWebhook) {
		const {data} = body;

		const isSchool = data.product.id === 135_340;
		const isFormation = data.product.id === 1_392_822;

		const isBillet = data.purchase.payment.type === 'BILLET';
		const isPix = data.purchase.payment.type === 'PIX';

		const {data: {userData: user}} = await this._userService.createOrUpdate({
			email: data.buyer.email.toLowerCase(),
			firstName: convertStringToStartCase(data.buyer.name.split(' ')[0]),
			lastName: convertStringToStartCase(data.buyer.name.split(' ').slice(1).join(' ')),
			document: data.buyer.document,
			phoneNumber: data.buyer.checkout_phone,
			roles: ['iniciantes'],
		});

		if (isSchool && isBillet) {
			await Promise.all([
				// This._mailService.sendEmail(schoolWelcomeEmailTemplate(data.buyer.name, data.buyer.email)),
				this._botMakerService.sendWhatsappTemplateMessate(
					user.phoneNumber,
					'boleto_emitido_escola',
					{
						nome: user.firstName,
						linkBoleto: data.purchase.payment.billet_url!,
						codigoDoBoleto: data.purchase.payment.billet_barcode!,
					},
				),
				this._mailService.sendEmail(schoolHotmartPrintedBilletEmailTemplate(user.firstName, user.email, data.purchase.payment.billet_url!, data.purchase.payment.billet_barcode!)),
			]);
			return;
		}

		if (isSchool && isPix) {
			await Promise.all([
				// This._mailService.sendEmail(schoolWelcomeEmailTemplate(data.buyer.name, data.buyer.email)),
				this._botMakerService.sendWhatsappTemplateMessate(
					user.phoneNumber,
					'pix_emitido_escola',
					{
						nome: user.firstName,
						linkDoPix: data.purchase.payment.pix_qrcode!,
					},
				),
				this._mailService.sendEmail(schoolHotmartPrintedPixEmailTemplate(user.firstName, user.email, data.purchase.payment.pix_qrcode!)),
			]);
			return;
		}

		if (isFormation && isBillet) {
			await Promise.all([
				// This._mailService.sendEmail(formationWelcomeEmailTemplate(data.buyer.name, data.buyer.email)),
				this._botMakerService.sendWhatsappTemplateMessate(
					user.phoneNumber,
					'boleto_emitido_formacao',
					{
						nome: user.firstName,
						linkBoleto: data.purchase.payment.billet_url!,
						codigoDoBoleto: data.purchase.payment.billet_barcode!,
					},
				),
				this._mailService.sendEmail(formationHotmartPrintedBilletEmailTemplate(user.firstName, user.email, data.purchase.payment.billet_url!, data.purchase.payment.billet_barcode!)),
			]);
			return;
		}

		if (isFormation && isPix) {
			await Promise.all([
				// This._mailService.sendEmail(formationWelcomeEmailTemplate(data.buyer.name, data.buyer.email)),
				this._botMakerService.sendWhatsappTemplateMessate(
					user.phoneNumber,
					'pix_emitido_formacao',
					{
						nome: user.firstName,
						linkDoPix: data.purchase.payment.pix_qrcode!,
					},
				),
				this._mailService.sendEmail(formationHotmartPrintedPixEmailTemplate(user.firstName, user.email, data.purchase.payment.pix_qrcode!)),
			]);
			return;
		}

		await this._slackService.sendMessage({message: 'Não conseguiu lidar com webhook billet printed da hotmart', ...body});
	}

	private async _handleHotmartPurchaseDelayedWebhook(body: TIncommingHotmartWebhook) {
		const {data} = body;

		const isSchool = data.product.id === 135_340;
		const isFormation = data.product.id === 1_392_822;

		const isBillet = data.purchase.payment.type === 'BILLET';
		const isPix = data.purchase.payment.type === 'PIX';
		const isCreditCard = data.purchase.payment.type === 'CREDIT_CARD';

		const {data: {userData: user}} = await this._userService.createOrUpdate({
			email: data.buyer.email.toLowerCase(),
			firstName: convertStringToStartCase(data.buyer.name.split(' ')[0]),
			lastName: convertStringToStartCase(data.buyer.name.split(' ').slice(1).join(' ')),
			document: data.buyer.document,
			phoneNumber: data.buyer.checkout_phone,
			roles: ['iniciantes'],
		});

		if (isSchool && isBillet) {
			await Promise.all([
				this._botMakerService.sendWhatsappTemplateMessate(
					user.phoneNumber,
					'boleto_atrasado_escola',
					{
						nome: user.firstName,
						emailAluno: user.email,
					},
				),
				this._mailService.sendEmail(schoolHotmartDelayedBilletEmailTemplate(user.firstName, user.email)),
				this._userService.removeRolesFromUser(user, ['escolaOnline', 'escolaAnual']),
			]);
			return;
		}

		if (isSchool && isPix) {
			await Promise.all([
				this._botMakerService.sendWhatsappTemplateMessate(
					user.phoneNumber,
					'purchase_delayed_hotmart_school_pix',
					{
						nome: user.firstName,
						emailAluno: user.email,
						linkCompraHotmart: 'https://consumer.hotmart.com/purchase/135340',
					},
				),
				this._userService.removeRolesFromUser(user, ['escolaOnline', 'escolaAnual']),
				this._mailService.sendEmail(schoolHotmartDelayedPixEmailTemplate(user.firstName, user.email)),
			]);
			return;
		}

		if (isSchool && isCreditCard) {
			await Promise.all([
				this._botMakerService.sendWhatsappTemplateMessate(
					user.phoneNumber,
					'falha_escola_hotmart',
					{
						nome: user.firstName,
						descricaoDoErro: data.purchase.payment.refusal_reason ?? 'Transação recusada',
						emailAluno: user.email,
					},
				),
				this._userService.removeRolesFromUser(user, ['escolaOnline', 'escolaAnual']),
				this._mailService.sendEmail(schoolHotmartFailedCreditCardEmailTemplate(user.firstName, user.email, data.purchase.payment.refusal_reason ?? 'Transação recusada')),
			]);
			return;
		}

		if (isFormation && isBillet) {
			await Promise.all([
				this._botMakerService.sendWhatsappTemplateMessate(
					user.phoneNumber,
					'boleto_atrasado_formacao',
					{
						nome: user.firstName,
						emailAluno: user.email,
					},
				),
				this._userService.removeRolesFromUser(user, ['escolaOnline', 'escolaAnual', 'novaFormacao']),
				this._mailService.sendEmail(formationHotmartDelayedBilletEmailTemplate(user.firstName, user.email)),
			]);
			return;
		}

		if (isFormation && isPix) {
			await Promise.all([
				this._botMakerService.sendWhatsappTemplateMessate(
					user.phoneNumber,
					'purchase_delayed_hotmart_formation_pix',
					{
						nome: user.firstName,
						emailAluno: user.email,
					},
				),
				this._userService.removeRolesFromUser(user, ['escolaOnline', 'escolaAnual', 'novaFormacao']),
				this._mailService.sendEmail(formationHotmartDelayedPixEmailTemplate(user.firstName, user.email)),
			]);
			return;
		}

		if (isFormation && isCreditCard) {
			await Promise.all([
				this._botMakerService.sendWhatsappTemplateMessate(
					user.phoneNumber,
					'falha_de_pagamento_formacao',
					{
						nome: user.firstName,
						descricaoDoErro: data.purchase.payment.refusal_reason ?? 'Transação recusada',
						emailAluno: user.email,
					},
				),
				this._userService.removeRolesFromUser(user, ['escolaOnline', 'escolaAnual', 'novaFormacao']),
				this._mailService.sendEmail(formationHotmartFailedCreditCardEmailTemplate(user.firstName, user.email, data.purchase.payment.refusal_reason ?? 'Transação recusada')),
			]);
			return;
		}

		await this._slackService.sendMessage({message: 'Não conseguiu lidar com a compra atrasada da hotmart', ...body});
	}

	private async _handleHotmartPurchaseRefundedOrChargebackWebhook(body: TIncommingHotmartWebhook) {
		const {data} = body;

		const isSchool = 135_340;
		const isFormation = 1_392_822;

		const {data: {userData: user}} = await this._userService.createOrUpdate({
			email: data.buyer.email.toLowerCase(),
			firstName: convertStringToStartCase(data.buyer.name.split(' ')[0]),
			lastName: convertStringToStartCase(data.buyer.name.split(' ').slice(1).join(' ')),
			document: data.buyer.document,
			phoneNumber: data.buyer.checkout_phone,
			roles: ['iniciantes'],
		});

		try {
			switch (data.product.id) {
				case isSchool: {
					const rolesToRemove = ['escolaOnline', 'escolaAnual'];
					await Promise.all([
						this._userService.removeRolesFromUser(user, rolesToRemove),
						this._subscriptionService.createOrUpdate({
							userId: user.id,
							courseSlug: convertSubscriptionIdentifierToCourseSlug(data.subscription?.plan?.name as TPlanIdentifier) ?? convertSubscriptionIdentifierToCourseSlug(data.product.id.toString() as TPlanIdentifier),
							expiresAt: new Date(),
							provider: 'hotmart',
							providerSubscriptionId: data.subscription?.subscriber.code ?? data.purchase.transaction,
						}),
					]);
					break;
				}

				case isFormation: {
					const rolesToRemove = ['escolaOnline', 'escolaAnual', 'novaFormacao'];
					await Promise.all([
						this._userService.removeRolesFromUser(user, rolesToRemove),
						this._subscriptionService.createOrUpdate({
							userId: user.id,
							courseSlug: convertSubscriptionIdentifierToCourseSlug(data.product.id.toString() as TPlanIdentifier),
							expiresAt: new Date(),
							provider: 'hotmart',
							providerSubscriptionId: data.subscription?.subscriber.code ?? data.purchase.transaction,
						}),
					]);
					break;
				}

				default: {
					break;
				}
			}
		} catch (error) {
			await this._slackService.sendMessage({...body, message: `Error handling hotmart purchase refunded webhook: ${(error as Error).message}`});
			logger.logError(`Error handling hotmart purchase refunded webhook: ${(error as Error).message}`);
		}
	}
}
