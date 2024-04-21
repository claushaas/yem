/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import {type PrismaClient} from '@prisma/client';
import Fuse, {type IFuseOptions} from 'fuse.js';
import {type TUser} from '../types/user.type.js';
import {CustomError} from '../utils/custom-error.js';
import {
	type TPrismaPayloadCreateOrUpdateLesson,
	type TLesson,
	type TPrismaPayloadGetLessonList,
	type TPrismaPayloadGetLessonById,
} from '../types/lesson.type.js';
import {Lesson} from '../entities/lesson.entity.server.js';
import {type TServiceReturn} from '../types/service-return.type.js';
import {db} from '../database/db.js';
import {logger} from '~/utils/logger.util.js';

export class LessonService {
	private readonly _model: PrismaClient;

	constructor(model: PrismaClient = db) {
		this._model = model;
	}

	public async create(lessonData: TLesson): Promise<TServiceReturn<TPrismaPayloadCreateOrUpdateLesson>> {
		const newLesson = new Lesson(lessonData);

		const createdLesson = await this._model.lesson.create({
			data: {
				oldId: newLesson.oldId,
				name: newLesson.name,
				slug: newLesson.slug,
				type: newLesson.type,
				description: newLesson.description,
				content: newLesson.content,
				marketingContent: newLesson.marketingContent,
				videoSourceUrl: newLesson.videoSourceUrl,
				marketingVideoUrl: newLesson.marketingVideoUrl,
				duration: newLesson.duration,
				thumbnailUrl: newLesson.thumbnailUrl,
				modules: {
					create: newLesson.modules.map(module => ({
						moduleId: module,
						order: newLesson.order,
						isPublished: newLesson.isPublished,
						publicationDate: newLesson.publicationDate,
					})),
				},
				tags: {
					connect: newLesson.tags?.map(tag => ({
						tag: {
							tagOptionName: tag[0],
							tagValueName: tag[1],
						},
					})),
				},
			},
		});

		return {
			status: 'CREATED',
			data: createdLesson,
		};
	}

	public async update(id: string, lessonData: TLesson): Promise<TServiceReturn<TPrismaPayloadCreateOrUpdateLesson>> {
		const lessoToUpdate = new Lesson(lessonData);

		const updatedLesson = await this._model.lesson.update({
			where: {
				id,
			},
			data: {
				oldId: lessoToUpdate.oldId,
				name: lessoToUpdate.name,
				slug: lessoToUpdate.slug,
				type: lessoToUpdate.type,
				description: lessoToUpdate.description,
				content: lessoToUpdate.content,
				marketingContent: lessoToUpdate.marketingContent,
				videoSourceUrl: lessoToUpdate.videoSourceUrl,
				marketingVideoUrl: lessoToUpdate.marketingVideoUrl,
				duration: lessoToUpdate.duration,
				thumbnailUrl: lessoToUpdate.thumbnailUrl,
			},
		});

		if (!updatedLesson) {
			throw new CustomError('NOT_FOUND', `Lesson with id ${id} not found`);
		}

		return {
			status: 'SUCCESSFUL',
			data: updatedLesson,
		};
	}

	public async getList(moduleId: string, user: TUser | undefined): Promise<TServiceReturn<TPrismaPayloadGetLessonList>> {
		const lessons = await this._model.lesson.findMany({
			where: {
				modules: {
					some: {
						AND: [
							{OR: [{module: {id: moduleId}},	{module: {slug: moduleId}}]},
							{publicationDate: {lte: user?.roles?.includes('admin') ? undefined : new Date()}},
							{isPublished: user?.roles?.includes('admin') ? undefined : true},
						],
					},
				},
			},
			select: {
				id: true,
				name: true,
				slug: true,
				type: true,
				description: true,
				thumbnailUrl: true,
				duration: true,
				modules: {
					where: {
						isPublished: user?.roles?.includes('admin') ? undefined : true,
						publicationDate: {
							lte: user?.roles?.includes('admin') ? undefined : new Date(),
						},
					},
					select: {
						isPublished: true,
						publicationDate: true,
						module: {
							select: {
								id: true,
								slug: true,
								courses: {
									where: {
										isPublished: user?.roles?.includes('admin') ? undefined : true,
										publicationDate: {
											lte: user?.roles?.includes('admin') ? undefined : new Date(),
										},
									},
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
								},
							},
						},
					},
				},
				tags: true,
				completedBy: {
					where: {
						userId: user?.id ?? '',
					},
				},
				FavoritedBy: {
					where: {
						userId: user?.id ?? '',
					},
				},
				SavedBy: {
					where: {
						userId: user?.id ?? '',
					},
				},
			},
		});

		if (!lessons) {
			throw new CustomError('NOT_FOUND', 'No lessons found');
		}

		return {
			status: 'SUCCESSFUL',
			data: lessons,
		};
	}

	public async search(moduleId: string, user: TUser | undefined, term: string): Promise<TServiceReturn<TPrismaPayloadGetLessonList>> {
		const {data} = await this.getList(moduleId, user);

		const searchOptions: IFuseOptions<TPrismaPayloadGetLessonList[0]> = {
			includeScore: true,
			shouldSort: true,
			isCaseSensitive: false,
			threshold: 0.3,
			minMatchCharLength: 1,
			keys: ['name', 'description'],
		};

		const fuse = new Fuse(data, searchOptions);

		const searchResults = fuse.search(term).map(result => result.item);

		return {
			status: 'SUCCESSFUL',
			data: searchResults,
		};
	}

	public async getById(courseId: string, moduleId: string, lessonId: string, user: TUser | undefined): Promise<TServiceReturn<TPrismaPayloadGetLessonById | undefined>> {
		try {
			const lessonToModule = await this._model.lessonToModule.findUnique({
				where: {
					isPublished: user?.roles?.includes('admin') ? undefined : true,
					publicationDate: {
						lte: user?.roles?.includes('admin') ? undefined : new Date(),
					},
					lessonToModule: {
						lessonId,
						moduleId,
					},
				},
				include: {
					lesson: {
						include: {
							tags: {
								where: {
									published: user?.roles?.includes('admin') ? undefined : true,
								},
							},
							comments: {
								where: {
									OR: [
										{published: user?.roles?.includes('admin') ? undefined : true},
										{userId: user?.id},
									],
								},
								orderBy: {
									createdAt: 'desc',
								},
								include: {
									responses: {
										where: {
											OR: [
												{published: user?.roles?.includes('admin') ? undefined : true},
												{userId: user?.id},
											],
										},
										orderBy: {
											createdAt: 'desc',
										},
									},
								},
							},
							completedBy: {
								where: {
									userId: user?.id ?? '',
								},
							},
							SavedBy: {
								where: {
									userId: user?.id ?? '',
								},
							},
							FavoritedBy: {
								where: {
									userId: user?.id ?? '',
								},
							},
							modules: {
								select: {
									module: {
										select: {
											courses: {
												where: {
													courseId,
												},
												select: {
													course: {
														select: {
															delegateAuthTo: {
																select: {
																	id: true,
																	subscriptions: {
																		where: {
																			courseId,
																			userId: user?.id ?? '',
																		},
																	},
																},
															},
														},
													},
												},
											},
										},
									},
								},
							},
						},
					},
				},
			});

			if (!lessonToModule) {
				throw new CustomError('NOT_FOUND', 'Lesson not found');
			}

			const hasActiveSubscription = this._hasActiveSubscription(user, lessonToModule);

			const returnableLesson = {
				...lessonToModule,
				lesson: {
					...lessonToModule.lesson,
					content: hasActiveSubscription ? lessonToModule.lesson.content : lessonToModule.lesson.marketingContent,
					videoSourceUrl: hasActiveSubscription ? lessonToModule.lesson.videoSourceUrl : lessonToModule.lesson.marketingVideoUrl,
				},
			};

			return {
				status: 'SUCCESSFUL',
				data: returnableLesson as TPrismaPayloadGetLessonById,
			};
		} catch (error) {
			logger.logError(`Error getting lesson by id: ${(error as Error).message}`);
			return {
				status: 'UNKNOWN',
				data: undefined,
			};
		}
	}

	private _hasActiveSubscription(user: TUser | undefined, lessonToModule: TPrismaPayloadGetLessonById): boolean {
		const isAdmin = user?.roles?.includes('admin');
		const hasActiveSubscription = lessonToModule.lesson.modules.some(
			lessonToCourse => lessonToCourse.module.courses.some(
				moduleToCourse => moduleToCourse.course.delegateAuthTo.some(
					course => course.subscriptions.some(
						subscription => subscription.expiresAt >= new Date(),
					),
				),
			),
		);

		return isAdmin || hasActiveSubscription;
	}
}
