/* eslint-disable complexity */
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

				case 'PURCHASE_COMPLETE': {
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

				case 'subscription.activated': {
					break;
				}

				case 'subscription.expired': {
					break;
				}

				case 'subscription.renewed': {
					break;
				}

				case 'invoice.created': {
					break;
				}

				case 'invoice.released': {
					break;
				}

				case 'invoice.installment_released': {
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
					const {data: user} = await this._userService.getUserData(subscription.customer_email);

					await Promise.all([
						this._subscriptionService.createOrUpdate({
							userId: user.id,
							courseSlug: convertSubscriptionIdentifierToCourseSlug(subscription.plan_identifier),
							expiresAt: new Date(subscription.expires_at),
							provider: 'iugu',
							providerSubscriptionId: subscription.id,
						}),
						this._slackService.sendMessage({message: `Assinatura iugu atualizada\nNome: ${user.firstName} ${user.lastName}\nEmail: ${user.email}\nTelefone: ${user.phoneNumber}`}),
					]);
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

	private async _handleHotmartPurchaseAprovedWebhook(body: TIncommingHotmartWebhook) {
		const {data} = body;

		let userData: TUser;

		try {
			const {data: user} = await this._userService.getUserData(data.buyer.email);

			userData = user;
		} catch (error) {
			logger.logError(`Error getting user data on handleHotmartPurchaseAprovedWebhook: ${(error as Error).message}`);

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
							fetch(process.env.SLACK_WEBHOOK_URL_FORMATION!, {
								method: 'POST',
								headers: {
									'Content-Type': 'application/json', // eslint-disable-line @typescript-eslint/naming-convention
								},
								body: JSON.stringify({text: `Novo Aluno na Formação\nNome: ${userData!.firstName} ${userData!.lastName}\nEmail: ${userData!.email}\nTelefone: ${userData!.phoneNumber}`}),
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
						this._userService.addRolesToUser(userData!, rolesToAdd), // Should be deleted when old site stops being suported
						this._subscriptionService.createOrUpdate({
							userId: userData!.id,
							courseSlug: convertSubscriptionIdentifierToCourseSlug(data.product.id.toString() as TPlanIdentifier),
							expiresAt,
							provider: 'hotmart',
							providerSubscriptionId: data.subscription?.subscriber.code ?? data.purchase.transaction,
						}),
						this._slackService.sendMessage({message: `Assinatura hotmart da formação atualizada\nNome: ${userData!.firstName} ${userData!.lastName}\nEmail: ${userData!.email}\nTelefone: ${userData!.phoneNumber}`}),
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

					let rolesToAdd: string[] = [];

					if (data.subscription?.plan?.name === 'Mensal 77' || data.subscription?.plan?.name === 'Mensal boleto' || data.subscription?.plan?.name === 'Mensal') {
						rolesToAdd = ['iniciantes', 'escolaOnline'];
					} else if (data.subscription?.plan?.name === 'Anual 497' || data.subscription?.plan?.name === 'Anual - boleto' || data.subscription?.plan?.name === 'Anual') {
						rolesToAdd = ['iniciantes', 'escolaOnline', 'escolaAnual'];
					} else {
						rolesToAdd = ['iniciantes'];
					}

					await Promise.all([
						this._userService.addRolesToUser(userData!, rolesToAdd), // Should be deleted when old site stops being suported
						this._subscriptionService.createOrUpdate({
							userId: userData!.id,
							courseSlug: convertSubscriptionIdentifierToCourseSlug(data.subscription?.plan?.name as TPlanIdentifier) ?? convertSubscriptionIdentifierToCourseSlug(data.product.id.toString() as TPlanIdentifier),
							expiresAt: new Date(data.purchase.date_next_charge!),
							provider: 'hotmart',
							providerSubscriptionId: data.subscription?.subscriber.code ?? data.purchase.transaction,
						}),

						this._slackService.sendMessage({message: `Assinatura hotmart da escola atualizada\nNome: ${userData!.firstName} ${userData!.lastName}\nEmail: ${userData!.email}\nTelefone: ${userData!.phoneNumber}`}),
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

		let user: TUser;

		try {
			const {data: userData} = await this._userService.getUserData(data.buyer.email);

			user = userData;
		} catch (error) {
			if ((error as Error).message.includes('User does not exist')) {
				const {data: {userId}} = await this._userService.createOrFail({
					email: data.buyer.email,
					firstName: convertStringToStartCase(data.buyer.name.split(' ')[0]),
					lastName: convertStringToStartCase(data.buyer.name.split(' ').slice(1).join(' ')),
					document: data.buyer.document,
					phoneNumber: data.buyer.checkout_phone,
					roles: ['iniciantes'],
				});

				const {data: userData} = await this._userService.getUserData(userId);

				user = userData;
			}
		}

		if (isSchool && isBillet) {
			await Promise.all([
				// This._mailService.sendEmail(schoolWelcomeEmailTemplate(data.buyer.name, data.buyer.email)),
				this._botMakerService.sendWhatsappTemplateMessate(
					user!.phoneNumber,
					'boleto_emitido_escola',
					{
						nome: user!.firstName,
						linkBoleto: data.purchase.payment.billet_url!,
						codigoDoBoleto: data.purchase.payment.billet_barcode!,
					},
				),
			]);
			return;
		}

		if (isSchool && isPix) {
			await Promise.all([
				// This._mailService.sendEmail(schoolWelcomeEmailTemplate(data.buyer.name, data.buyer.email)),
				this._botMakerService.sendWhatsappTemplateMessate(
					user!.phoneNumber,
					'pix_emitido_escola',
					{
						nome: user!.firstName,
						linkDoPix: data.purchase.payment.pix_qrcode!,
					},
				),
			]);
			return;
		}

		if (isFormation && isBillet) {
			await Promise.all([
				// This._mailService.sendEmail(formationWelcomeEmailTemplate(data.buyer.name, data.buyer.email)),
				this._botMakerService.sendWhatsappTemplateMessate(
					user!.phoneNumber,
					'boleto_emitido_formacao',
					{
						nome: user!.firstName,
						linkBoleto: data.purchase.payment.billet_url!,
						codigoDoBoleto: data.purchase.payment.billet_barcode!,
					},
				),
			]);
			return;
		}

		if (isFormation && isPix) {
			await Promise.all([
				// This._mailService.sendEmail(formationWelcomeEmailTemplate(data.buyer.name, data.buyer.email)),
				this._botMakerService.sendWhatsappTemplateMessate(
					user!.phoneNumber,
					'pix_emitido_formacao',
					{
						nome: user!.firstName,
						linkDoPix: data.purchase.payment.pix_qrcode!,
					},
				),
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

		const {data: user} = await this._userService.getUserData(data.buyer.email);

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
			]);
			return;
		}

		await this._slackService.sendMessage({message: 'Não conseguiu lidar com a compra atrasada da hotmart', ...body});
	}
}
