import {SESv2Client, SendEmailCommand} from '@aws-sdk/client-sesv2';
import {fromEnv} from '@aws-sdk/credential-providers';
import CustomError from '../utils/CustomError';
import {logger} from '../utils/Logger';
import type {TypeServiceReturn} from '../types/ServiceReturn';
import {type TypeEmailTemplate} from '../types/Email';

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

	public async sendEmail(template: TypeEmailTemplate): Promise<TypeServiceReturn<string>> {
		const params = {
			// eslint-disable-next-line @typescript-eslint/naming-convention
			Content: {
				// eslint-disable-next-line @typescript-eslint/naming-convention
				Simple: {
					// eslint-disable-next-line @typescript-eslint/naming-convention
					Body: {
						// eslint-disable-next-line @typescript-eslint/naming-convention
						Html: {
							// eslint-disable-next-line @typescript-eslint/naming-convention
							Data: template.html,
							// eslint-disable-next-line @typescript-eslint/naming-convention
							ChartSet: 'UTF-8',
						},
						// eslint-disable-next-line @typescript-eslint/naming-convention
						Text: {
							// eslint-disable-next-line @typescript-eslint/naming-convention
							Data: template.text,
							// eslint-disable-next-line @typescript-eslint/naming-convention
							ChartSet: 'UTF-8',
						},
					},
					// eslint-disable-next-line @typescript-eslint/naming-convention
					Subject: {
						// eslint-disable-next-line @typescript-eslint/naming-convention
						Data: template.subject,
						// eslint-disable-next-line @typescript-eslint/naming-convention
						ChartSet: 'UTF-8',
					},
				},
			},
			// eslint-disable-next-line @typescript-eslint/naming-convention
			Destination: {
				// eslint-disable-next-line @typescript-eslint/naming-convention
				ToAddresses: [template.to],
			},
			// eslint-disable-next-line @typescript-eslint/naming-convention
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
