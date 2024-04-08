import {type PrismaClient} from '@prisma/client';
import {type TUser, type TUserRoles} from '../types/user.type.js';
import {Course} from '../entities/course.entity.server.js';
import {
	type TPrismaPayloadGetCourseById, type TCourse, type TPrismaPayloadGetAllCourses, type TPrismaPayloadCreateCourse, type TPrismaPayloadUpdateCourse,
} from '../types/course.type.js';
import {CustomError} from '../utils/custom-error.js';
import {type TServiceReturn} from '../types/service-return.type.js';
import {db} from '../database/db.js';
import {logger} from '~/utils/logger.util.js';

export class CourseService {
	private readonly _model: PrismaClient;

	constructor(model: PrismaClient = db) {
		this._model = model;
	}

	public async create(courseData: TCourse): Promise<TServiceReturn<TPrismaPayloadCreateCourse>> {
		const newCourse = new Course(courseData);

		const createdCourse = await this._model.course.create({
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
			},
			data: {
				name: newCourse.name,
				slug: newCourse.slug,
				description: newCourse.description,
				content: newCourse.content,
				videoSourceUrl: newCourse.videoSourceUrl,
				thumbnailUrl: newCourse.thumbnailUrl,
				publicationDate: newCourse.publicationDate,
				published: newCourse.published,
				isSelling: newCourse.isSelling,
				tags: {
					connectOrCreate: newCourse.tags?.map(tag => ({
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
			data: createdCourse,
		};
	}

	public async getAll(userRoles: TUserRoles = []): Promise<TServiceReturn<TPrismaPayloadGetAllCourses>> {
		const select = {
			id: true,
			name: true,
			slug: true,
			description: true,
			thumbnailUrl: true,
			publicationDate: true,
			published: true,
		};

		if (userRoles.includes('admin')) {
			const courses = await this._model.course.findMany({
				select,
			});

			return {
				status: 'SUCCESSFUL',
				data: courses,
			};
		}

		const coursesForStudents = await this._model.course.findMany({
			select,
			where: {
				published: true,
			},
		});

		return {
			status: 'SUCCESSFUL',
			data: coursesForStudents,
		};
	}

	public async getBySlug(slug: string, user: TUser): Promise<TServiceReturn<TPrismaPayloadGetCourseById | undefined>> {
		try {
			const course = await this._model.course.findUnique({
				where: {
					slug,
					published: user.roles?.includes('admin') ? undefined : true,
				},
				include: {
					modules: {
						where: {
							published: user.roles?.includes('admin') ? undefined : true,
						},
						select: {
							id: true,
							name: true,
							slug: true,
							description: true,
							thumbnailUrl: true,
							published: true,
							publicationDate: true,
						},
					},
					comments: {
						where: {
							published: user.roles?.includes('admin') ? undefined : true,
						},
						select: {
							id: true,
							content: true,
							createdAt: true,
							userId: true,
							responses: {
								where: {
									published: user.roles?.includes('admin') ? undefined : true,
								},
								select: {
									id: true,
									content: true,
									createdAt: true,
									userId: true,
								},
							},
						},
					},
					subscriptions: {
						where: {
							userId: user.id,
							expiresAt: {
								lte: new Date(),
							},
						},
					},
				},
			});

			if (!course) {
				throw new CustomError('NOT_FOUND', 'Course not found');
			}

			const hasActiveSubscription = user.roles?.includes('admin') ?? course.subscriptions.some(subscription => subscription.expiresAt > new Date());

			const returnableCourse = {
				...course,
				content: hasActiveSubscription ? course?.content : '',
				videoSourceUrl: hasActiveSubscription ? course?.videoSourceUrl : '',
			};

			return {
				status: 'SUCCESSFUL',
				data: returnableCourse,
			};
		} catch (error) {
			logger.logError(`Error getting course by slug: ${(error as Error).message}`);
			return {
				status: 'UNKNOWN',
				data: undefined,
			};
		}
	}

	public async update(id: string, courseData: TCourse): Promise<TServiceReturn<TPrismaPayloadUpdateCourse>> {
		const courseToUpdate = new Course(courseData);

		const updatedCourse = await this._model.course.update({
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
			},
			where: {
				id,
			},
			data: {
				name: courseToUpdate.name,
				slug: courseToUpdate.slug,
				description: courseToUpdate.description,
				content: courseToUpdate.content,
				videoSourceUrl: courseToUpdate.videoSourceUrl,
				thumbnailUrl: courseToUpdate.thumbnailUrl,
				publicationDate: courseToUpdate.publicationDate,
				published: courseToUpdate.published,
				isSelling: courseToUpdate.isSelling,
				tags: {
					connectOrCreate: courseToUpdate.tags?.map(tag => ({
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

		if (!updatedCourse) {
			throw new CustomError('NOT_FOUND', `Course with id ${id} not found`);
		}

		return {
			status: 'SUCCESSFUL',
			data: updatedCourse,
		};
	}
}