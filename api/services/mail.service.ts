import {SESv2Client, SendEmailCommand} from '@aws-sdk/client-sesv2';
import {fromEnv} from '@aws-sdk/credential-providers';
import {CustomError} from '../utils/CustomError.js';
import {logger} from '../utils/Logger.js';
import type {TServiceReturn} from '../types/ServiceReturn.js';
import {type TEmailTemplate} from '../types/Email.js';

export class MailService {
	private readonly _awsClient: SESv2Client;

	constructor(
		awsClient: SESv2Client = new SESv2Client({
			region: process.env.AWS_REGION ?? 'us-east-1',
			credentials: fromEnv(),
		}),
	) {
		this._awsClient = awsClient;
	}

	public async sendEmail(template: TEmailTemplate): Promise<TServiceReturn<string>> {
		logger.logDebug('Sending email');
		const params = {

			Content: {

				Simple: {

					Body: {

						Html: {

							Data: template.html,

							ChartSet: 'UTF-8',
						},

						Text: {

							Data: template.text,

							ChartSet: 'UTF-8',
						},
					},

					Subject: {

						Data: template.subject,

						ChartSet: 'UTF-8',
					},
				},
			},

			Destination: {

				ToAddresses: [template.to],
			},

			FromEmailAddress: 'contato@yogaemmovimento.com',
		};

		const command = new SendEmailCommand(params);
		try {
			await this._awsClient.send(command);
			logger.logDebug('Email sent successfully');
			return {
				status: 'SUCCESSFUL',
				data: 'Email enviado com sucesso',
			};
		} catch (error) {
			logger.logError('Error sending email');
			throw new CustomError('INVALID_DATA', `Error sending email: ${(error as Error).message}`);
		}
	}
}
