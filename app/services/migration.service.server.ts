import {type PrismaClient} from '@prisma/client';
import {
	CognitoIdentityProviderClient, ListUsersCommand, type UserType,
} from '@aws-sdk/client-cognito-identity-provider';
import {fromEnv} from '@aws-sdk/credential-providers';
import {DynamoDB} from '@aws-sdk/client-dynamodb';
import {DynamoDBDocument, type QueryCommandOutput} from '@aws-sdk/lib-dynamodb';
import {database} from '~/database/database.server';
import {type TServiceReturn} from '~/types/service-return.type';
import {logger} from '~/utils/logger.util';
import {memoryCache} from '~/cache/memory-cache';

export class MigrationService {
	private readonly _model: PrismaClient;
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
	}

	public async migrateSavedAndFavoritedLessonsForUsers(users: UserType[]): Promise<TServiceReturn<string>> {
		try {
			const client = new DynamoDB({
				region: process.env.AWS_REGION ?? 'us-east-1',
				credentials: fromEnv(),
				requestHandler: {
					requestTimeout: 60_000,
					keepAlive: true,
				},
			});
			const ddbDocumentClient = DynamoDBDocument.from(client);

			users.forEach(async user => { // eslint-disable-line unicorn/no-array-for-each
				const userId = user.Attributes?.find(attribute => attribute.Name === 'custom:id')?.Value ?? user.Attributes!.find(attribute => attribute.Name === 'sub')!.Value!;
				const newUserId = user.Attributes!.find(attribute => attribute.Name === 'sub')!.Value!;
				logger.logDebug(`User: ${userId} - New User Id: ${newUserId}`);

				const {data: favoritedLessons} = await this.getFavoritedLessonsForUser(userId, ddbDocumentClient);
				logger.logDebug(`User: ${userId} - Favorited Lessons: ${favoritedLessons?.length}`);

				const {data: completedLessons} = await this.getCompletedLessonsForUser(userId, ddbDocumentClient);
				logger.logDebug(`User: ${userId} - Completed Lessons: ${completedLessons?.length}`);

				if (favoritedLessons && favoritedLessons.length > 0) {
					const favoritedLessonsArray = favoritedLessons.map(dynamoLesson => {
						const lesson = memoryCache.entries().find(([key, value]) => {
							const lesson = JSON.parse(value) as Record<string, any>;

							const oldId = lesson?.lesson?.oldId as string || '';

							return oldId === dynamoLesson.aula;
						})?.[1];

						if (!lesson) {
							return null;
						}

						return {
							userId: newUserId,
							lessonSlug: JSON.parse(lesson).lesson.slug as string,
						};
					});

					// eslint-disable-next-line unicorn/no-array-for-each
					favoritedLessonsArray.filter(element => element !== null).forEach(async element => {
						await this._model.favoritedLessons.upsert({
							create: element,
							update: element,
							where: {
								userId_lessonSlug: { // eslint-disable-line @typescript-eslint/naming-convention
									lessonSlug: element.lessonSlug,
									userId: element.userId,
								},
							},
						});
					});
				}

				if (completedLessons && completedLessons.length > 0) {
					const completedLessonsArray = completedLessons.map(dynamoLesson => {
						const lesson = memoryCache.entries().find(([key, value]) => {
							const lesson = JSON.parse(value) as Record<string, any>;

							const oldId = lesson?.lesson?.oldId as string || '';

							return oldId === dynamoLesson.aula;
						})?.[1];

						if (!lesson) {
							return null;
						}

						return {
							userId: newUserId,
							lessonSlug: JSON.parse(lesson).lesson.slug as string,
						};
					});

					// eslint-disable-next-line unicorn/no-array-for-each
					completedLessonsArray.filter(element => element !== null).forEach(async element => {
						await this._model.completedLessons.upsert({
							create: element,
							update: element,
							where: {
								lessonSlug_userId: { // eslint-disable-line @typescript-eslint/naming-convention
									lessonSlug: element.lessonSlug,
									userId: element.userId,
								},
							},
						});
					});

					// Await this._model.completedLessons.createMany({
					// 	data: completedLessonsArray.filter(element => element !== null),
					// });
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

	public async getUsers(): Promise<TServiceReturn<string>> {
		const listUsersCommand = (paginationToken: string | undefined) => new ListUsersCommand({
			UserPoolId: process.env.COGNITO_USER_POOL_ID,
			Limit: 60,
			PaginationToken: paginationToken ?? undefined,
		});

		const addUsersToList = async (paginationToken: string | undefined, pages = 0) => {
			try {
				const result = await this._awsClient.send(listUsersCommand(paginationToken));

				if (result.Users) {
					await this.migrateSavedAndFavoritedLessonsForUsers(result.Users);
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
			data: 'Users fetched successfully',
		};
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
}
