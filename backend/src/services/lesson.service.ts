import {PrismaClient} from '@prisma/client';
import {type TypeUser} from '../types/User.js';
import CustomError from '../utils/CustomError.js';
import {type TypeLesson} from '../types/Lesson.js';
import Lesson from '../entities/lesson.entity.js';
import {type TypeUuid} from '../types/UUID.js';
import {type TypeServiceReturn} from '../types/ServiceReturn.js';

export default class LessonService {
	private readonly _model: PrismaClient;

	constructor(model: PrismaClient = new PrismaClient()) {
		this._model = model;
	}

	public async create(lessonData: TypeLesson): Promise<TypeServiceReturn<unknown>> {
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

	public async update(id: TypeUuid, lessonData: TypeLesson): Promise<TypeServiceReturn<unknown>> {
		const newLesson = new Lesson(lessonData);

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
				name: newLesson.name,
				type: newLesson.type,
				description: newLesson.description,
				content: newLesson.content,
				videoSourceUrl: newLesson.videoSourceUrl,
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

		if (!updatedLesson) {
			throw new CustomError('NOT_FOUND', `Lesson with id ${id} not found`);
		}

		return {
			status: 'SUCCESSFUL',
			data: updatedLesson,
		};
	}

	public async delete(id: TypeUuid): Promise<TypeServiceReturn<unknown>> {
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
			data: null,
		};
	}

	public async getList(moduleId: TypeUuid, user: TypeUser | undefined): Promise<TypeServiceReturn<unknown>> {
		const lessonWhere = {
			modules: {
				some: {
					id: moduleId,
				},
			},
		};

		const lessonSelectWithoutUserId = {
			id: true,
			name: true,
			type: true,
			description: true,
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
		};

		const lessonSelectWithUserId = {
			...lessonSelectWithoutUserId,
			lessonProgress: {
				where: {
					userId: user?.id,
				},
			},
		};

		if (user?.roles?.includes('admin')) {
			const lessons = await this._model.lesson.findMany({
				where: lessonWhere,
				select: lessonSelectWithUserId,
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
			select: user ? lessonSelectWithUserId : lessonSelectWithoutUserId,
		});

		if (!lessons) {
			throw new CustomError('NOT_FOUND', 'No lessons found');
		}

		return {
			status: 'SUCCESSFUL',
			data: lessons,
		};
	}

	public async getById(courseId: TypeUuid, lessonId: TypeUuid, user: TypeUser | undefined): Promise<TypeServiceReturn<unknown>> {
		const course = await this._model.course.findUnique({
			where: {
				id: courseId,
			},
			select: {
				id: false,
				name: false,
				description: false,
				content: false,
				videoSourceUrl: false,
				thumbnailUrl: false,
				createdAt: false,
				updatedAt: false,
				publicationDate: false,
				published: false,
				modules: false,
				comments: false,
				tags: false,
				roles: {
					select: {
						name: true,
					},
				},
				subscriptions: {
					where: {
						userId: user?.id,
						courseId,
					},
				},
			},
		});

		const lessonWhere = {
			id: lessonId,
		};

		const hasActiveSubscription = course?.subscriptions.some(subscription => subscription.expiresAt > new Date());

		const lessonSelectWithoutUserId = {
			id: true,
			name: true,
			type: true,
			description: true,
			content: Boolean(hasActiveSubscription),
			videoSourceUrl: Boolean(hasActiveSubscription),
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
					published: user ? true : undefined,
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
		};

		const lessonSelectWithUserId = {
			...lessonSelectWithoutUserId,
			lessonProgress: {
				where: {
					userId: user?.id,
				},
			},
		};

		if (user?.roles?.includes('admin')) {
			const lesson = await this._model.lesson.findUnique({
				where: lessonWhere,
				select: {
					...lessonSelectWithUserId,
					content: true,
					videoSourceUrl: true,
				},
			});

			if (!lesson) {
				throw new CustomError('NOT_FOUND', 'Lesson not found');
			}

			return {
				status: 'SUCCESSFUL',
				data: lesson,
			};
		}

		const lesson = await this._model.lesson.findUnique({
			where: {
				...lessonWhere,
				published: true,
			},
			select: user ? lessonSelectWithUserId : lessonSelectWithoutUserId,
		});

		if (!lesson) {
			throw new CustomError('NOT_FOUND', 'Lesson not found');
		}

		return {
			status: 'SUCCESSFUL',
			data: lesson,
		};
	}
}
