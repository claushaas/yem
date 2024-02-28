import {PrismaClient} from '@prisma/client';
import testUserRoles from '../utils/testUserRoles';
import type Role from '../types/Role';
import {type UserRoles} from '../types/User';
import CustomError from '../utils/CustomError';
import {type TypeLesson} from '../types/Lesson';
import Lesson from '../entities/lesson.entity';
import {type TypeUuid} from '../types/UUID';

export default class LessonService {
	private readonly _model: PrismaClient;

	constructor(model: PrismaClient = new PrismaClient()) {
		this._model = model;
	}

	public async create(lessonData: TypeLesson) {
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
							id: undefined,
							tagOption: {
								name: tag[0],
							},
							tagValue: {
								name: tag[1],
							},
						},
						create: {
							tagOption: {
								connectOrCreate: {
									where: {
										id: undefined,
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
										id: undefined,
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

	public async update(id: TypeUuid, lessonData: TypeLesson) {
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
							id: undefined,
							tagOption: {
								name: tag[0],
							},
							tagValue: {
								name: tag[1],
							},
						},
						create: {
							tagOption: {
								connectOrCreate: {
									where: {
										id: undefined,
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
										id: undefined,
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
			status: 'OK',
			data: updatedLesson,
		};
	}
}
