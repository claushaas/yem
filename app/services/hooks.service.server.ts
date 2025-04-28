/* eslint-disable complexity */
/** biome-ignore-all lint/suspicious/noExplicitAny: <explanation> */

import { formationHotmartDelayedBilletEmailTemplate } from '~/assets/email/formation-hotmart-delayed-billet.email.template.server.js';
import { formationHotmartDelayedPixEmailTemplate } from '~/assets/email/formation-hotmart-delayed-pix.email.template.server.js';
import { formationHotmartFailedCreditCardEmailTemplate } from '~/assets/email/formation-hotmart-failed-credit-card.email.template.server.js';
import { formationHotmartPrintedBilletEmailTemplate } from '~/assets/email/formation-hotmart-printed-billet.email.template.server.js';
import { formationHotmartPrintedPixEmailTemplate } from '~/assets/email/formation-hotmart-printed-pix.email.template.server.js';
import { formationWelcomeEmailTemplate } from '~/assets/email/formation-welcome.email.template.server.js';
import { schoolHotmartDelayedBilletEmailTemplate } from '~/assets/email/school-hotmart-delayed-billet.email.template.server.js';
import { schoolHotmartDelayedPixEmailTemplate } from '~/assets/email/school-hotmart-delayed-pix.email.template.server.js';
import { schoolHotmartFailedCreditCardEmailTemplate } from '~/assets/email/school-hotmart-failed-credit-card.email.template.server.js';
import { schoolHotmartPrintedBilletEmailTemplate } from '~/assets/email/school-hotmart-printed-billet.email.template.server.js';
import { schoolHotmartPrintedPixEmailTemplate } from '~/assets/email/school-hotmart-printed-pix.email.template.server.js';
import { schoolWelcomeEmailTemplate } from '~/assets/email/school-welcome.email.template.server.js';
import { type THublaEvents } from '~/types/hubla.type.js';
import { type TServiceReturn } from '~/types/service-return.type';
import {
	type TIncommingHotmartWebhook,
	type TPlanIdentifier,
} from '~/types/subscription.type.js';
import { convertStringToStartCase } from '~/utils/convert-string-to-start-case.js';
import { CustomError } from '~/utils/custom-error.js';
import { getLrMessage } from '~/utils/get-lr-message.js';
import { logger } from '~/utils/logger.util';
import { convertSubscriptionIdentifierToCourseSlug } from '~/utils/subscription-identifier-to-course-id.js';
import { BotmakerService } from './botmaker.service.server.js';
import { IuguService } from './iugu.service.server.js';
import { MailService } from './mail.service.server.js';
import { MauticService } from './mautic.service.server.js';
import { SlackService } from './slack.service.server.js';
import SubscriptionService from './subscription.service.server.js';
import { UserService } from './user.service.server.js';

export class HooksService {
	private readonly _userService: UserService;
	private readonly _subscriptionService: SubscriptionService;
	private readonly _slackService: SlackService;
	private readonly _iuguService: IuguService;
	private readonly _botMakerService: BotmakerService;
	private readonly _mailService: MailService;
	private readonly _mauticService: MauticService;

	constructor() {
		this._userService = new UserService();
		this._subscriptionService = new SubscriptionService();
		this._slackService = new SlackService();
		this._iuguService = new IuguService();
		this._botMakerService = new BotmakerService();
		this._mailService = new MailService();
		this._mauticService = new MauticService();
	}

	public async handleHublaWebhook(
		body: THublaEvents,
	): Promise<TServiceReturn<string>> {
		const { type } = body;

		try {
			switch (type) {
				case 'AbandonedCheckout': {
					break;
				}

				case 'NewSale': {
					break;
				}

				case 'invoice.created': {
					break;
				}

				case 'invoice.payment_succeeded': {
					const {
						data: { userData: user },
					} = await this._userService.createOrUpdate({
						document: body.event.user.document,
						email: body.event.user.email.toLowerCase(),
						firstName: convertStringToStartCase(body.event.user.firstName),
						lastName: convertStringToStartCase(body.event.user.lastName),
						phoneNumber: body.event.user.phone,
						roles: ['iniciantes'],
					});

					await Promise.all([
						this._slackService.sendMessage(body),
						this._botMakerService.sendWhatsappTemplateMessate(
							user.phoneNumber,
							'boas_vindas_formacao2',
							{
								linkCanalRecadosFormacao:
									'https://t.me/joinchat/_2UwTcWJ5to3MTAx',
								linkGrupoFormacao: 'https://t.me/joinchat/gxazJsQTmwI5YzYx',
								linkManualDoAlunoFormacao:
									'https://img.amo.yoga/MANUAL_DO_ALUNO.pdf',
								linkSuporte: 'https://t.me/yogaemmovimento_bot',
								nome: user.firstName,
							},
						),
						this._mailService.sendEmail(
							formationWelcomeEmailTemplate(user.firstName, user.email),
						),
						fetch(process.env.SLACK_WEBHOOK_URL_FORMATION!, {
							body: JSON.stringify({
								text: `Novo Aluno na Formação\nNome: ${user.firstName} ${user.lastName}\nEmail: ${user.email}\nTelefone: ${user.phoneNumber}`,
							}),
							headers: {
								'Content-Type': 'application/json', // eslint-disable-line @typescript-eslint/naming-convention
							},
							method: 'POST',
						}),
						this._mauticService.addContactToSegment(user.email, 2),
					]);

					const rolesToAdd = [
						'iniciantes',
						'escolaOnline',
						'escolaAnual',
						'novaFormacao',
					];

					let expiresAt: Date;
					if (
						body.event.invoice.smartInstallment.installments >
						body.event.invoice.smartInstallment.installment
					) {
						expiresAt = new Date();
						expiresAt.setDate(expiresAt.getDate() + 35);
					} else {
						expiresAt = new Date(2_556_113_460_000);
					}

					await Promise.all([
						this._userService.addRolesToUser(user, rolesToAdd), // Should be deleted when old site stops being suported
						this._subscriptionService.createOrUpdate({
							courseSlug:
								convertSubscriptionIdentifierToCourseSlug('novaFormacao'),
							expiresAt,
							provider: 'hubla',
							providerSubscriptionId: body.event.invoice.subscriptionId,
							userId: user.id,
						}),
					]);

					break;
				}

				case 'invoice.refunded': {
					const rolesToRemove = ['escolaOnline', 'escolaAnual', 'novaFormacao'];

					const {
						data: { userData: user },
					} = await this._userService.createOrUpdate({
						document: body.event.user.document,
						email: body.event.user.email.toLowerCase(),
						firstName: convertStringToStartCase(body.event.user.firstName),
						lastName: convertStringToStartCase(body.event.user.lastName),
						phoneNumber: body.event.user.phone,
						roles: ['iniciantes'],
					});

					await Promise.all([
						this._userService.removeRolesFromUser(user, rolesToRemove),
						this._subscriptionService.createOrUpdate({
							courseSlug:
								convertSubscriptionIdentifierToCourseSlug('novaFormacao'),
							expiresAt: new Date(),
							provider: 'hubla',
							providerSubscriptionId: body.event.invoice.subscriptionId,
							userId: user.id,
						}),
					]);

					break;
				}

				default: {
					await this._slackService.sendMessage(body);
					break;
				}
			}

			return {
				data: 'Hubla Webhook received',
				status: 'SUCCESSFUL',
			};
		} catch (error) {
			logger.logError(
				`Error handling hubla webhook: ${(error as Error).message}`,
			);
			throw new CustomError(
				'INVALID_DATA',
				`Error handling hubla webhook: ${(error as Error).message}`,
			);
		}
	}

	public async handleHotmartWebhook(
		body: TIncommingHotmartWebhook,
	): Promise<TServiceReturn<string>> {
		const { event } = body;

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
				data: 'Webhook received',
				status: 'SUCCESSFUL',
			};
		} catch (error) {
			logger.logError(
				`Error handling hotmart webhook: ${(error as Error).message}`,
			);
			throw new CustomError(
				'INVALID_DATA',
				`Error handling hotmart webhook: ${(error as Error).message}`,
			);
		}
	}

	public async handleIuguWebhook(body: {
		event: string;
		data: Record<string, any>;
	}): Promise<TServiceReturn<string>> {
		const { event } = body;
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

				case 'subscription.changed': {
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
					await this._slackService.sendMessage({
						message: 'Iugu webhook not handled',
						...body,
					});
					break;
				}
			}

			return {
				data: 'Webhook received',
				status: 'SUCCESSFUL',
			};
		} catch (error) {
			logger.logError(
				`Error handling iugu webhook: ${(error as Error).message}`,
			);
			throw new CustomError(
				'INVALID_DATA',
				`Error handling iugu webhook: ${(error as Error).message}`,
			);
		}
	}

	private async _handleIuguInvoiceStatusChanged(body: {
		event: string;
		data: Record<string, any>;
	}): Promise<TServiceReturn<string>> {
		const { data } = body;
		try {
			switch (data.status) {
				case 'paid': {
					try {
						const { data: subscription } =
							await this._iuguService.getSubscriptionById(
								data.subscription_id as string,
							);
						const { data: user } = await this._userService.getUserData(
							subscription.customer_email.toLowerCase(),
						);

						let rolesToAdd: string[] = [];

						if (
							subscription.plan_identifier === 'escola_mensal' ||
							subscription.plan_identifier === 'escola_mensal_promocional'
						) {
							rolesToAdd = ['iniciantes', 'escolaOnline'];
						} else if (
							subscription.plan_identifier === 'escola_online_plano_anual' ||
							subscription.plan_identifier === 'escola_anual_bf' ||
							subscription.plan_identifier === 'escola_trimestral_bf' ||
							subscription.plan_identifier === 'escola_semestral' ||
							subscription.plan_identifier === 'escola_anual' ||
							subscription.plan_identifier === 'escola_semestral_promocional' ||
							subscription.plan_identifier === 'escola_anual_promocional'
						) {
							rolesToAdd = ['iniciantes', 'escolaOnline', 'escolaAnual'];
						} else {
							rolesToAdd = ['iniciantes'];
						}

						await this._mauticService.createContact({
							email: user.email,
							firstName: user.firstName,
							lastName: user.lastName,
						});

						await Promise.all([
							this._userService.addRolesToUser(user, rolesToAdd), // Should be deleted when old site stops being suported
							this._subscriptionService.createOrUpdate({
								courseSlug: convertSubscriptionIdentifierToCourseSlug(
									subscription.plan_identifier,
								),
								expiresAt: new Date(subscription.expires_at),
								provider: 'iugu',
								providerSubscriptionId: subscription.id,
								userId: user.id,
							}),
							this._mauticService.addContactToSegmentByEmail(user.email, 6),
						]);
					} catch {
						await this._slackService.sendMessage({
							message: 'Error handling iugu invoice status changed (paid)',
							...body,
						});
					}

					break;
				}

				case 'expired': {
					break;
				}

				case 'pending': {
					await this._slackService.sendMessage({
						message: 'Iugu invoice status changed not handled',
						...body,
					});
					break;
				}

				case 'refunded': {
					break;
				}

				case 'canceled': {
					break;
				}

				default: {
					await this._slackService.sendMessage({
						message: 'Iugu invoice status changed not handled',
						...body,
					});
					break;
				}
			}

			return {
				data: 'Iugu invoice status changed handled',
				status: 'SUCCESSFUL',
			};
		} catch (error) {
			logger.logError(
				`Error handling iugu invoice status changed webhook: ${(error as Error).message}`,
			);
			throw new CustomError(
				'INVALID_DATA',
				`Error handling iugu invoice status changed webhook: ${(error as Error).message}`,
			);
		}
	}

	private async _handleIuguInvoicePaymentFailedWebhook(body: {
		event: string;
		data: Record<string, any>;
	}): Promise<TServiceReturn<string>> {
		const { data } = body;

		try {
			const { data: invoice } = await this._iuguService.getInvoiceById(
				data.id as string,
			);
			const { data: user } = await this._userService.getUserData(
				invoice.payer_email.toLowerCase(),
			);

			const lrMessage = getLrMessage(data.lr as string);

			await this._botMakerService.sendWhatsappTemplateMessate(
				user.phoneNumber,
				'falha_de_pagamento',
				{
					codigoDoErro: data.lr as string,
					descricaoDoErro: lrMessage,
					linkDaFatura: invoice.secure_url,
					primeiroNome: user.firstName,
				},
			);

			return {
				data: 'Iugu invoice payment failed handled',
				status: 'SUCCESSFUL',
			};
		} catch (error) {
			logger.logError(
				`Error handling iugu invoice payment failed webhook: ${(error as Error).message}`,
			);
			throw new CustomError(
				'INVALID_DATA',
				`Error handling iugu invoice payment failed webhook: ${(error as Error).message}`,
			);
		}
	}

	private async _handleIuguInvoiceDunningActionWebhook(body: {
		event: string;
		data: Record<string, any>;
	}): Promise<TServiceReturn<string>> {
		const { data } = body;

		try {
			const { data: invoice } = await this._iuguService.getInvoiceById(
				data.id as string,
			);
			const { data: user } = await this._userService.getUserData(
				invoice.payer_email.toLowerCase(),
			);

			if (this._iuguService.hasCreditCardPaymentMethod(invoice)) {
				return {
					data: 'Iugu invoice dunning action handled',
					status: 'SUCCESSFUL',
				};
			}

			await Promise.all([
				this._botMakerService.sendWhatsappTemplateMessate(
					user.phoneNumber,
					'acao_de_cobranca',
					{
						dataDeVencimento: new Date(invoice.due_date).toLocaleDateString(),
						linkDaFatura: invoice.secure_url,
						nome: user.firstName,
					},
				),
				this._userService.removeRolesFromUser(user, [
					'escolaOnline',
					'escolaAnual',
				]),
			]);

			return {
				data: 'Iugu invoice dunning action handled',
				status: 'SUCCESSFUL',
			};
		} catch (error) {
			logger.logError(
				`Error handling iugu invoice dunning action webhook: ${(error as Error).message}`,
			);
			throw new CustomError(
				'INVALID_DATA',
				`Error handling iugu invoice dunning action webhook: ${(error as Error).message}`,
			);
		}
	}

	private async _handleIuguSubscriptionSuspendedWebhook(body: {
		event: string;
		data: Record<string, any>;
	}) {
		try {
			const { data } = body;
			const { data: subscription } =
				await this._iuguService.getSubscriptionById(data.id as string);
			const { data: user } = await this._userService.getUserData(
				subscription.customer_email.toLowerCase(),
			);

			const rolesToRemove = ['escolaOnline', 'escolaAnual'];

			await this._userService.removeRolesFromUser(user, rolesToRemove);
		} catch (error) {
			logger.logError(
				`Error handling iugu subscription suspended webhook: ${(error as Error).message}`,
			);
			throw new CustomError(
				'INVALID_DATA',
				`Error handling iugu subscription suspended webhook: ${(error as Error).message}`,
			);
		}
	}

	private async _handleHotmartPurchaseAprovedWebhook(
		body: TIncommingHotmartWebhook,
	) {
		const { data } = body;

		const {
			data: { userData },
		} = await this._userService.createOrUpdate({
			document: data.buyer.document,
			email: data.buyer.email.toLowerCase(),
			firstName: convertStringToStartCase(data.buyer.name.split(' ')[0]),
			lastName: convertStringToStartCase(
				data.buyer.name.split(' ').slice(1).join(' '),
			),
			phoneNumber: data.buyer.checkout_phone,
			roles: ['iniciantes'],
		});

		try {
			await this._mauticService.createContact({
				email: userData.email,
				firstName: userData.firstName,
				lastName: userData.lastName,
			});
		} catch (error) {
			console.log(error);
		}

		try {
			switch (data.product.id) {
				case 1_392_822: {
					// Formation
					if (
						data.purchase.recurrence_number === 1 ||
						(!data.purchase.recurrence_number && !data.subscription)
					) {
						await Promise.all([
							this._botMakerService.sendWhatsappTemplateMessate(
								userData.phoneNumber,
								'boas_vindas_formacao2',
								{
									linkCanalRecadosFormacao:
										'https://t.me/joinchat/_2UwTcWJ5to3MTAx',
									linkGrupoFormacao: 'https://t.me/joinchat/gxazJsQTmwI5YzYx',
									linkManualDoAlunoFormacao:
										'https://img.amo.yoga/MANUAL_DO_ALUNO.pdf',
									linkSuporte: 'https://t.me/yogaemmovimento_bot',
									nome: userData.firstName,
								},
							),
							this._mailService.sendEmail(
								formationWelcomeEmailTemplate(
									userData.firstName,
									userData.email,
								),
							),
							fetch(process.env.SLACK_WEBHOOK_URL_FORMATION!, {
								body: JSON.stringify({
									text: `Novo Aluno na Formação\nNome: ${userData.firstName} ${userData.lastName}\nEmail: ${userData.email}\nTelefone: ${userData.phoneNumber}`,
								}),
								headers: {
									'Content-Type': 'application/json', // eslint-disable-line @typescript-eslint/naming-convention
								},
								method: 'POST',
							}),
						]);
					}

					const rolesToAdd = [
						'iniciantes',
						'escolaOnline',
						'escolaAnual',
						'novaFormacao',
					];

					let expiresAt: Date;
					if (data.purchase.recurrence_number) {
						expiresAt =
							data.purchase.recurrence_number <
							data.purchase.payment.installments_number
								? new Date(data.purchase.date_next_charge!)
								: new Date(2_556_113_460_000);
					} else {
						expiresAt = new Date(2_556_113_460_000);
					}

					await Promise.all([
						this._userService.addRolesToUser(userData, rolesToAdd), // Should be deleted when old site stops being suported
						this._subscriptionService.createOrUpdate({
							courseSlug: convertSubscriptionIdentifierToCourseSlug(
								data.product.id.toString() as TPlanIdentifier,
							),
							expiresAt,
							provider: 'hotmart',
							providerSubscriptionId:
								data.subscription?.subscriber.code ?? data.purchase.transaction,
							userId: userData.id,
						}),
						this._mauticService.addContactToSegmentByEmail(userData.email, 2),
					]);

					break;
				}

				case 4_735_693: {
					// Formation Subscription
					if (data.purchase.recurrence_number === 1) {
						await Promise.all([
							this._botMakerService.sendWhatsappTemplateMessate(
								userData.phoneNumber,
								'boas_vindas_formacao2',
								{
									linkCanalRecadosFormacao:
										'https://t.me/joinchat/_2UwTcWJ5to3MTAx',
									linkGrupoFormacao: 'https://t.me/joinchat/gxazJsQTmwI5YzYx',
									linkManualDoAlunoFormacao:
										'https://img.amo.yoga/MANUAL_DO_ALUNO.pdf',
									linkSuporte: 'https://t.me/yogaemmovimento_bot',
									nome: userData.firstName,
								},
							),
							this._mailService.sendEmail(
								formationWelcomeEmailTemplate(
									userData.firstName,
									userData.email,
								),
							),
							fetch(process.env.SLACK_WEBHOOK_URL_FORMATION!, {
								body: JSON.stringify({
									text: `Novo Aluno na Formação\nNome: ${userData.firstName} ${userData.lastName}\nEmail: ${userData.email}\nTelefone: ${userData.phoneNumber}`,
								}),
								headers: {
									'Content-Type': 'application/json', // eslint-disable-line @typescript-eslint/naming-convention
								},
								method: 'POST',
							}),
						]);
					}

					const rolesToAdd = [
						'iniciantes',
						'escolaOnline',
						'escolaAnual',
						'novaFormacao',
					];

					await Promise.all([
						this._userService.addRolesToUser(userData, rolesToAdd), // Should be deleted when old site stops being suported
						this._subscriptionService.createOrUpdate({
							courseSlug: convertSubscriptionIdentifierToCourseSlug(
								data.product.id.toString() as TPlanIdentifier,
							),
							expiresAt: new Date(data.purchase.date_next_charge!),
							provider: 'hotmart',
							providerSubscriptionId:
								data.subscription?.subscriber.code ?? data.purchase.transaction,
							userId: userData.id,
						}),
						this._mauticService.addContactToSegmentByEmail(userData.email, 2),
					]);

					break;
				}

				case 135_340: {
					// School
					if (data.purchase.recurrence_number === 1) {
						await Promise.all([
							this._mailService.sendEmail(
								schoolWelcomeEmailTemplate(userData.firstName, userData.email),
							),
							this._botMakerService.sendWhatsappTemplateMessate(
								userData.phoneNumber,
								'escola_boas_vindas_2',
								{
									linkDaAreaDosAlunos: 'https://yogaemmovimento.com',
									linkDaFichaMedica: 'https://img.amo.yoga/ficha-medica.pdf',
									linkDoGrupoDeRecados: 'https://t.me/+_-lrXmqVqD1mMDk5',
									nome: userData.firstName,
								},
							),
						]);
					}

					let rolesToAdd: string[] = [];

					if (
						data.subscription?.plan?.name === 'Mensal 77' ||
						data.subscription?.plan?.name === 'Mensal boleto' ||
						data.subscription?.plan?.name === 'Mensal'
					) {
						rolesToAdd = ['iniciantes', 'escolaOnline'];
					} else if (
						data.subscription?.plan?.name === 'Anual 497' ||
						data.subscription?.plan?.name === 'Anual - boleto' ||
						data.subscription?.plan?.name === 'Anual'
					) {
						rolesToAdd = ['iniciantes', 'escolaOnline', 'escolaAnual'];
					} else {
						rolesToAdd = ['iniciantes'];
					}

					await Promise.all([
						this._userService.addRolesToUser(userData, rolesToAdd), // Should be deleted when old site stops being suported
						this._subscriptionService.createOrUpdate({
							courseSlug:
								convertSubscriptionIdentifierToCourseSlug(
									data.subscription?.plan?.name as TPlanIdentifier,
								) ??
								convertSubscriptionIdentifierToCourseSlug(
									data.product.id.toString() as TPlanIdentifier,
								),
							expiresAt: new Date(data.purchase.date_next_charge!),
							provider: 'hotmart',
							providerSubscriptionId:
								data.subscription?.subscriber.code ?? data.purchase.transaction,
							userId: userData.id,
						}),
						this._mauticService.addContactToSegmentByEmail(userData.email, 6),
					]);

					break;
				}

				default: {
					await this._slackService.sendMessage({
						...body,
						message: 'Product not found',
					});
					break;
				}
			}
		} catch (error) {
			await this._slackService.sendMessage({
				...body,
				message: `Error handling hotmart purchase aproved webhook: ${(error as Error).message}`,
			});
			logger.logError(
				`Error handling hotmart purchase aproved webhook: ${(error as Error).message}`,
			);
		}
	}

	private async _handleHotmartBilletPrintedWebhook(
		body: TIncommingHotmartWebhook,
	) {
		const { data } = body;

		const isSchool = data.product.id === 135_340;
		const isFormation =
			data.product.id === 1_392_822 || data.product.id === 4_735_693;

		const isBillet = data.purchase.payment.type === 'BILLET';
		const isPix = data.purchase.payment.type === 'PIX';

		const {
			data: { userData: user },
		} = await this._userService.createOrUpdate({
			document: data.buyer.document,
			email: data.buyer.email.toLowerCase(),
			firstName: convertStringToStartCase(data.buyer.name.split(' ')[0]),
			lastName: convertStringToStartCase(
				data.buyer.name.split(' ').slice(1).join(' '),
			),
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
						codigoDoBoleto: data.purchase.payment.billet_barcode!,
						linkBoleto: data.purchase.payment.billet_url!,
						nome: user.firstName,
					},
				),
				this._mailService.sendEmail(
					schoolHotmartPrintedBilletEmailTemplate(
						user.firstName,
						user.email,
						data.purchase.payment.billet_url!,
						data.purchase.payment.billet_barcode!,
					),
				),
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
						linkDoPix: data.purchase.payment.pix_qrcode!,
						nome: user.firstName,
					},
				),
				this._mailService.sendEmail(
					schoolHotmartPrintedPixEmailTemplate(
						user.firstName,
						user.email,
						data.purchase.payment.pix_qrcode!,
					),
				),
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
						codigoDoBoleto: data.purchase.payment.billet_barcode!,
						linkBoleto: data.purchase.payment.billet_url!,
						nome: user.firstName,
					},
				),
				this._mailService.sendEmail(
					formationHotmartPrintedBilletEmailTemplate(
						user.firstName,
						user.email,
						data.purchase.payment.billet_url!,
						data.purchase.payment.billet_barcode!,
					),
				),
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
						linkDoPix: data.purchase.payment.pix_qrcode!,
						nome: user.firstName,
					},
				),
				this._mailService.sendEmail(
					formationHotmartPrintedPixEmailTemplate(
						user.firstName,
						user.email,
						data.purchase.payment.pix_qrcode!,
					),
				),
			]);
			return;
		}

		await this._slackService.sendMessage({
			message: 'Não conseguiu lidar com webhook billet printed da hotmart',
			...body,
		});
	}

	private async _handleHotmartPurchaseDelayedWebhook(
		body: TIncommingHotmartWebhook,
	) {
		const { data } = body;

		const isSchool = data.product.id === 135_340;
		const isFormation =
			data.product.id === 1_392_822 || data.product.id === 4_735_693;

		const isBillet = data.purchase.payment.type === 'BILLET';
		const isPix = data.purchase.payment.type === 'PIX';
		const isCreditCard =
			data.purchase.payment.type === 'CREDIT_CARD' ||
			data.purchase.payment.type === 'PAYPAL' ||
			data.purchase.payment.type === 'WALLET';

		const {
			data: { userData: user },
		} = await this._userService.createOrUpdate({
			document: data.buyer.document,
			email: data.buyer.email.toLowerCase(),
			firstName: convertStringToStartCase(data.buyer.name.split(' ')[0]),
			lastName: convertStringToStartCase(
				data.buyer.name.split(' ').slice(1).join(' '),
			),
			phoneNumber: data.buyer.checkout_phone,
			roles: ['iniciantes'],
		});

		if (isSchool && isBillet) {
			await Promise.all([
				this._botMakerService.sendWhatsappTemplateMessate(
					user.phoneNumber,
					'boleto_atrasado_escola',
					{
						emailAluno: user.email,
						nome: user.firstName,
					},
				),
				this._mailService.sendEmail(
					schoolHotmartDelayedBilletEmailTemplate(user.firstName, user.email),
				),
				this._userService.removeRolesFromUser(user, [
					'escolaOnline',
					'escolaAnual',
				]),
			]);
			return;
		}

		if (isSchool && isPix) {
			await Promise.all([
				this._botMakerService.sendWhatsappTemplateMessate(
					user.phoneNumber,
					'purchase_delayed_hotmart_school_pix',
					{
						emailAluno: user.email,
						linkCompraHotmart: 'https://consumer.hotmart.com/purchase/135340',
						nome: user.firstName,
					},
				),
				this._userService.removeRolesFromUser(user, [
					'escolaOnline',
					'escolaAnual',
				]),
				this._mailService.sendEmail(
					schoolHotmartDelayedPixEmailTemplate(user.firstName, user.email),
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
						descricaoDoErro:
							data.purchase.payment.refusal_reason ?? 'Transação recusada',
						emailAluno: user.email,
						nome: user.firstName,
					},
				),
				this._userService.removeRolesFromUser(user, [
					'escolaOnline',
					'escolaAnual',
				]),
				this._mailService.sendEmail(
					schoolHotmartFailedCreditCardEmailTemplate(
						user.firstName,
						user.email,
						data.purchase.payment.refusal_reason ?? 'Transação recusada',
					),
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
						emailAluno: user.email,
						nome: user.firstName,
					},
				),
				this._userService.removeRolesFromUser(user, [
					'escolaOnline',
					'escolaAnual',
					'novaFormacao',
				]),
				this._mailService.sendEmail(
					formationHotmartDelayedBilletEmailTemplate(
						user.firstName,
						user.email,
					),
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
						emailAluno: user.email,
						nome: user.firstName,
					},
				),
				this._userService.removeRolesFromUser(user, [
					'escolaOnline',
					'escolaAnual',
					'novaFormacao',
				]),
				this._mailService.sendEmail(
					formationHotmartDelayedPixEmailTemplate(user.firstName, user.email),
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
						descricaoDoErro:
							data.purchase.payment.refusal_reason ?? 'Transação recusada',
						emailAluno: user.email,
						nome: user.firstName,
					},
				),
				this._userService.removeRolesFromUser(user, [
					'escolaOnline',
					'escolaAnual',
					'novaFormacao',
				]),
				this._mailService.sendEmail(
					formationHotmartFailedCreditCardEmailTemplate(
						user.firstName,
						user.email,
						data.purchase.payment.refusal_reason ?? 'Transação recusada',
					),
				),
			]);
			return;
		}

		await this._slackService.sendMessage({
			message: 'Não conseguiu lidar com a compra atrasada da hotmart',
			...body,
		});
	}

	private async _handleHotmartPurchaseRefundedOrChargebackWebhook(
		body: TIncommingHotmartWebhook,
	) {
		const { data } = body;

		const isSchool = 135_340;
		const isFormation = 1_392_822;
		const isFormationSubscription = 4_735_693;

		const {
			data: { userData: user },
		} = await this._userService.createOrUpdate({
			document: data.buyer.document,
			email: data.buyer.email.toLowerCase(),
			firstName: convertStringToStartCase(data.buyer.name.split(' ')[0]),
			lastName: convertStringToStartCase(
				data.buyer.name.split(' ').slice(1).join(' '),
			),
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
							courseSlug:
								convertSubscriptionIdentifierToCourseSlug(
									data.subscription?.plan?.name as TPlanIdentifier,
								) ??
								convertSubscriptionIdentifierToCourseSlug(
									data.product.id.toString() as TPlanIdentifier,
								),
							expiresAt: new Date(),
							provider: 'hotmart',
							providerSubscriptionId:
								data.subscription?.subscriber.code ?? data.purchase.transaction,
							userId: user.id,
						}),
					]);
					break;
				}

				case isFormation || isFormationSubscription: {
					const rolesToRemove = ['escolaOnline', 'escolaAnual', 'novaFormacao'];
					await Promise.all([
						this._userService.removeRolesFromUser(user, rolesToRemove),
						this._subscriptionService.createOrUpdate({
							courseSlug: convertSubscriptionIdentifierToCourseSlug(
								data.product.id.toString() as TPlanIdentifier,
							),
							expiresAt: new Date(),
							provider: 'hotmart',
							providerSubscriptionId:
								data.subscription?.subscriber.code ?? data.purchase.transaction,
							userId: user.id,
						}),
					]);
					break;
				}

				default: {
					break;
				}
			}
		} catch (error) {
			await this._slackService.sendMessage({
				...body,
				message: `Error handling hotmart purchase refunded webhook: ${(error as Error).message}`,
			});
			logger.logError(
				`Error handling hotmart purchase refunded webhook: ${(error as Error).message}`,
			);
		}
	}
}
