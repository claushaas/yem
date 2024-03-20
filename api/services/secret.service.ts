import {fromEnv} from '@aws-sdk/credential-providers';
import CustomError from '../utils/CustomError.js';
import {SecretsManagerClient, GetSecretValueCommand, UpdateSecretCommand} from '@aws-sdk/client-secrets-manager';
import {type TypeServiceReturn} from '../types/ServiceReturn.js';
import {type TypeSecret} from '../types/Secret.js';
import {logger} from '../utils/Logger.js';

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

	public async getSecret(): Promise<TypeServiceReturn<TypeSecret>> {
		try {
			logger.logDebug('Getting secret');
			const params = {
			// eslint-disable-next-line @typescript-eslint/naming-convention
				SecretId: this._awsSecretId,
			};

			const command = new GetSecretValueCommand(params);
			const response = await this._awsClient.send(command);

			if (response.$metadata.httpStatusCode !== 200) {
				throw new CustomError('UNAUTHORIZED', 'Usuário ou senha incorretos');
			}

			return {
				status: 'SUCCESSFUL',
				data: JSON.parse(response.SecretString ?? '{}') as TypeSecret,
			};
		} catch (error) {
			logger.logError('Error getting secret');
			throw new CustomError('UNKNOWN', 'Erro ao buscar secret');
		}
	}

	public async setSecret(secret: Record<string, string>): Promise<TypeServiceReturn<string>> {
		try {
			logger.logDebug('Setting secret');
			const params = {
				// eslint-disable-next-line @typescript-eslint/naming-convention
				SecretId: this._awsSecretId,
				// eslint-disable-next-line @typescript-eslint/naming-convention
				SecretString: JSON.stringify(secret),
			};

			const command = new UpdateSecretCommand(params);
			const response = await this._awsClient.send(command);

			if (response.$metadata.httpStatusCode !== 200) {
				throw new CustomError('UNAUTHORIZED', 'Usuário ou senha incorretos');
			}

			return {
				status: 'NO_CONTENT',
				data: response.Name ?? '',
			};
		} catch (error) {
			logger.logError('Error setting secret');
			throw new CustomError('UNKNOWN', 'Erro ao setar secret');
		}
	}
}
