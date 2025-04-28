import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
import { fromEnv } from '@aws-sdk/credential-providers';
import { type TEmailTemplate } from '../types/email-template.type.js';
import type { TServiceReturn } from '../types/service-return.type.js';
import { CustomError } from '../utils/custom-error.js';
import { logger } from '../utils/logger.util.js';

export class MailService {
	private readonly _awsClient: SESv2Client;

	constructor(
		awsClient: SESv2Client = new SESv2Client({
			credentials: fromEnv(),
			region: process.env.AWS_REGION ?? 'us-east-1',
		}),
	) {
		this._awsClient = awsClient;
	}

	public async sendEmail(
		template: TEmailTemplate,
	): Promise<TServiceReturn<string>> {
		logger.logDebug('Sending email');
		const parameters = {
			Content: {
				Simple: {
					Body: {
						Html: {
							ChartSet: 'utf8',
							Data: template.html,
						},
						Text: {
							ChartSet: 'utf8',
							Data: template.text,
						},
					},
					Subject: {
						ChartSet: 'utf8',
						Data: template.subject,
					},
				},
			},
			Destination: {
				ToAddresses: [template.to],
			},
			FromEmailAddress: 'contato@yogaemmovimento.com',
		};

		const command = new SendEmailCommand(parameters);
		try {
			await this._awsClient.send(command);
			logger.logDebug('Email sent successfully');
			return {
				data: 'Email enviado com sucesso',
				status: 'SUCCESSFUL',
			};
		} catch (error) {
			logger.logError('Error sending email');
			throw new CustomError(
				'INVALID_DATA',
				`Error sending email: ${(error as Error).message}`,
			);
		}
	}
}
