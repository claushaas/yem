import {type PrismaClient} from '@prisma/client';
import {
	CognitoIdentityProviderClient, ListUsersCommand, type UserType,
} from '@aws-sdk/client-cognito-identity-provider';
import {fromEnv} from '@aws-sdk/credential-providers';
import {DynamoDB} from '@aws-sdk/client-dynamodb';
import {DynamoDBDocument, type QueryCommandOutput} from '@aws-sdk/lib-dynamodb';
import {p} from 'node_modules/@react-router/dev/dist/routes-DHIOx0R9';
import {LessonActivityService} from './lesson-activity.service.server';
import {database} from '~/database/database.server';
import {type TServiceReturn} from '~/types/service-return.type';
import {logger} from '~/utils/logger.util';

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

	public async migrateSavedAndFavoritedLessons(): Promise<TServiceReturn<string>> {
		try {
			logger.logInfo('Started: Getting users for Saved And Favorited Lessons migration');
			const {data: users} = await this.getUsers();
			logger.logInfo('Completed: Getting users for Saved And Favorited Lessons migration');

			const client = new DynamoDB({
				region: process.env.AWS_REGION ?? 'us-east-1',
				credentials: fromEnv(),
			});
			const ddbDocumentClient = DynamoDBDocument.from(client);

			users.forEach(async user => { // eslint-disable-line unicorn/no-array-for-each
				const userId = user.Attributes?.find(attribute => attribute.Name === 'custom:id')?.Value ?? user.Attributes!.find(attribute => attribute.Name === 'sub')!.Value!;

				const {data: favoritedLessons} = await this.getFavoritedLessonsForUser(userId, ddbDocumentClient);
				const {data: completedLessons} = await this.getCompletedLessonsForUser(userId, ddbDocumentClient);

				if (favoritedLessons && favoritedLessons.length > 0) {
					await Promise.all(favoritedLessons.map(async dynamoLesson => {
						const newLesson = await this._model.lesson.findUnique({where: {oldId: dynamoLesson.aula as string}});
						console.log(newLesson);

						if (newLesson) {
							await this._model.favoritedLessons.create({
								data: {
									userId,
									lessonSlug: newLesson.slug,
								},
							});
						}
					},
					));
				}

				if (completedLessons && completedLessons.length > 0) {
					await Promise.all(completedLessons.map(async dynamoLesson => {
						const newLesson = await this._model.lesson.findUnique({where: {oldId: dynamoLesson.aula as string}});
						console.log(newLesson);

						if (newLesson) {
							await this._model.favoritedLessons.upsert({
								create: {
									userId,
									lessonSlug: newLesson.slug,
								},
								where: {
									userId_lessonSlug: { // eslint-disable-line @typescript-eslint/naming-convention
										userId,
										lessonSlug: newLesson.slug,
									},
								},
								update: {
									createdAt: new Date(dynamoLesson.data as string),
								},
							});
						}
					},
					));
				}
			});

			return {
				status: 'SUCCESSFUL',
				data: 'Saved And Favorited Lessons Migrated Successfuly',
			};
		} catch (error) {
			logger.logError((error as Error).message);

			return {
				status: 'UNKNOWN',
				data: (error as Error).message,
			};
		}
	}

	private async getFavoritedLessonsForUser(userId: string, ddbDocumentClient: DynamoDBDocument): Promise<TServiceReturn<QueryCommandOutput['Items']>> {
		const result = await ddbDocumentClient.query({
			TableName: 'yem-prod-aulasFavoritas',
			IndexName: 'aluno-index',
			KeyConditionExpression: 'aluno = :aluno',
			ExpressionAttributeValues: {
				':aluno': userId, // eslint-disable-line @typescript-eslint/naming-convention
			},
		});

		return {
			status: 'SUCCESSFUL',
			data: result.Items ?? [],
		};
	}

	private async getCompletedLessonsForUser(userId: string, ddbDocumentClient: DynamoDBDocument): Promise<TServiceReturn<QueryCommandOutput['Items']>> {
		const result = await ddbDocumentClient.query({
			TableName: 'yem-prod-aulasAssistidas',
			IndexName: 'aluno-index',
			KeyConditionExpression: 'aluno = :aluno',
			ExpressionAttributeValues: {
				':aluno': userId, // eslint-disable-line @typescript-eslint/naming-convention
			},
		});

		return {
			status: 'SUCCESSFUL',
			data: result.Items?.sort((a, b) => Number(a.data) - Number(b.data)) ?? [],
		};
	}

	private async getUsers(): Promise<TServiceReturn<UserType[]>> {
		const listUsersCommand = (paginationToken: string | undefined) => new ListUsersCommand({
			UserPoolId: process.env.COGNITO_USER_POOL_ID,
			Limit: 60,
			PaginationToken: paginationToken ?? undefined,
		});

		const users: UserType[] = [];

		const addUsersToList = async (paginationToken: string | undefined, pages = 0) => {
			try {
				const result = await this._awsClient.send(listUsersCommand(paginationToken));

				if (result.Users) {
					users.push(...result.Users);
				}

				if (result.PaginationToken && pages < 20) {
					await addUsersToList(result.PaginationToken, pages + 1);
				}
			} catch (error) {
				logger.logError((error as Error).message);
			}
		};

		await addUsersToList(undefined);

		return {
			status: 'SUCCESSFUL',
			data: users,
		};
	}
}
