import {fromEnv} from '@aws-sdk/credential-providers';
import {
	CognitoIdentityProviderClient,
	InitiateAuthCommand,
	type InitiateAuthCommandInput,
	AdminGetUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import CustomError from '../utils/CustomError';
import {generateToken} from '../utils/jwt';
import type TypeUser from '../types/User';
import {type TypeServiceReturn} from '../types/ServiceReturn';
import SubscriptionService from './subscription.service';
import {logger} from '../utils/Logger';

export default class UserService {
	private readonly _awsClient: CognitoIdentityProviderClient;
	private readonly _subscriptionService: SubscriptionService;

	constructor(
		awsClient: CognitoIdentityProviderClient = new CognitoIdentityProviderClient({
			region: process.env.AWS_REGION ?? 'us-east-1',
			credentials: fromEnv(),
		}),
	) {
		this._awsClient = awsClient;
		this._subscriptionService = new SubscriptionService();
	}

	public async login(username: string, password: string): Promise<TypeServiceReturn<unknown>> {
		const cleanUsername = username.trim().toLowerCase();

		const params: InitiateAuthCommandInput = {
			// eslint-disable-next-line @typescript-eslint/naming-convention
			AuthFlow: 'USER_PASSWORD_AUTH',
			// eslint-disable-next-line @typescript-eslint/naming-convention
			ClientId: process.env.COGNITO_CLIENT_ID,
			// eslint-disable-next-line @typescript-eslint/naming-convention
			AuthParameters: {
				// eslint-disable-next-line @typescript-eslint/naming-convention
				USERNAME: cleanUsername,
				// eslint-disable-next-line @typescript-eslint/naming-convention
				PASSWORD: password,
			},
		};

		const command = new InitiateAuthCommand(params);
		const response = await this._awsClient.send(command);

		if (response.$metadata.httpStatusCode !== 200) {
			throw new CustomError('UNAUTHORIZED', 'Usuário ou senha incorretos');
		}

		const {data: user} = await this._getUserData(cleanUsername);

		const token = generateToken(user);

		try {
			await this._subscriptionService.createOrUpdateAllUserSubscriptions(user);
		} catch (error) {
			console.error('Error creating or updating subscriptions', error);
		}

		logger.logInfo(`User ${user.id} logged in successfully`);

		return {
			status: 'SUCCESSFUL',
			data: {
				token,
				userData: user,
			},
		};
	}

	private async _getUserData(username: string): Promise<TypeServiceReturn<TypeUser>> {
		const cleanUsername = username.trim().toLowerCase();

		const user = await this._awsClient.send(new AdminGetUserCommand({
			// eslint-disable-next-line @typescript-eslint/naming-convention
			UserPoolId: process.env.COGNITO_USER_POOL_ID,
			// eslint-disable-next-line @typescript-eslint/naming-convention
			Username: cleanUsername,
		}));

		const cleanUser: TypeUser = {
			id:
				user.UserAttributes?.find(attr => attr.Name === 'sub')?.Value ?? '',
			email:
				user.UserAttributes?.find(attr => attr.Name === 'email')?.Value ?? '',
			roles:
				user.UserAttributes?.find(attr => attr.Name === 'custom:roles')?.Value?.split('-') ?? [],
			firstName:
				user.UserAttributes?.find(attr => attr.Name === 'given_name')?.Value ?? '',
			lastName:
				user.UserAttributes?.find(attr => attr.Name === 'family_name')?.Value ?? '',
			phoneNumber:
				user.UserAttributes?.find(attr => attr.Name === 'phone_number')?.Value ?? '',
		};

		logger.logInfo(`User ${cleanUser.id} data retrieved successfully`);

		if (!cleanUser.id) {
			logger.logError(`Error getting user data: user id ${cleanUsername} not found`);
			throw new CustomError('NOT_FOUND', 'Usuário não encontrado');
		}

		return {
			status: 'SUCCESSFUL',
			data: cleanUser,
		};
	}
}
