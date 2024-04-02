import {type PrismaClient} from '@prisma/client';
import Fuse, {type IFuseOptions} from 'fuse.js';
import {type TUser} from '../types/user.type.js';
import {CustomError} from '../utils/custom-error.js';
import {
	type TPrismaPayloadCreateLesson, type TLesson, type TPrismaPayloadUpdateLesson, type TPrismaPayloadGetLessonList, type TPrismaPayloadGetLessonById,
} from '../types/lesson.type.js';
import {Lesson} from '../entities/lesson.entity.js';
import {type TUuid} from '../types/uuid.type.js';
import {type TServiceReturn} from '../types/service-return.type.js';
import {type TSearchableEntity} from '../types/searchable.type.js';
import {db} from '../database/db.js';

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
				name: newLesson.name,
				type: newLesson.type,
				description: newLesson.description,
				content: newLesson.content,
				videoSourceUrl: newLesson.videoSourceUrl,
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
				name: lessoToUpdate.name,
				type: lessoToUpdate.type,
				description: lessoToUpdate.description,
				content: lessoToUpdate.content,
				videoSourceUrl: lessoToUpdate.videoSourceUrl,
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

	public async delete(id: TUuid): Promise<TServiceReturn<string>> {
		const deletedLesson = await this._model.lesson.update({
			where: {
				id,
			},
			data: {
				published: false,
			},
		});

		if (!deletedLesson) {
			throw new CustomError('NOT_FOUND', `Lesson with id ${id} not found`);
		}

		return {
			status: 'NO_CONTENT',
			data: 'Lesson unpublished',
		};
	}

	public async getList(moduleId: TUuid, user: TUser | undefined): Promise<TServiceReturn<TPrismaPayloadGetLessonList>> {
		const lessonWhere = {
			modules: {
				some: {
					id: moduleId,
				},
			},
		};

		const lessonSelect = {
			id: true,
			name: true,
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
		};

		if (user?.roles?.includes('admin')) {
			const lessons = await this._model.lesson.findMany({
				where: lessonWhere,
				select: lessonSelect,
			});

			if (!lessons) {
				throw new CustomError('NOT_FOUND', 'No lessons found');
			}

			return {
				status: 'SUCCESSFUL',
				data: lessons,
			};
		}

		const lessons = await this._model.lesson.findMany({
			where: {
				...lessonWhere,
				published: true,
			},
			select: lessonSelect,
		});

		if (!lessons) {
			throw new CustomError('NOT_FOUND', 'No lessons found');
		}

		return {
			status: 'SUCCESSFUL',
			data: lessons,
		};
	}

	public async search(moduleId: TUuid, user: TUser | undefined, term: string): Promise<TServiceReturn<TPrismaPayloadGetLessonList>> {
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

	public async getById(courseId: TUuid, moduleId: TUuid, lessonId: TUuid, user: TUser | undefined): Promise<TServiceReturn<TPrismaPayloadGetLessonById>> {
		const lessonSelect = {
			id: true,
			name: true,
			type: true,
			description: true,
			content: true,
			videoSourceUrl: true,
			duration: true,
			thumbnailUrl: true,
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
			comments: {
				where: {
					published: true,
				},
				select: {
					id: true,
					content: true,
					createdAt: true,
					userId: true,
					published: true,
					responses: {
						select: {
							id: true,
							content: true,
							createdAt: true,
							userId: true,
							published: true,
						},
					},
				},
			},
			lessonProgress: {
				where: {
					userId: user?.id,
				},
			},
			modules: {
				where: {
					id: moduleId,
				},
				select: {
					id: true,
					name: true,
					course: {
						where: {
							id: courseId,
						},
						select: {
							id: true,
							name: true,
							subscriptions: {
								where: {
									userId: user?.id,
									courseId,
									expiresAt: {
										gte: new Date(),
									},
								},
							},
						},
					},
				},
			},
		};

		const lesson = await this._model.lesson.findUnique({
			where: {
				id: lessonId,
			},
			select: lessonSelect,
		});

		if (!lesson) {
			throw new CustomError('NOT_FOUND', 'Lesson not found');
		}

		const hasActiveSubscription = lesson?.modules?.some(
			module => module.course?.some(
				course => course.subscriptions.length > 0,
			),
		);

		if (user?.roles?.includes('admin')) {
			return {
				status: 'SUCCESSFUL',
				data: lesson,
			};
		}

		return {
			status: 'SUCCESSFUL',
			data: {
				...lesson,
				content: hasActiveSubscription ? lesson.content : '',
				videoSourceUrl: hasActiveSubscription ? lesson.videoSourceUrl : '',
			},
		};
	}
}
