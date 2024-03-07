import {fromEnv} from '@aws-sdk/credential-providers';
import {
	CognitoIdentityProviderClient,
	InitiateAuthCommand,
	type InitiateAuthCommandInput,
	AdminGetUserCommand,
	AdminCreateUserCommand,
	type MessageActionType,
	AdminSetUserPasswordCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import CustomError from '../utils/CustomError';
import {generateToken} from '../utils/jwt';
import type TypeUser from '../types/User';
import {type TypeServiceReturn} from '../types/ServiceReturn';
import SubscriptionService from './subscription.service';
import {logger} from '../utils/Logger';
import {type TypeUserCreationAttributes} from '../types/User';
import {convertStringToStartCase} from '../utils/convertStringToStartCase';
import {MailService} from './mail.service';
import {welcomeEmailTemplate} from '../assets/emails/welcome.email.template';
import {BotmakerService} from './botmaker.service';

export default class UserService {
	private readonly _awsClient: CognitoIdentityProviderClient;
	private readonly _subscriptionService: SubscriptionService;
	private readonly _mailService: MailService;
	private readonly _botmakerService: BotmakerService;

	constructor(
		awsClient: CognitoIdentityProviderClient = new CognitoIdentityProviderClient({
			region: process.env.AWS_REGION ?? 'us-east-1',
			credentials: fromEnv(),
		}),
	) {
		this._awsClient = awsClient;
		this._subscriptionService = new SubscriptionService();
		this._mailService = new MailService();
		this._botmakerService = new BotmakerService();
	}

	public async create(userData: TypeUserCreationAttributes): Promise<TypeServiceReturn<unknown>> {
		const {email: unformattedEmail, phoneNumber, firstName: unformattedFirstName, lastName: unformattedLastName, roles, document} = userData;

		if (!unformattedEmail || !phoneNumber || !unformattedFirstName || !unformattedLastName) {
			throw new CustomError('INVALID_DATA', 'Missing some required fields');
		}

		const email = unformattedEmail.trim().toLowerCase();
		const firstName = convertStringToStartCase(unformattedFirstName);
		const lastName = convertStringToStartCase(unformattedLastName);

		const paramsforUserCreation = {
			// eslint-disable-next-line @typescript-eslint/naming-convention
			UserPoolId: process.env.COGNITO_USER_POOL_ID,
			// eslint-disable-next-line @typescript-eslint/naming-convention
			Username: email.toLowerCase(),
			// eslint-disable-next-line @typescript-eslint/naming-convention
			MessageAction: 'SUPPRESS' as MessageActionType,
			// eslint-disable-next-line @typescript-eslint/naming-convention
			UserAttributes: [
				{
					// eslint-disable-next-line @typescript-eslint/naming-convention
					Name: 'email',
					// eslint-disable-next-line @typescript-eslint/naming-convention
					Value: email,
				},
				{
					// eslint-disable-next-line @typescript-eslint/naming-convention
					Name: 'email_verified',
					// eslint-disable-next-line @typescript-eslint/naming-convention
					Value: 'true',
				},
				{
					// eslint-disable-next-line @typescript-eslint/naming-convention
					Name: 'phone_number_verified',
					// eslint-disable-next-line @typescript-eslint/naming-convention
					Value: 'true',
				},
				{
					// eslint-disable-next-line @typescript-eslint/naming-convention
					Name: 'phone_number',
					// eslint-disable-next-line @typescript-eslint/naming-convention
					Value: phoneNumber,
				},
				{
					// eslint-disable-next-line @typescript-eslint/naming-convention
					Name: 'given_name',
					// eslint-disable-next-line @typescript-eslint/naming-convention
					Value: firstName,
				},
				{
					// eslint-disable-next-line @typescript-eslint/naming-convention
					Name: 'family_name',
					// eslint-disable-next-line @typescript-eslint/naming-convention
					Value: lastName,
				},
				{
					// eslint-disable-next-line @typescript-eslint/naming-convention
					Name: 'custom:roles',
					// eslint-disable-next-line @typescript-eslint/naming-convention
					Value: roles?.join('-') ?? 'iniciantes',
				},
				{
					// eslint-disable-next-line @typescript-eslint/naming-convention
					Name: 'custom:CPF',
					// eslint-disable-next-line @typescript-eslint/naming-convention
					Value: document,
				},
			],
		};

		const commandforUserCreation = new AdminCreateUserCommand(paramsforUserCreation);
		const userCreationResponse = await this._awsClient.send(commandforUserCreation);

		if (userCreationResponse.$metadata.httpStatusCode !== 200) {
			logger.logError(`Error creating user ${email}`);
			throw new CustomError('INVALID_DATA', 'Error creating user');
		}

		logger.logDebug(`User ${email} created successfully: ${JSON.stringify(userCreationResponse.User)}`);

		const userName: string = userCreationResponse.User?.Attributes?.find(attr => attr.Name === 'sub')?.Value ?? '';
		const password = crypto.getRandomValues(new Uint32Array(1))[0].toString(36).slice(-6);

		const paramsForSettingUserPassword = {
			// eslint-disable-next-line @typescript-eslint/naming-convention
			UserPoolId: process.env.COGNITO_USER_POOL_ID,
			// eslint-disable-next-line @typescript-eslint/naming-convention
			Username: userName,
			// eslint-disable-next-line @typescript-eslint/naming-convention
			Password: password,
			// eslint-disable-next-line @typescript-eslint/naming-convention
			Permanent: true,
		};

		const commandForSettingUserPassword = new AdminSetUserPasswordCommand(paramsForSettingUserPassword);
		const userPasswordResponse = await this._awsClient.send(commandForSettingUserPassword);

		if (userPasswordResponse.$metadata.httpStatusCode !== 200) {
			logger.logError(`Error setting user password for user ${email.toLowerCase()}`);
			throw new CustomError('INVALID_DATA', 'Error setting user password');
		}

		logger.logDebug(`User ${email.toLowerCase()} password set successfully`);

		try {
			await Promise.all([
				this._mailService.sendEmail(welcomeEmailTemplate(firstName, email, password)),
				this._botmakerService.sendWhatsappTemplateMessate(phoneNumber, 'senha', {
					nome: firstName,
					linkDaAreaDosAlunos: 'https://escola.yogaemmovimento.com',
					usuario: email,
					senha: password,
				}),
			]);
		} catch (error) {
			logger.logError(`Error sending welcome email or whatsapp message to user ${email.toLowerCase()}: ${(error as Error).message}`);
		}

		return {
			status: 'CREATED',
			data: {
				userId: userName,
			},
		};
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
