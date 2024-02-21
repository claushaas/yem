import {fromEnv} from '@aws-sdk/credential-providers';
import {
	CognitoIdentityProviderClient, InitiateAuthCommand, type InitiateAuthCommandInput, AdminGetUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import CustomError from '../utils/CustomError';
import {generateToken} from '../utils/jwt';
import {type TypeCognitoUserAttributes} from '../types/CognitoUserAttributes';
import convertCognitoUserAttributesToObj from '../utils/convertCognitoUserAttributesToObj';

// Const client = new FooClient({
//   credentials: fromEnv(),
// });

export default class UserService {
	private readonly _awsClient: CognitoIdentityProviderClient;

	constructor(awsClient: CognitoIdentityProviderClient = new CognitoIdentityProviderClient({
		region: process.env.AWS_REGION ?? 'us-east-1',
		credentials: fromEnv(),
	})) {
		this._awsClient = awsClient;
	}

	public async login(username: string, password: string) {
		const params: InitiateAuthCommandInput = {
			// eslint-disable-next-line @typescript-eslint/naming-convention
			AuthFlow: 'USER_PASSWORD_AUTH',
			// eslint-disable-next-line @typescript-eslint/naming-convention
			ClientId: process.env.COGNITO_CLIENT_ID,
			// eslint-disable-next-line @typescript-eslint/naming-convention
			AuthParameters: {
				// eslint-disable-next-line @typescript-eslint/naming-convention
				USERNAME: username,
				// eslint-disable-next-line @typescript-eslint/naming-convention
				PASSWORD: password,
			},
		};

		const command = new InitiateAuthCommand(params);
		const response = await this._awsClient.send(command);

		if (response.$metadata.httpStatusCode !== 200) {
			throw new CustomError('UNAUTHORIZED', 'Usuário ou senha incorretos');
		}

		const user = await this._awsClient.send(new AdminGetUserCommand({
			// eslint-disable-next-line @typescript-eslint/naming-convention
			UserPoolId: process.env.COGNITO_USER_POOL_ID,
			// eslint-disable-next-line @typescript-eslint/naming-convention
			Username: username,
		}));

		const userAttributes = convertCognitoUserAttributesToObj(user.UserAttributes as TypeCognitoUserAttributes);

		const token = generateToken(userAttributes);

		return {
			status: 'SUCCESSFUL',
			data: {token},
		};
	}
}
