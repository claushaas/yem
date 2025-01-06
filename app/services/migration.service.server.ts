import {type PrismaClient} from '@prisma/client';
import {
	CognitoIdentityProviderClient, ListUsersCommand, type UserType, type ListUsersCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';
import {fromEnv} from '@aws-sdk/credential-providers';
import {LessonActivityService} from './lesson-activity.service.server';
import {database} from '~/database/database.server';
import {type TServiceReturn} from '~/types/service-return.type';

export class MigrationService {
	private readonly _model: PrismaClient;
	private readonly _lessonActivityService: LessonActivityService;
	private readonly _awsClient: CognitoIdentityProviderClient;

	constructor(
		model: PrismaClient = database,
		awsClient: CognitoIdentityProviderClient = new CognitoIdentityProviderClient({
			region: process.env.AWS_REGION ?? 'us-east-1',
			credentials: fromEnv(),
		}),
	) {
		this._awsClient = awsClient;
		this._model = model;
		this._lessonActivityService = new LessonActivityService();
	}

	// Public async migrateCompletedLessonsForUser(userId: string) {}

	public async getUsers(): Promise<TServiceReturn<UserType[]>> {
		const listUsersCommand = (paginationToken: string | undefined) => new ListUsersCommand({
			UserPoolId: process.env.COGNITO_USER_POOL_ID,
			Limit: 60,
			PaginationToken: paginationToken ?? undefined,
		});

		const users: UserType[] = [];

		const addUsersToList = async (paginationToken: string | undefined) => {
			try {
				const result = await this._awsClient.send(listUsersCommand(paginationToken));
				if (result.Users) {
					users.push(...result.Users);
				}

				if (result.PaginationToken) {
					await addUsersToList(result.PaginationToken);
				}
			} catch (error) {
				console.error(error);
			}
		};

		await addUsersToList(undefined);

		return {
			status: 'SUCCESSFUL',
			data: users,
		};
	}
}
