import {
	GetSecretValueCommand,
	SecretsManagerClient,
	UpdateSecretCommand,
} from '@aws-sdk/client-secrets-manager';
import { fromEnv } from '@aws-sdk/credential-providers';
import type { TSecret } from '../types/secret.type.js';
import type { TServiceReturn } from '../types/service-return.type.js';
import { CustomError } from '../utils/custom-error.js';
import { logger } from '../utils/logger.util.js';

export class SecretService {
	private readonly _awsClient: SecretsManagerClient;
	private readonly _awsSecretId: string;

	constructor() {
		this._awsClient = new SecretsManagerClient({
			credentials: fromEnv(),
			region: process.env.AWS_REGION ?? 'us-east-1',
		});
		this._awsSecretId = process.env.AWS_SECRET_ID ?? '';
	}

	public async getSecret(): Promise<TServiceReturn<TSecret>> {
		try {
			logger.logDebug('Getting secret');
			const parameters = {
				SecretId: this._awsSecretId,
			};

			const command = new GetSecretValueCommand(parameters);
			const response = await this._awsClient.send(command);

			if (response.$metadata.httpStatusCode !== 200) {
				throw new CustomError('UNAUTHORIZED', 'Usuário ou senha incorretos');
			}

			return {
				data: JSON.parse(response.SecretString ?? '{}') as TSecret,
				status: 'SUCCESSFUL',
			};
		} catch {
			logger.logError('Error getting secret');
			throw new CustomError('UNKNOWN', 'Erro ao buscar secret');
		}
	}

	public async setSecret(
		secret: Record<string, string>,
	): Promise<TServiceReturn<string>> {
		try {
			logger.logDebug('Setting secret');
			const parameters = {
				SecretId: this._awsSecretId,

				SecretString: JSON.stringify(secret),
			};

			const command = new UpdateSecretCommand(parameters);
			const response = await this._awsClient.send(command);

			if (response.$metadata.httpStatusCode !== 200) {
				throw new CustomError('UNAUTHORIZED', 'Usuário ou senha incorretos');
			}

			return {
				data: response.Name ?? '',
				status: 'NO_CONTENT',
			};
		} catch {
			logger.logError('Error setting secret');
			throw new CustomError('UNKNOWN', 'Erro ao setar secret');
		}
	}
}
