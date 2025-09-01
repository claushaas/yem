import {
	AdminCreateUserCommand,
	AdminDeleteUserCommand,
	AdminGetUserCommand,
	AdminSetUserPasswordCommand,
	AdminUpdateUserAttributesCommand,
	CognitoIdentityProviderClient,
	InitiateAuthCommand,
	type InitiateAuthCommandInput,
	type MessageActionType,
} from '@aws-sdk/client-cognito-identity-provider';
import { fromEnv } from '@aws-sdk/credential-providers';
import { newPassWordEmailTemplate } from '../assets/email/new-password.email.template.server.js';
import { welcomeEmailTemplate } from '../assets/email/welcome.email.template.server.js';
import { UserForCreation } from '../entities/user.entity.server.js';
import type { TServiceReturn } from '../types/service-return.type.js';
import type { TUser, TUserCreationAttributes } from '../types/user.type.js';
import { CustomError } from '../utils/custom-error.js';
import { generateSecurePassword } from '../utils/generate-secure-password.js';
import { logger } from '../utils/logger.util.js';
import { MailService } from './mail.service.server.js';
import SubscriptionService from './subscription.service.server.js';

export class UserService {
	private readonly _awsClient: CognitoIdentityProviderClient;
	private readonly _subscriptionService: SubscriptionService;
	private readonly _mailService: MailService;

	constructor(
		awsClient: CognitoIdentityProviderClient = new CognitoIdentityProviderClient(
			{
				credentials: fromEnv(),
				region: process.env.AWS_REGION ?? 'us-east-1',
			},
		),
	) {
		this._awsClient = awsClient;
		this._subscriptionService = new SubscriptionService();
		this._mailService = new MailService();
	}

	public async createOrFail(
		userData: TUserCreationAttributes,
	): Promise<TServiceReturn<{ userId: string }>> {
		logger.logDebug(`Finding user ${typeof userData.phoneNumber}`);
		const maybeUser = await this.verifyUserExists(userData.email);
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

	public async createOrUpdate(
		userData: TUserCreationAttributes,
	): Promise<TServiceReturn<{ userData: TUser }>> {
		const { data: userExists } = await this.verifyUserExists(userData.email);

		if (userExists) {
			const { data: userFromDB } = await this.getUserData(userData.email);

			if (userData.phoneNumber !== userFromDB.phoneNumber) {
				await this.updateUserPhoneNumber(userFromDB.id, userData.phoneNumber);
			}

			if (userData.document !== userFromDB.document && userData.document) {
				await this.updateUserDocument(userFromDB.id, userData.document);
			}

			const updatedUser = await this.getUserData(userData.email);

			return {
				data: {
					userData: updatedUser.data,
				},
				status: 'SUCCESSFUL',
			};
		}

		await this._create(userData);

		const { data: newUser } = await this.getUserData(userData.email);

		return {
			data: {
				userData: newUser,
			},
			status: 'SUCCESSFUL',
		};
	}

	public async login(
		username: string,
		password: string,
	): Promise<TServiceReturn<{ userData: TUser }>> {
		const cleanUsername = username.trim().toLowerCase();

		const parameters: InitiateAuthCommandInput = {
			AuthFlow: 'USER_PASSWORD_AUTH',
			AuthParameters: {
				PASSWORD: password,
				USERNAME: cleanUsername,
			},
			ClientId: process.env.COGNITO_CLIENT_ID,
		};

		const command = new InitiateAuthCommand(parameters);
		const response = await this._awsClient.send(command);

		if (response.$metadata.httpStatusCode !== 200) {
			throw new CustomError('UNAUTHORIZED', 'Usuário ou senha incorretos');
		}

		const { data: user } = await this.getUserData(cleanUsername);

		try {
			await this._subscriptionService.createUserInitialSubscriptions(user);
		} catch (error) {
			logger.logError(
				`Error creating or updating subscriptions: ${(error as Error).message}`,
			);
		}

		logger.logInfo(`User ${user.id} logged in successfully`);

		return {
			data: {
				userData: user,
			},
			status: 'SUCCESSFUL',
		};
	}

	public async getNewPassword(email: string): Promise<TServiceReturn<string>> {
		try {
			console.log('Getting new password for user', email);
			const { data: user } = await this.getUserData(email);

			const password = generateSecurePassword();

			await this._setUserPassword(user.id, password);

			await Promise.all([
				this._mailService.sendEmail(
					newPassWordEmailTemplate(user.firstName, user.email, password),
				),
			]);

			return {
				data: 'New password sent successfully',
				status: 'NO_CONTENT',
			};
		} catch (error) {
			logger.logError(
				`Error getting new password for user ${email}: ${(error as Error).message}`,
			);
			throw new CustomError('UNKNOWN', 'Error setting new password');
		}
	}

	public async verifyUserExists(
		username: string,
	): Promise<TServiceReturn<boolean>> {
		try {
			const cleanUsername = username.trim().toLowerCase();

			await this._awsClient.send(
				new AdminGetUserCommand({
					Username: cleanUsername,

					UserPoolId: process.env.COGNITO_USER_POOL_ID,
				}),
			);
			return {
				data: true,
				status: 'SUCCESSFUL',
			};
		} catch (error) {
			logger.logError(
				`Error verifying user ${username} exists: ${(error as Error).message}`,
			);
			return {
				data: false,
				status: 'SUCCESSFUL',
			};
		}
	}

	public async getUserData(username: string): Promise<TServiceReturn<TUser>> {
		const cleanUsername = username.trim().toLowerCase();

		const user = await this._awsClient.send(
			new AdminGetUserCommand({
				Username: cleanUsername,
				UserPoolId: process.env.COGNITO_USER_POOL_ID,
			}),
		);

		const cleanUser: TUser = {
			document:
				user.UserAttributes?.find(
					(attribute) => attribute.Name === 'custom:CPF',
				)?.Value ?? '',
			email:
				user.UserAttributes?.find((attribute) => attribute.Name === 'email')
					?.Value ?? '',
			firstName:
				user.UserAttributes?.find(
					(attribute) => attribute.Name === 'given_name',
				)?.Value ?? '',
			id:
				user.UserAttributes?.find((attribute) => attribute.Name === 'sub')
					?.Value ?? '',
			lastName:
				user.UserAttributes?.find(
					(attribute) => attribute.Name === 'family_name',
				)?.Value ?? '',
			phoneNumber:
				user.UserAttributes?.find(
					(attribute) => attribute.Name === 'phone_number',
				)?.Value ?? '',
			roles:
				user.UserAttributes?.find(
					(attribute) => attribute.Name === 'custom:roles',
				)?.Value?.split('-') ?? [],
		};

		if (!cleanUser.id) {
			logger.logError(
				`Error getting user data: user id ${cleanUsername} not found`,
			);
			throw new CustomError('NOT_FOUND', 'Usuário não encontrado');
		}

		return {
			data: cleanUser,
			status: 'SUCCESSFUL',
		};
	}

	public async updateUserName(id: string, firstName: string, lastName: string) {
		const parameters = {
			UserAttributes: [
				{
					Name: 'given_name',
					Value: firstName,
				},
				{
					Name: 'family_name',
					Value: lastName,
				},
			],
			Username: id,
			UserPoolId: process.env.COGNITO_USER_POOL_ID,
		};

		const command = new AdminUpdateUserAttributesCommand(parameters);

		try {
			await Promise.all([this._awsClient.send(command)]);
		} catch (error) {
			logger.logError(`Error updating name ${(error as Error).message}`);
			throw new CustomError(
				'UNKNOWN',
				`Error updating name ${(error as Error).message}`,
			);
		}
	}

	public async updateUserEmail(id: string, newEmail: string) {
		const parameters = {
			UserAttributes: [
				{
					Name: 'email',
					Value: newEmail,
				},
				{
					Name: 'email_verified',
					Value: 'true',
				},
			],
			Username: id,
			UserPoolId: process.env.COGNITO_USER_POOL_ID,
		};

		const command = new AdminUpdateUserAttributesCommand(parameters);

		try {
			await Promise.all([this._awsClient.send(command)]);
		} catch (error) {
			logger.logError(`Error updating email ${(error as Error).message}`);
			throw new CustomError(
				'UNKNOWN',
				`Error updating email ${(error as Error).message}`,
			);
		}
	}

	public async updateUserPhoneNumber(id: string, phoneNumber: string) {
		const parameters = {
			UserAttributes: [
				{
					Name: 'phone_number',
					Value: phoneNumber,
				},
				{
					Name: 'phone_number_verified',
					Value: 'true',
				},
			],
			Username: id,
			UserPoolId: process.env.COGNITO_USER_POOL_ID,
		};

		const command = new AdminUpdateUserAttributesCommand(parameters);

		try {
			await this._awsClient.send(command);
		} catch (error) {
			logger.logError(
				`Error updating phone number ${(error as Error).message}`,
			);
			throw new CustomError(
				'UNKNOWN',
				`Error updating phone number ${(error as Error).message}`,
			);
		}
	}

	public async updateUserDocument(id: string, document: string) {
		const parameters = {
			UserAttributes: [
				{
					Name: 'custom:CPF',
					Value: document,
				},
			],
			Username: id,
			UserPoolId: process.env.COGNITO_USER_POOL_ID,
		};

		const command = new AdminUpdateUserAttributesCommand(parameters);

		try {
			await this._awsClient.send(command);
		} catch (error) {
			logger.logError(`Error updating document ${(error as Error).message}`);
			throw new CustomError(
				'UNKNOWN',
				`Error updating document ${(error as Error).message}`,
			);
		}
	}

	public async addRolesToUser(user: TUser, roles: string[]) {
		const actualUserRoles = user.roles ?? ['iniciantes'];
		const newRoles = [...new Set([...actualUserRoles, ...roles])];

		const parameters = {
			UserAttributes: [
				{
					Name: 'custom:roles',
					Value: newRoles.length > 1 ? newRoles.join('-') : newRoles[0],
				},
			],
			Username: user.id,
			UserPoolId: process.env.COGNITO_USER_POOL_ID,
		};

		const command = new AdminUpdateUserAttributesCommand(parameters);

		try {
			await this._awsClient.send(command);
		} catch (error) {
			logger.logError(`Error adding roles to user ${(error as Error).message}`);
			throw new CustomError(
				'UNKNOWN',
				`Error adding roles to user ${(error as Error).message}`,
			);
		}
	}

	public async removeRolesFromUser(user: TUser, roles: string[]) {
		const actualUserRoles = user.roles ?? ['iniciantes'];
		const newRoles = actualUserRoles.filter((role) => !roles.includes(role));

		const parameters = {
			UserAttributes: [
				{
					Name: 'custom:roles',
					Value: newRoles.length > 1 ? newRoles.join('-') : newRoles[0],
				},
			],
			Username: user.id,
			UserPoolId: process.env.COGNITO_USER_POOL_ID,
		};

		const command = new AdminUpdateUserAttributesCommand(parameters);

		try {
			await this._awsClient.send(command);
		} catch (error) {
			logger.logError(
				`Error removing roles from user ${(error as Error).message}`,
			);
			throw new CustomError(
				'UNKNOWN',
				`Error removing roles from user ${(error as Error).message}`,
			);
		}
	}

	public async deleteUser(id: string) {
		try {
			const parameters = {
				Username: id,
				UserPoolId: process.env.COGNITO_USER_POOL_ID,
			};

			const command = new AdminDeleteUserCommand(parameters);

			await this._awsClient.send(command);

			return {
				data: `User ${id} deleted successfully`,
				status: 'SUCCESSFUL',
			};
		} catch (error) {
			logger.logError(`Error deleting user: ${(error as Error).message}`);
		}
	}

	private async _create(
		userData: TUserCreationAttributes,
	): Promise<TServiceReturn<{ userId: string }>> {
		logger.logDebug(`Creating user ${userData.email}`);
		const newUser = new UserForCreation(userData);
		logger.logDebug(`New user data: ${JSON.stringify(newUser)}`);

		const { email, phoneNumber, firstName, lastName, roles, document } =
			newUser;

		const paramsforUserCreation = {
			MessageAction: 'SUPPRESS' as MessageActionType,
			UserAttributes: [
				{ Name: 'email', Value: email },
				{ Name: 'email_verified', Value: 'true' },
				{ Name: 'phone_number_verified', Value: 'true' },
				{ Name: 'phone_number', Value: phoneNumber },
				{ Name: 'given_name', Value: firstName },
				{ Name: 'family_name', Value: lastName },
				{ Name: 'custom:roles', Value: roles ? roles.join('-') : 'iniciantes' },
				{ Name: 'custom:CPF', Value: document ?? '' },
				{ Name: 'custom:iuguId', Value: 'INVALID-IUGU-ID' }, // Added for support for old site, should be deleted when old site is no more supported
			],
			Username: email,
			UserPoolId: process.env.COGNITO_USER_POOL_ID,
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
		const username: string =
			userCreationResponse.User?.Attributes?.find(
				(attribute) => attribute.Name === 'sub',
			)?.Value ?? '';
		logger.logDebug(`User id for user ${email} is ${username}`);

		// Set custom-id for user, should be deleted when old site is no more supported
		const parameters = {
			UserAttributes: [{ Name: 'custom:id', Value: username }],
			Username: username,
			UserPoolId: process.env.COGNITO_USER_POOL_ID,
		};
		const command = new AdminUpdateUserAttributesCommand(parameters);
		await this._awsClient.send(command);

		const password = generateSecurePassword();

		logger.logDebug(`Setting user password for user ${username}`);
		await this._setUserPassword(username, password);
		logger.logDebug(`User password set successfully for user ${username}`);

		try {
			logger.logDebug(
				`Sending welcome email and whatsapp message to user ${email}`,
			);
			await Promise.all([
				this._mailService.sendEmail(
					welcomeEmailTemplate(firstName, email, password),
				),
			]);
		} catch (error) {
			logger.logError(
				`Error sending welcome email or whatsapp message to user ${email}: ${(error as Error).message}`,
			);
		}

		return {
			data: {
				userId: username,
			},
			status: 'CREATED',
		};
	}

	private async _setUserPassword(
		username: string,
		password: string,
	): Promise<TServiceReturn<string>> {
		try {
			logger.logDebug(`Setting user password for user ${username}`);
			const parametersForSettingUserPassword = {
				Password: password,

				Permanent: true,

				Username: username,

				UserPoolId: process.env.COGNITO_USER_POOL_ID,
			};

			const commandForSettingUserPassword = new AdminSetUserPasswordCommand(
				parametersForSettingUserPassword,
			);
			await this._awsClient.send(commandForSettingUserPassword);
			logger.logDebug(`User password set successfully for user ${username}`);

			return {
				data: 'User password set successfully',
				status: 'NO_CONTENT',
			};
		} catch (error) {
			logger.logError(
				`Error setting user password for user ${username}: ${(error as Error).message}`,
			);
			throw new CustomError('UNKNOWN', 'Error setting user password');
		}
	}
}
