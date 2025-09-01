/** biome-ignore-all lint/style/noNonNullAssertion: . */
import type { Prisma, PrismaClient } from '@prisma/client';
import Fuse, { type IFuseOptions } from 'fuse.js';
import { memoryCache } from '~/cache/memory-cache.js';
import type { TCourseDataForCache } from '~/cache/populate-courses-to-cache';
import type { TLessonDataForCache } from '~/cache/populate-lessons-to-cache.js';
import type { TModuleDataFromCache } from '~/types/module.type';
import type { TTag } from '~/types/tag.type.js';
import type { TypeUserSession } from '~/types/user-session.type';
import { logger } from '~/utils/logger.util.js';
import { database } from '../database/database.server';
import { Lesson } from '../entities/lesson.entity.server';
import type {
	TLesson,
	TPrismaPayloadCreateOrUpdateLesson,
	TPrismaPayloadGetCompletedLessons,
	TPrismaPayloadGetFavoritedLessons,
	TPrismaPayloadGetLessonById,
	TPrismaPayloadGetLessonList,
	TPrismaPayloadGetSavedLessons,
} from '../types/lesson.type';
import type { TServiceReturn } from '../types/service-return.type';
import type { TUser } from '../types/user.type';
import { CustomError } from '../utils/custom-error.js';

export class LessonService {
	private static cache: typeof memoryCache;
	private readonly _model: PrismaClient;

	constructor(model: PrismaClient = database) {
		this._model = model;
		LessonService.cache = memoryCache;
	}

	public async create(
		lessonData: TLesson,
	): Promise<TServiceReturn<TPrismaPayloadCreateOrUpdateLesson>> {
		const newLesson = new Lesson(lessonData);

		const createdLesson = await this._model.lesson.create({
			data: {
				content: newLesson.content,
				description: newLesson.description,
				duration: newLesson.duration,
				marketingContent: newLesson.marketingContent,
				marketingVideoUrl: newLesson.marketingVideoUrl,
				modules: {
					create: newLesson.modules!.map((module) => ({
						isPublished: newLesson.isPublished!,
						moduleSlug: module,
						order: newLesson.order!,
						publicationDate: newLesson.publicationDate!,
					})),
				},
				name: newLesson.name,
				oldId: newLesson.oldId,
				slug: newLesson.slug,
				tags: {
					connect: newLesson.tags?.map((tag) => ({
						tag: {
							tagOptionName: tag[0],
							tagValueName: tag[1],
						},
					})),
				},
				thumbnailUrl: newLesson.thumbnailUrl,
				type: newLesson.type,
				videoSourceUrl: newLesson.videoSourceUrl,
			},
		});

		return {
			data: createdLesson,
			status: 'CREATED',
		};
	}

	public async update(
		id: string,
		lessonData: TLesson,
	): Promise<TServiceReturn<TPrismaPayloadCreateOrUpdateLesson>> {
		const lessoToUpdate = new Lesson(lessonData);

		const updatedLesson = await this._model.lesson.update({
			data: {
				content: lessoToUpdate.content,
				description: lessoToUpdate.description,
				duration: lessoToUpdate.duration,
				marketingContent: lessoToUpdate.marketingContent,
				marketingVideoUrl: lessoToUpdate.marketingVideoUrl,
				name: lessoToUpdate.name,
				oldId: lessoToUpdate.oldId,
				slug: lessoToUpdate.slug,
				thumbnailUrl: lessoToUpdate.thumbnailUrl,
				type: lessoToUpdate.type,
				videoSourceUrl: lessoToUpdate.videoSourceUrl,
			},
			where: {
				id,
			},
		});

		if (!updatedLesson) {
			throw new CustomError('NOT_FOUND', `Lesson with id ${id} not found`);
		}

		return {
			data: updatedLesson,
			status: 'SUCCESSFUL',
		};
	}

	public async getAll(
		user: TUser,
	): Promise<TServiceReturn<Array<Prisma.LessonGetPayload<undefined>>>> {
		if (!user.roles?.includes('admin')) {
			throw new CustomError(
				'UNAUTHORIZED',
				'You are not authorized to perform this action',
			);
		}

		const lessons = await this._model.lesson.findMany();

		return {
			data: lessons,
			status: 'SUCCESSFUL',
		};
	}

	public async getList(
		moduleId: string,
		user: TUser | undefined,
	): Promise<TServiceReturn<TPrismaPayloadGetLessonList>> {
		const lessons = await this._model.lesson.findMany({
			select: {
				completedBy: {
					where: {
						userId: user?.id ?? '',
					},
				},
				description: true,
				duration: true,
				favoritedBy: {
					where: {
						userId: user?.id ?? '',
					},
				},
				id: true,
				modules: {
					select: {
						isPublished: true,
						module: {
							select: {
								courses: {
									select: {
										course: {
											select: {
												id: true,
												slug: true,
												subscriptions: {
													where: {
														userId: user?.id ?? '',
													},
												},
											},
										},
									},
									where: {
										isPublished: user?.roles?.includes('admin')
											? undefined
											: true,
										publicationDate: {
											lte: user?.roles?.includes('admin')
												? undefined
												: new Date(),
										},
									},
								},
								id: true,
								slug: true,
							},
						},
						publicationDate: true,
					},
					where: {
						isPublished: user?.roles?.includes('admin') ? undefined : true,
						publicationDate: {
							lte: user?.roles?.includes('admin') ? undefined : new Date(),
						},
					},
				},
				name: true,
				savedBy: {
					where: {
						userId: user?.id ?? '',
					},
				},
				slug: true,
				tags: true,
				thumbnailUrl: true,
				type: true,
			},
			where: {
				modules: {
					some: {
						AND: [
							{
								OR: [
									{ module: { id: moduleId } },
									{ module: { slug: moduleId } },
								],
							},
							{
								publicationDate: {
									lte: user?.roles?.includes('admin') ? undefined : new Date(),
								},
							},
							{
								isPublished: user?.roles?.includes('admin') ? undefined : true,
							},
						],
					},
				},
			},
		});

		if (!lessons) {
			throw new CustomError('NOT_FOUND', 'No lessons found');
		}

		return {
			data: lessons,
			status: 'SUCCESSFUL',
		};
	}

	public async getLessonsWithoutTags(
		user: TUser | undefined,
	): Promise<TServiceReturn<Array<Prisma.LessonGetPayload<undefined>>>> {
		if (!user?.roles?.includes('admin')) {
			throw new CustomError(
				'UNAUTHORIZED',
				'You are not authorized to perform this action',
			);
		}

		const lessons = await this._model.lesson.findMany({
			orderBy: {
				name: 'asc',
			},
			where: {
				modules: {
					some: {
						module: {
							courses: {
								some: {
									courseSlug: 'escola-online',
								},
							},
						},
					},
				},
				tags: {
					none: {},
				},
			},
		});

		if (!lessons) {
			throw new CustomError('NOT_FOUND', 'No lessons found');
		}

		return {
			data: lessons,
			status: 'SUCCESSFUL',
		};
	}

	public async search(
		moduleId: string,
		user: TUser | undefined,
		term: string,
	): Promise<TServiceReturn<TPrismaPayloadGetLessonList>> {
		const { data } = await this.getList(moduleId, user);

		const searchOptions: IFuseOptions<TPrismaPayloadGetLessonList[0]> = {
			includeScore: true,
			isCaseSensitive: false,
			keys: ['name', 'description'],
			minMatchCharLength: 1,
			shouldSort: true,
			threshold: 0.3,
		};

		const fuse = new Fuse(data, searchOptions);

		const searchResults = fuse.search(term).map((result) => result.item);

		return {
			data: searchResults,
			status: 'SUCCESSFUL',
		};
	}

	public async getBySlug(
		courseSlug: string,
		moduleSlug: string,
		lessonSlug: string,
		user: TUser | undefined,
	): Promise<TServiceReturn<TPrismaPayloadGetLessonById | undefined>> {
		try {
			const lessonToModule = await this._model.lessonToModule.findUnique({
				include: {
					lesson: {
						include: {
							comments: {
								include: {
									responses: {
										orderBy: {
											createdAt: 'desc',
										},
										where: {
											OR: [
												{
													published: user?.roles?.includes('admin')
														? undefined
														: true,
												},
												{ userId: user?.id },
											],
										},
									},
								},
								orderBy: {
									createdAt: 'desc',
								},
								where: {
									OR: [
										{
											published: user?.roles?.includes('admin')
												? undefined
												: true,
										},
										{ userId: user?.id },
									],
								},
							},
							completedBy: {
								where: {
									userId: user?.id ?? '',
								},
							},
							favoritedBy: {
								where: {
									userId: user?.id ?? '',
								},
							},
							savedBy: {
								where: {
									userId: user?.id ?? '',
								},
							},
							tags: {
								where: {
									published: user?.roles?.includes('admin') ? undefined : true,
								},
							},
						},
					},
					module: {
						select: {
							courses: {
								select: {
									course: {
										select: {
											delegateAuthTo: {
												select: {
													id: true,
													subscriptions: {
														where: {
															userId: user?.id ?? '',
														},
													},
												},
											},
										},
									},
								},
								where: {
									courseSlug,
									moduleSlug,
								},
							},
						},
					},
				},
				where: {
					isPublished: user?.roles?.includes('admin') ? undefined : true,
					lessonToModule: {
						lessonSlug,
						moduleSlug,
					},
					publicationDate: {
						lte: user?.roles?.includes('admin') ? undefined : new Date(),
					},
				},
			});

			if (!lessonToModule) {
				throw new CustomError('NOT_FOUND', 'Lesson not found');
			}

			const hasActiveSubscription = this._hasActiveSubscription(
				user,
				lessonToModule,
			);

			const returnableLesson = {
				...lessonToModule,
				lesson: {
					...lessonToModule.lesson,
					content: hasActiveSubscription
						? lessonToModule.lesson.content
						: lessonToModule.lesson.marketingContent,
					videoSourceUrl: hasActiveSubscription
						? lessonToModule.lesson.videoSourceUrl
						: lessonToModule.lesson.marketingVideoUrl,
				},
			};

			return {
				data: returnableLesson,
				status: 'SUCCESSFUL',
			};
		} catch (error) {
			logger.logError(
				`Error getting lesson by id: ${(error as Error).message}`,
			);
			return {
				data: undefined,
				status: 'UNKNOWN',
			};
		}
	}

	public async getByLessonSlugOnly(
		lessonSlug: string,
		user: TUser | undefined,
	): Promise<TServiceReturn<Prisma.LessonGetPayload<undefined>>> {
		if (!user?.roles?.includes('admin')) {
			throw new CustomError(
				'UNAUTHORIZED',
				'You are not authorized to perform this action',
			);
		}

		const lesson = await this._model.lesson.findUnique({
			where: {
				slug: lessonSlug,
			},
		});

		if (!lesson) {
			throw new CustomError('NOT_FOUND', 'Lesson not found');
		}

		return {
			data: lesson,
			status: 'SUCCESSFUL',
		};
	}

	public getBySlugFromCache(
		courseSlug: string,
		moduleSlug: string,
		lessonSlug: string,
		user: TUser | undefined,
	): TServiceReturn<TLessonDataForCache | undefined> {
		try {
			const lesson = JSON.parse(
				LessonService.cache.get(`${moduleSlug}:${lessonSlug}`) ?? '{}',
			) as TLessonDataForCache;

			if (!lesson) {
				logger.logError(
					`Lesson ${lessonSlug} for ${moduleSlug} not found in cache`,
				);
				throw new CustomError('NOT_FOUND', 'Lesson not found');
			}

			const isAdmin = user?.roles?.includes('admin');

			const hasActiveSubscription =
				isAdmin ||
				lesson.delegateAuthTo.some((courseSlug) => {
					const subscription = LessonService.cache.get(
						`${courseSlug}:${user?.id}`,
					);

					if (!subscription) {
						return false;
					}

					const expirationDate = (
						JSON.parse(
							subscription,
						) as Prisma.UserSubscriptionsGetPayload<undefined>
					).expiresAt;

					return new Date(expirationDate) >= new Date();
				});

			if (!hasActiveSubscription) {
				const module = JSON.parse(
					LessonService.cache.get(`${courseSlug}:${moduleSlug}`) ?? '{}',
				) as TModuleDataFromCache;
				const course = JSON.parse(
					LessonService.cache.get(`course:${courseSlug}`) ?? '{}',
				) as TCourseDataForCache;

				lesson.lesson.content =
					lesson.lesson.marketingContent ||
					module.module.marketingContent ||
					course.marketingContent;
				lesson.lesson.videoSourceUrl =
					lesson.lesson.marketingVideoUrl ||
					module.module.marketingVideoUrl ||
					course.marketingVideoUrl;
			}

			return {
				data: lesson,
				status: 'SUCCESSFUL',
			};
		} catch (error) {
			logger.logError(
				`Error getting lesson by id: ${(error as Error).message}`,
			);
			throw new CustomError(
				'UNKNOWN',
				`Error getting lesson by id: ${(error as Error).message}`,
			);
		}
	}

	// eslint-disable-next-line max-params
	public async associateLessonWithModule(
		lessonSlug: string,
		moduleSlug: string,
		publicationDate: Date,
		isPublished: boolean,
		order: number,
	): Promise<TServiceReturn<string>> {
		try {
			await this._model.lessonToModule.create({
				data: {
					isPublished,
					lessonSlug,
					moduleSlug,
					order,
					publicationDate,
				},
			});

			return {
				data: 'Lesson associated with module',
				status: 'SUCCESSFUL',
			};
		} catch (error) {
			throw new CustomError(
				'UNKNOWN',
				`Error associating lesson with module: ${(error as Error).message}`,
			);
		}
	}

	public async addTagsToLesson(
		lessonId: string,
		tags: TTag[],
	): Promise<TServiceReturn<string>> {
		try {
			const lesson = await this._model.lesson.update({
				data: {
					tags: {
						connect: tags.map((tag) => ({
							tag: {
								tagOptionName: tag[0],
								tagValueName: tag[1],
							},
						})),
					},
				},
				where: {
					id: lessonId,
				},
			});

			if (!lesson) {
				throw new CustomError('NOT_FOUND', 'Lesson not found');
			}

			return {
				data: 'Tags added to lesson',
				status: 'SUCCESSFUL',
			};
		} catch (error) {
			throw new CustomError(
				'UNKNOWN',
				`Error adding tags to lesson: ${(error as Error).message}`,
			);
		}
	}

	public async removeTagFromLesson(
		lessonId: string,
		tagId: string,
	): Promise<TServiceReturn<string>> {
		try {
			const lesson = await this._model.lesson.update({
				data: {
					tags: {
						disconnect: {
							id: tagId,
						},
					},
				},
				where: {
					id: lessonId,
				},
			});

			if (!lesson) {
				throw new CustomError('NOT_FOUND', 'Lesson not found');
			}

			return {
				data: 'Tag removed from lesson',
				status: 'SUCCESSFUL',
			};
		} catch (error) {
			throw new CustomError(
				'UNKNOWN',
				`Error removing tag from lesson: ${(error as Error).message}`,
			);
		}
	}

	public async getCompletedLessonsByUser(
		user: TypeUserSession,
	): Promise<TServiceReturn<TPrismaPayloadGetCompletedLessons>> {
		const completedLessons = await this._model.completedLessons.findMany({
			orderBy: {
				updatedAt: 'desc',
			},
			select: {
				id: true,
				lesson: {
					select: {
						description: true,
						favoritedBy: {
							where: {
								isFavorited: true,
								userId: user.id,
							},
						},
						modules: {
							select: {
								module: {
									select: {
										courses: {
											select: {
												course: {
													select: {
														delegateAuthTo: {
															select: {
																subscriptions: {
																	where: {
																		expiresAt: {
																			gte: new Date(),
																		},
																		userId: user.id,
																	},
																},
															},
														},
														slug: true,
													},
												},
											},
										},
										slug: true,
									},
								},
							},
						},
						name: true,
						savedBy: {
							where: {
								isSaved: true,
								userId: user.id,
							},
						},
						slug: true,
						thumbnailUrl: true,
					},
				},
				lessonSlug: true,
				updatedAt: true,
				userId: true,
			},
			where: {
				isCompleted: true,
				userId: user.id,
			},
		});

		const completedLessonsWithLinks = completedLessons.map((lesson) => ({
			...lesson,
			link: `/courses/${lesson.lesson.modules[0].module.courses[0].course.slug}/${lesson.lesson.modules[0].module.slug}/${lesson.lesson.slug}`,
		}));

		return {
			data: completedLessonsWithLinks,
			status: 'SUCCESSFUL',
		};
	}

	public async getSavedLessonsByUser(
		user: TypeUserSession,
	): Promise<TServiceReturn<TPrismaPayloadGetSavedLessons>> {
		const savedLessons = await this._model.savedLessons.findMany({
			orderBy: {
				updatedAt: 'desc',
			},
			select: {
				id: true,
				lesson: {
					select: {
						completedBy: {
							where: {
								isCompleted: true,
								userId: user.id,
							},
						},
						description: true,
						favoritedBy: {
							where: {
								isFavorited: true,
								userId: user.id,
							},
						},
						modules: {
							select: {
								module: {
									select: {
										courses: {
											select: {
												course: {
													select: {
														delegateAuthTo: {
															select: {
																subscriptions: {
																	where: {
																		expiresAt: {
																			gte: new Date(),
																		},
																		userId: user.id,
																	},
																},
															},
														},
														slug: true,
													},
												},
											},
										},
										slug: true,
									},
								},
							},
						},
						name: true,
						slug: true,
						thumbnailUrl: true,
					},
				},
				lessonSlug: true,
				updatedAt: true,
				userId: true,
			},
			where: {
				isSaved: true,
				userId: user.id,
			},
		});

		const savedLessonsWithLinks = savedLessons.map((lesson) => ({
			...lesson,
			link: `/courses/${lesson.lesson.modules[0].module.courses[0].course.slug}/${lesson.lesson.modules[0].module.slug}/${lesson.lesson.slug}`,
		}));

		return {
			data: savedLessonsWithLinks,
			status: 'SUCCESSFUL',
		};
	}

	public async getFavoritedLessonsByUser(
		user: TypeUserSession,
	): Promise<TServiceReturn<TPrismaPayloadGetFavoritedLessons>> {
		const favoritedLessons = await this._model.favoritedLessons.findMany({
			orderBy: {
				updatedAt: 'desc',
			},
			select: {
				id: true,
				lesson: {
					select: {
						completedBy: {
							where: {
								isCompleted: true,
								userId: user.id,
							},
						},
						description: true,
						modules: {
							select: {
								module: {
									select: {
										courses: {
											select: {
												course: {
													select: {
														delegateAuthTo: {
															select: {
																subscriptions: {
																	where: {
																		expiresAt: {
																			gte: new Date(),
																		},
																		userId: user.id,
																	},
																},
															},
														},
														slug: true,
													},
												},
											},
										},
										slug: true,
									},
								},
							},
						},
						name: true,
						savedBy: {
							where: {
								isSaved: true,
								userId: user.id,
							},
						},
						slug: true,
						thumbnailUrl: true,
					},
				},
				lessonSlug: true,
				updatedAt: true,
				userId: true,
			},
			where: {
				isFavorited: true,
				userId: user.id,
			},
		});

		const favoritedLessonsWithLinks = favoritedLessons.map((lesson) => ({
			...lesson,
			link: `/courses/${lesson.lesson.modules[0].module.courses[0].course.slug}/${lesson.lesson.modules[0].module.slug}/${lesson.lesson.slug}`,
		}));

		return {
			data: favoritedLessonsWithLinks,
			status: 'SUCCESSFUL',
		};
	}

	private _hasActiveSubscription(
		user: TUser | undefined,
		lessonToModule: TPrismaPayloadGetLessonById,
	): boolean {
		const isAdmin = user?.roles?.includes('admin');
		const hasActiveSubscription = lessonToModule.module.courses.some((course) =>
			course.course.delegateAuthTo.some((course) =>
				course.subscriptions.some(
					(subscription) => subscription.expiresAt >= new Date(),
				),
			),
		);

		return isAdmin || hasActiveSubscription;
	}
}
