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
import CustomError from '../utils/CustomError.js';
import {generateToken} from '../utils/jwt.js';
import {type TypeServiceReturn} from '../types/ServiceReturn.js';
import SubscriptionService from './subscription.service.js';
import {logger} from '../utils/Logger.js';
import {type TypeUser, type TypeUserCreationAttributes} from '../types/User.js';
import {MailService} from './mail.service.js';
import {welcomeEmailTemplate} from '../assets/emails/welcome.email.template.js';
import {BotmakerService} from './botmaker.service.js';
import {MauticService} from './mautic.service.js';
import {UserForCreation} from '../entities/user.entity.js';
import {generateSecurePassword} from '../utils/generateSecurePassword.js';
import {newPassWordEmailTemplate} from '../assets/emails/newPassword.email.template.js';

export default class UserService {
	private readonly _awsClient: CognitoIdentityProviderClient;
	private readonly _subscriptionService: SubscriptionService;
	private readonly _mailService: MailService;
	private readonly _botmakerService: BotmakerService;
	private readonly _mauticService: MauticService;

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
		this._mauticService = new MauticService();
	}

	public async create(userData: TypeUserCreationAttributes): Promise<TypeServiceReturn<unknown>> {
		const newUser = new UserForCreation(userData);

		const {email, phoneNumber, firstName, lastName, roles, document} = newUser;

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

		const username: string = userCreationResponse.User?.Attributes?.find(attr => attr.Name === 'sub')?.Value ?? '';

		const password = generateSecurePassword();

		await this._setUserPassword(username, password);

		try {
			const response = await this._mauticService.createContact({
				email,
				firstName,
				lastName,
			});

			const mauticUserId = response.data.contact.id;

			try {
				await this._mauticService.addContactToSegment(mauticUserId, 3);
			} catch (error) {
				logger.logError(`Error adding user ${email} to segment 3: ${(error as Error).message}`);
			}
		} catch (error) {
			logger.logError(`Error creating contact in Mautic for user ${email}: ${(error as Error).message}`);
		}

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
			logger.logError(`Error sending welcome email or whatsapp message to user ${email}: ${(error as Error).message}`);
		}

		return {
			status: 'CREATED',
			data: {
				userId: username,
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

		let token = '';
		try {
			token = generateToken(user);
		} catch (error) {
			logger.logError(`Error generating token for user ${user.id}: ${(error as Error).message}`);
			throw new CustomError('UNKNOWN', `Error generating token for user ${user.id}: ${(error as Error).message}`);
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

	public async getNewPassword(email: string): Promise<TypeServiceReturn<unknown>> {
		try {
			const {data: user} = await this._getUserData(email);

			const password = generateSecurePassword();

			await this._setUserPassword(user.id, password);

			await Promise.all([
				this._mailService.sendEmail(newPassWordEmailTemplate(user.firstName, user.email, password)),
				this._botmakerService.sendWhatsappTemplateMessate(user.phoneNumber, 'new_password', {
					primeiroNome: user.firstName,
					emailAluno: user.email,
					senha: password,
				}),
			]);

			return {
				status: 'NO_CONTENT',
				data: null,
			};
		} catch (error) {
			logger.logError(`Error getting new password for user ${email}: ${(error as Error).message}`);
			throw new CustomError('UNKNOWN', 'Error setting new password');
		}
	}

	private async _setUserPassword(username: string, password: string): Promise<TypeServiceReturn<unknown>> {
		try {
			logger.logDebug(`Setting user password for user ${username}`);
			const paramsForSettingUserPassword = {
				// eslint-disable-next-line @typescript-eslint/naming-convention
				UserPoolId: process.env.COGNITO_USER_POOL_ID,
				// eslint-disable-next-line @typescript-eslint/naming-convention
				Username: username,
				// eslint-disable-next-line @typescript-eslint/naming-convention
				Password: password,
				// eslint-disable-next-line @typescript-eslint/naming-convention
				Permanent: true,
			};

			const commandForSettingUserPassword = new AdminSetUserPasswordCommand(paramsForSettingUserPassword);
			await this._awsClient.send(commandForSettingUserPassword);
			logger.logDebug(`User password set successfully for user ${username}`);

			return {
				status: 'NO_CONTENT',
				data: null,
			};
		} catch (error) {
			logger.logError(`Error setting user password for user ${username}: ${(error as Error).message}`);
			throw new CustomError('UNKNOWN', 'Error setting user password');
		}
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
