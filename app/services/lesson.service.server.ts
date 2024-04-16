import {type PrismaClient} from '@prisma/client';
import Fuse, {type IFuseOptions} from 'fuse.js';
import {type TUser} from '../types/user.type.js';
import {CustomError} from '../utils/custom-error.js';
import {
	type TPrismaPayloadCreateLesson,
	type TLesson,
	type TPrismaPayloadUpdateLesson,
	type TPrismaPayloadGetLessonList,
	type TPrismaPayloadGetLessonById,
} from '../types/lesson.type.js';
import {Lesson} from '../entities/lesson.entity.server.js';
import {type TUuid} from '../types/uuid.type.js';
import {type TServiceReturn} from '../types/service-return.type.js';
import {type TSearchableEntity} from '../types/searchable.type.js';
import {db} from '../database/db.js';
import {logger} from '~/utils/logger.util.js';

export class LessonService {
	private readonly _model: PrismaClient;

	constructor(model: PrismaClient = db) {
		this._model = model;
	}

	public async create(lessonData: TLesson): Promise<TServiceReturn<TPrismaPayloadCreateLesson>> {
		const newLesson = new Lesson(lessonData);

		const createdLesson = await this._model.lesson.create({
			include: {
				modules: true,
				tags: {
					include: {
						tagOption: {
							select: {
								name: true,
							},
						},
						tagValue: {
							select: {
								name: true,
							},
						},
					},
				},
			},
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
				publicationDate: newLesson.publicationDate,
				published: newLesson.published,
				modules: {
					connect: newLesson.modules.map(module => ({id: module})),
				},
				tags: {
					connectOrCreate: newLesson.tags?.map(tag => ({
						where: {
							tag: {
								tagOptionName: tag[0],
								tagValueName: tag[1],
							},
						},
						create: {
							tagOption: {
								connectOrCreate: {
									where: {
										name: tag[0],
									},
									create: {
										name: tag[0],
									},
								},
							},
							tagValue: {
								connectOrCreate: {
									where: {
										name: tag[1],
									},
									create: {
										name: tag[1],
									},
								},
							},
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

	public async update(id: TUuid, lessonData: TLesson): Promise<TServiceReturn<TPrismaPayloadUpdateLesson>> {
		const lessoToUpdate = new Lesson(lessonData);

		const updatedLesson = await this._model.lesson.update({
			where: {
				id,
			},
			include: {
				modules: true,
				tags: {
					include: {
						tagOption: {
							select: {
								name: true,
							},
						},
						tagValue: {
							select: {
								name: true,
							},
						},
					},
				},
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
				publicationDate: lessoToUpdate.publicationDate,
				published: lessoToUpdate.published,
				modules: {
					connect: lessoToUpdate.modules.map(module => ({id: module})),
				},
				tags: {
					connectOrCreate: lessoToUpdate.tags?.map(tag => ({
						where: {
							tag: {
								tagOptionName: tag[0],
								tagValueName: tag[1],
							},
						},
						create: {
							tagOption: {
								connectOrCreate: {
									where: {
										name: tag[0],
									},
									create: {
										name: tag[0],
									},
								},
							},
							tagValue: {
								connectOrCreate: {
									where: {
										name: tag[1],
									},
									create: {
										name: tag[1],
									},
								},
							},
						},
					})),
				},
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
						OR: [
							{id: moduleId},
							{slug: moduleId},
						],
					},
				},
				published: user?.roles?.includes('admin') ? undefined : true,
				publicationDate: {
					lte: user?.roles?.includes('admin') ? undefined : new Date(),
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
				publicationDate: true,
				published: true,
				tags: {
					include: {
						tagOption: {
							select: {
								name: true,
							},
						},
						tagValue: {
							select: {
								name: true,
							},
						},
					},
				},
				lessonProgress: {
					where: {
						userId: user?.id,
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

		const searchOptions: IFuseOptions<TSearchableEntity> = {
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

	public async getBySlug(courseSlug: string, moduleSlug: string, lessonSlug: string, user: TUser | undefined): Promise<TServiceReturn<TPrismaPayloadGetLessonById | undefined>> {
		try {
			const lesson = await this._model.lesson.findUnique({
				where: {
					published: user?.roles?.includes('admin') ? undefined : true,
					publicationDate: {
						lte: user?.roles?.includes('admin') ? undefined : new Date(),
					},
					slug: lessonSlug,
					modules: {
						some: {
							slug: moduleSlug,
						},
					},
				},
				include: {
					tags: {
						include: {
							tagOption: {
								select: {
									name: true,
								},
							},
							tagValue: {
								select: {
									name: true,
								},
							},
						},
					},
					comments: {
						where: {
							published: user?.roles?.includes('admin') ? undefined : true,
						},
						include: {
							responses: {
								where: {
									published: user?.roles?.includes('admin') ? undefined : true,
								},
							},
						},
					},
					lessonProgress: {
						where: {
							userId: user?.id ?? '',
						},
					},
					modules: {
						where: {
							published: user?.roles?.includes('admin') ? undefined : true,
							slug: moduleSlug,
						},
						select: {
							id: true,
							name: true,
							slug: true,
							course: {
								where: {
									published: user?.roles?.includes('admin') ? undefined : true,
									slug: courseSlug,
								},
								select: {
									id: true,
									name: true,
									slug: true,
									delegateAuthTo: {
										select: {
											id: true,
											name: true,
											slug: true,
											subscriptions: {
												where: {
													userId: user?.id ?? '',
													expiresAt: {
														gte: new Date(),
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

			if (!lesson) {
				throw new CustomError('NOT_FOUND', 'Lesson not found');
			}

			const hasActiveSubscription = user?.roles?.includes('admin') || lesson?.modules?.some( // eslint-disable-line @typescript-eslint/prefer-nullish-coalescing
				module => module.course?.some(
					course => course.delegateAuthTo?.some(
						course => course.subscriptions.length > 0,
					),
				),
			);

			return {
				status: 'SUCCESSFUL',
				data: {
					...lesson,
					content: hasActiveSubscription ? lesson.content : '',
					videoSourceUrl: hasActiveSubscription ? lesson.videoSourceUrl : '',
				},
			};
		} catch (error) {
			logger.logError(`Error getting lesson by slug: ${(error as Error).message}`);
			return {
				status: 'UNKNOWN',
				data: undefined,
			};
		}
	}
}
