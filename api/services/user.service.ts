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
import {CustomError} from '../utils/custom-error.js';
import {generateToken} from '../utils/jwt.js';
import {type TServiceReturn} from '../types/service-return.type.js';
import {logger} from '../utils/logger.util.js';
import {
	type TUser,
	type TUserCreationAttributes,
} from '../types/user.type.js';
import {welcomeEmailTemplate} from '../assets/emails/welcome.email.template.js';
import {UserForCreation} from '../entities/user.entity.js';
import {generateSecurePassword} from '../utils/generate-secure-password.js';
import {newPassWordEmailTemplate} from '../assets/emails/new-password.email.template.js';
import {MauticService} from './mautic.service.js';
import {BotmakerService} from './botmaker.service.js';
import {MailService} from './mail.service.js';
import SubscriptionService from './subscription.service.js';

export class UserService {
	private readonly _awsClient: CognitoIdentityProviderClient;
	private readonly _subscriptionService: SubscriptionService;
	private readonly _mailService: MailService;
	private readonly _botmakerService: BotmakerService;
	private readonly _mauticService: MauticService;

	constructor(
		awsClient: CognitoIdentityProviderClient = new CognitoIdentityProviderClient(
			{
				region: process.env.AWS_REGION ?? 'us-east-1',
				credentials: fromEnv(),
			},
		),
	) {
		this._awsClient = awsClient;
		this._subscriptionService = new SubscriptionService();
		this._mailService = new MailService();
		this._botmakerService = new BotmakerService();
		this._mauticService = new MauticService();
	}

	public async createOrFail(userData: TUserCreationAttributes): Promise<TServiceReturn<{userId: string}>> {
		logger.logDebug(`Finding user ${typeof userData.phoneNumber}`);
		const maybeUser = await this._verifyUserExists(userData.email);
		logger.logDebug(
			`User ${userData.email} found: ${JSON.stringify(maybeUser)}`,
		);

		if (maybeUser.data) {
			logger.logError(`User ${userData.email} already exists`);
			throw new CustomError('CONFLICT', 'Usuário já existe');
		}

		logger.logDebug(
			`User ${JSON.stringify(userData)} not found, creating user`,
		);
		const newUserData = await this._create(userData);
		logger.logDebug(`User ${userData.email} created successfully`);

		return newUserData;
	}

	public async login(username: string, password: string): Promise<TServiceReturn<{token: string; userData: TUser}>> {
		const cleanUsername = username.trim().toLowerCase();

		const parameters: InitiateAuthCommandInput = {

			AuthFlow: 'USER_PASSWORD_AUTH',

			ClientId: process.env.COGNITO_CLIENT_ID,

			AuthParameters: {

				USERNAME: cleanUsername,

				PASSWORD: password,
			},
		};

		const command = new InitiateAuthCommand(parameters);
		const response = await this._awsClient.send(command);

		if (response.$metadata.httpStatusCode !== 200) {
			throw new CustomError('UNAUTHORIZED', 'Usuário ou senha incorretos');
		}

		const {data: user} = await this._getUserData(cleanUsername);

		let token = '';
		try {
			token = generateToken(user);
		} catch (error) {
			logger.logError(
				`Error generating token for user ${user.id}: ${(error as Error).message}`,
			);
			throw new CustomError(
				'UNKNOWN',
				`Error generating token for user ${user.id}: ${(error as Error).message}`,
			);
		}

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

	public async getNewPassword(email: string): Promise<TServiceReturn<unknown>> {
		try {
			const {data: user} = await this._getUserData(email);

			const password = generateSecurePassword();

			await this._setUserPassword(user.id, password);

			await Promise.all([
				this._mailService.sendEmail(
					newPassWordEmailTemplate(user.firstName, user.email, password),
				),
				this._botmakerService.sendWhatsappTemplateMessate(
					user.phoneNumber,
					'new_password',
					{
						primeiroNome: user.firstName,
						emailAluno: user.email,
						senha: password,
					},
				),
			]);

			return {
				status: 'NO_CONTENT',
				data: null,
			};
		} catch (error) {
			logger.logError(
				`Error getting new password for user ${email}: ${(error as Error).message}`,
			);
			throw new CustomError('UNKNOWN', 'Error setting new password');
		}
	}

	private async _create(userData: TUserCreationAttributes): Promise<TServiceReturn<{userId: string}>> {
		logger.logDebug(`Creating user ${userData.email}`);
		const newUser = new UserForCreation(userData);
		logger.logDebug(`New user data: ${JSON.stringify(newUser)}`);

		const {email, phoneNumber, firstName, lastName, roles, document}
      = newUser;

		const paramsforUserCreation = {

			UserPoolId: process.env.COGNITO_USER_POOL_ID,

			Username: email.toLowerCase(),

			MessageAction: 'SUPPRESS' as MessageActionType,

			UserAttributes: [
				{

					Name: 'email',

					Value: email,
				},
				{

					Name: 'email_verified',

					Value: 'true',
				},
				{

					Name: 'phone_number_verified',

					Value: 'true',
				},
				{

					Name: 'phone_number',

					Value: phoneNumber,
				},
				{

					Name: 'given_name',

					Value: firstName,
				},
				{

					Name: 'family_name',

					Value: lastName,
				},
				{

					Name: 'custom:roles',

					Value: roles?.join('-') ?? 'iniciantes',
				},
				{

					Name: 'custom:CPF',

					Value: document ?? '',
				},
			],
		};

		logger.logDebug(
			`Creating Cognito command for ${email} with data: ${JSON.stringify(paramsforUserCreation)}`,
		);
		const commandforUserCreation = new AdminCreateUserCommand(
			paramsforUserCreation,
		);
		const userCreationResponse = await this._awsClient.send(
			commandforUserCreation,
		);
		logger.logDebug(
			`User creation response: ${JSON.stringify(userCreationResponse.$metadata)}`,
		);
		logger.logDebug(
			`User creation response: ${JSON.stringify(userCreationResponse.User)}`,
		);

		if (userCreationResponse.$metadata.httpStatusCode !== 200) {
			logger.logError(`Error creating user ${email}`);
			throw new CustomError('INVALID_DATA', 'Error creating user');
		}

		logger.logDebug(
			`User ${email} created successfully: ${JSON.stringify(userCreationResponse.User)}`,
		);

		logger.logDebug(`Getting user id for user ${email}`);
		const username: string
      = userCreationResponse.User?.Attributes?.find(attribute => attribute.Name === 'sub')?.Value ?? '';
		logger.logDebug(`User id for user ${email} is ${username}`);

		const password = generateSecurePassword();

		logger.logDebug(`Setting user password for user ${username}`);
		await this._setUserPassword(username, password);
		logger.logDebug(`User password set successfully for user ${username}`);

		try {
			logger.logDebug(`Creating contact in Mautic for user ${email}`);
			const response = await this._mauticService.createContact({
				email,
				firstName,
				lastName,
			});

			const mauticUserId = response.data.contact.id;

			try {
				logger.logDebug(`Adding user ${email} to segment 3`);
				await this._mauticService.addContactToSegment(mauticUserId, 3);
			} catch (error) {
				logger.logError(
					`Error adding user ${email} to segment 3: ${(error as Error).message}`,
				);
			}
		} catch (error) {
			logger.logError(
				`Error creating contact in Mautic for user ${email}: ${(error as Error).message}`,
			);
		}

		try {
			logger.logDebug(
				`Sending welcome email and whatsapp message to user ${email}`,
			);
			await Promise.all([
				this._mailService.sendEmail(
					welcomeEmailTemplate(firstName, email, password),
				),
				this._botmakerService.sendWhatsappTemplateMessate(
					phoneNumber,
					'senha',
					{
						nome: firstName,
						linkDaAreaDosAlunos: 'https://escola.yogaemmovimento.com',
						usuario: email,
						senha: password,
					},
				),
			]);
		} catch (error) {
			logger.logError(
				`Error sending welcome email or whatsapp message to user ${email}: ${(error as Error).message}`,
			);
		}

		return {
			status: 'CREATED',
			data: {
				userId: username,
			},
		};
	}

	private async _setUserPassword(username: string, password: string): Promise<TServiceReturn<string>> {
		try {
			logger.logDebug(`Setting user password for user ${username}`);
			const parametersForSettingUserPassword = {

				UserPoolId: process.env.COGNITO_USER_POOL_ID,

				Username: username,

				Password: password,

				Permanent: true,
			};

			const commandForSettingUserPassword = new AdminSetUserPasswordCommand(
				parametersForSettingUserPassword,
			);
			await this._awsClient.send(commandForSettingUserPassword);
			logger.logDebug(`User password set successfully for user ${username}`);

			return {
				status: 'NO_CONTENT',
				data: 'User password set successfully',
			};
		} catch (error) {
			logger.logError(
				`Error setting user password for user ${username}: ${(error as Error).message}`,
			);
			throw new CustomError('UNKNOWN', 'Error setting user password');
		}
	}

	private async _verifyUserExists(username: string): Promise<TServiceReturn<boolean>> {
		try {
			const cleanUsername = username.trim().toLowerCase();

			await this._awsClient.send(
				new AdminGetUserCommand({

					UserPoolId: process.env.COGNITO_USER_POOL_ID,

					Username: cleanUsername,
				}),
			);
			return {
				status: 'SUCCESSFUL',
				data: true,
			};
		} catch (error) {
			logger.logError(
				`Error verifying user ${username} exists: ${(error as Error).message}`,
			);
			return {
				status: 'SUCCESSFUL',
				data: false,
			};
		}
	}

	private async _getUserData(username: string): Promise<TServiceReturn<TUser>> {
		const cleanUsername = username.trim().toLowerCase();

		const user = await this._awsClient.send(
			new AdminGetUserCommand({

				UserPoolId: process.env.COGNITO_USER_POOL_ID,

				Username: cleanUsername,
			}),
		);

		const cleanUser: TUser = {
			id: user.UserAttributes?.find(attribute => attribute.Name === 'sub')?.Value ?? '',
			email:
        user.UserAttributes?.find(attribute => attribute.Name === 'email')?.Value ?? '',
			roles:
        user.UserAttributes?.find(attribute => attribute.Name === 'custom:roles')?.Value?.split('-') ?? [],
			firstName:
        user.UserAttributes?.find(attribute => attribute.Name === 'given_name')?.Value ?? '',
			lastName:
        user.UserAttributes?.find(attribute => attribute.Name === 'family_name')?.Value ?? '',
			phoneNumber:
        user.UserAttributes?.find(attribute => attribute.Name === 'phone_number')?.Value ?? '',
		};

		logger.logInfo(`User ${cleanUser.id} data retrieved successfully`);

		if (!cleanUser.id) {
			logger.logError(
				`Error getting user data: user id ${cleanUsername} not found`,
			);
			throw new CustomError('NOT_FOUND', 'Usuário não encontrado');
		}

		return {
			status: 'SUCCESSFUL',
			data: cleanUser,
		};
	}
}
