/** biome-ignore-all lint/suspicious/noExplicitAny: . */
/** biome-ignore-all lint/style/noNonNullAssertion: . */
import {
	CognitoIdentityProviderClient,
	ListUsersCommand,
	type UserType,
} from '@aws-sdk/client-cognito-identity-provider';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { fromEnv } from '@aws-sdk/credential-providers';
import {
	DynamoDBDocument,
	type QueryCommandOutput,
} from '@aws-sdk/lib-dynamodb';
import type { PrismaClient } from '@prisma/client';
import { memoryCache } from '~/cache/memory-cache';
import { database } from '~/database/database.server';
import type { TServiceReturn } from '~/types/service-return.type';
import { logger } from '~/utils/logger.util';

export class MigrationService {
	private readonly _model: PrismaClient;
	private readonly _awsClient: CognitoIdentityProviderClient;
	private readonly _dynamoClient: DynamoDBDocument;

	constructor(
		model: PrismaClient = database,
		awsClient: CognitoIdentityProviderClient = new CognitoIdentityProviderClient(
			{
				credentials: fromEnv(),
				region: process.env.AWS_REGION ?? 'us-east-1',
			},
		),
	) {
		this._awsClient = awsClient;
		this._model = model;

		const client = new DynamoDB({
			credentials: fromEnv(),
			region: process.env.AWS_REGION ?? 'us-east-1',
			requestHandler: {
				keepAlive: true,
				requestTimeout: 60_000,
			},
		});
		this._dynamoClient = DynamoDBDocument.from(client);
	}

	public async migrateSavedAndFavoritedLessonsForUsers(
		users: UserType[],
	): Promise<TServiceReturn<string>> {
		try {
			process.setMaxListeners(0);

			users.forEach(async (user) => {
				// eslint-disable-line unicorn/no-array-for-each
				const userId =
					user.Attributes?.find((attribute) => attribute.Name === 'custom:id')
						?.Value ??
					user.Attributes!.find((attribute) => attribute.Name === 'sub')!
						.Value!;
				const newUserId = user.Attributes!.find(
					(attribute) => attribute.Name === 'sub',
				)!.Value!;
				logger.logDebug(`User: ${userId} - New User Id: ${newUserId}`);

				const { data: favoritedLessons } =
					await this.getFavoritedLessonsForUser(userId, this._dynamoClient);
				logger.logDebug(
					`User: ${userId} - Favorited Lessons: ${favoritedLessons?.length}`,
				);

				const { data: completedLessons } =
					await this.getCompletedLessonsForUser(userId, this._dynamoClient);
				logger.logDebug(
					`User: ${userId} - Completed Lessons: ${completedLessons?.length}`,
				);

				if (favoritedLessons && favoritedLessons.length > 0) {
					const favoritedLessonsArray = favoritedLessons.map((dynamoLesson) => {
						const lesson = memoryCache.entries().find(([_key, value]) => {
							const lesson = JSON.parse(value) as Record<string, any>;

							const oldId = (lesson?.lesson?.oldId as string) || '';

							return oldId === dynamoLesson.aula;
						})?.[1];

						if (!lesson) {
							return null;
						}

						return {
							lessonSlug: JSON.parse(lesson).lesson.slug as string,
							userId: newUserId,
						};
					});

					const array = favoritedLessonsArray.filter(
						(element) => element !== null,
					);

					await Promise.all(
						array.map(async (element) =>
							this._model.favoritedLessons.upsert({
								create: element,
								update: element,
								where: {
									userId_lessonSlug: element, // eslint-disable-line @typescript-eslint/naming-convention
								},
							}),
						),
					);
				}

				if (completedLessons && completedLessons.length > 0) {
					const completedLessonsArray = completedLessons.map((dynamoLesson) => {
						const lesson = memoryCache.entries().find(([_key, value]) => {
							const lesson = JSON.parse(value) as Record<string, any>;

							const oldId = (lesson?.lesson?.oldId as string) || '';

							return oldId === dynamoLesson.aula;
						})?.[1];

						if (!lesson) {
							return null;
						}

						return {
							lessonSlug: JSON.parse(lesson).lesson.slug as string,
							userId: newUserId,
						};
					});

					const array = completedLessonsArray.filter(
						(element) => element !== null,
					);

					await Promise.all(
						array.map(async (element) => {
							await this._model.completedLessons.upsert({
								create: element,
								update: element,
								where: {
									lessonSlug_userId: element, // eslint-disable-line @typescript-eslint/naming-convention
								},
							});
						}),
					);
				}
			});

			return {
				data: 'Saved And Favorited Lessons Migrated Successfuly',
				status: 'SUCCESSFUL',
			};
		} catch (error) {
			logger.logError((error as Error).message);

			return {
				data: (error as Error).message,
				status: 'UNKNOWN',
			};
		}
	}

	public async getUsers(): Promise<TServiceReturn<string>> {
		const listUsersCommand = (paginationToken: string | undefined) =>
			new ListUsersCommand({
				Limit: 60,
				PaginationToken: paginationToken ?? undefined,
				UserPoolId: process.env.COGNITO_USER_POOL_ID,
			});

		const addUsersToList = async (paginationToken: string | undefined) => {
			try {
				const result = await this._awsClient.send(
					listUsersCommand(paginationToken),
				);

				if (result.Users) {
					await this.migrateSavedAndFavoritedLessonsForUsers(result.Users);
				}

				if (result.PaginationToken) {
					await addUsersToList(result.PaginationToken);
				}
			} catch (error) {
				logger.logError((error as Error).message);
			}
		};

		await addUsersToList(undefined);

		return {
			data: 'Users fetched successfully',
			status: 'SUCCESSFUL',
		};
	}

	private async getFavoritedLessonsForUser(
		userId: string,
		ddbDocumentClient: DynamoDBDocument,
	): Promise<TServiceReturn<QueryCommandOutput['Items']>> {
		const result = await ddbDocumentClient.query({
			ExpressionAttributeValues: {
				':aluno': userId, // eslint-disable-line @typescript-eslint/naming-convention
			},
			IndexName: 'aluno-index',
			KeyConditionExpression: 'aluno = :aluno',
			TableName: 'yem-prod-aulasFavoritas',
		});

		return {
			data: result.Items ?? [],
			status: 'SUCCESSFUL',
		};
	}

	private async getCompletedLessonsForUser(
		userId: string,
		ddbDocumentClient: DynamoDBDocument,
	): Promise<TServiceReturn<QueryCommandOutput['Items']>> {
		const result = await ddbDocumentClient.query({
			ExpressionAttributeValues: {
				':aluno': userId, // eslint-disable-line @typescript-eslint/naming-convention
			},
			IndexName: 'aluno-index',
			KeyConditionExpression: 'aluno = :aluno',
			TableName: 'yem-prod-aulasAssistidas',
		});

		return {
			data: result.Items?.sort((a, b) => Number(a.data) - Number(b.data)) ?? [],
			status: 'SUCCESSFUL',
		};
	}
}
