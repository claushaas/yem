import {fromEnv} from '@aws-sdk/credential-providers';
import {SecretsManagerClient, GetSecretValueCommand, UpdateSecretCommand} from '@aws-sdk/client-secrets-manager';
import {CustomError} from '../utils/custom-error.js';
import {type TServiceReturn} from '../types/service-return.js';
import {type TSecret} from '../types/secret.js';
import {logger} from '../utils/logger.js';

export class SecretService {
	private readonly _awsClient: SecretsManagerClient;
	private readonly _awsSecretId: string;

	constructor() {
		this._awsClient = new SecretsManagerClient(
			{
				region: process.env.AWS_REGION ?? 'us-east-1',
				credentials: fromEnv(),
			},
		);
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
				status: 'SUCCESSFUL',
				data: JSON.parse(response.SecretString ?? '{}') as TSecret,
			};
		} catch {
			logger.logError('Error getting secret');
			throw new CustomError('UNKNOWN', 'Erro ao buscar secret');
		}
	}

	public async setSecret(secret: Record<string, string>): Promise<TServiceReturn<string>> {
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
				status: 'NO_CONTENT',
				data: response.Name ?? '',
			};
		} catch {
			logger.logError('Error setting secret');
			throw new CustomError('UNKNOWN', 'Erro ao setar secret');
		}
	}
}
