import {type PrismaClient} from '@prisma/client';
import {type TUser, type TUserRoles} from '../types/user.type.js';
import {Course} from '../entities/course.entity.server.js';
import {
	type TPrismaPayloadGetCourseById,
	type TCourse, type TPrismaPayloadGetAllCourses,
	type TPrismaPayloadCreateCourse,
	type TPrismaPayloadUpdateCourse,
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
				oldId: newCourse.oldId,
				name: newCourse.name,
				slug: newCourse.slug,
				description: newCourse.description,
				content: newCourse.content,
				marketingContent: newCourse.marketingContent,
				videoSourceUrl: newCourse.videoSourceUrl,
				marketingVideoUrl: newCourse.marketingVideoUrl,
				thumbnailUrl: newCourse.thumbnailUrl,
				publicationDate: newCourse.publicationDate,
				published: newCourse.published,
				isSelling: newCourse.isSelling,
				delegateAuthTo: {
					connect: newCourse.delegateAuthTo?.map(slug => ({slug})),
				},
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
		const courses = await this._model.course.findMany({
			where: {
				published: userRoles.includes('admin') ? undefined : true,
				publicationDate: {
					lte: userRoles.includes('admin') ? undefined : new Date(),
				},
			},
			select: {
				id: true,
				name: true,
				slug: true,
				description: true,
				thumbnailUrl: true,
				publicationDate: true,
				published: true,
			},
		});

		return {
			status: 'SUCCESSFUL',
			data: courses,
		};
	}

	public async getBySlug(slug: string, user: TUser): Promise<TServiceReturn<TPrismaPayloadGetCourseById | undefined>> {
		try {
			const course = await this._model.course.findUnique({
				where: {
					slug,
					published: user.roles?.includes('admin') ? undefined : true,
					publicationDate: {
						lte: user.roles?.includes('admin') ? undefined : new Date(),
					},
				},
				include: {
					modules: {
						where: {
							published: user.roles?.includes('admin') ? undefined : true,
							publicationDate: {
								lte: user.roles?.includes('admin') ? undefined : new Date(),
							},
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
					delegateAuthTo: {
						select: {
							id: true,
							slug: true,
							name: true,
							subscriptions: {
								where: {
									userId: user.id ?? '',
									expiresAt: {
										gte: new Date(),
									},
								},
							},
						},
					},
				},
			});

			if (!course) {
				throw new CustomError('NOT_FOUND', 'Course not found');
			}

			const hasActiveSubscription = user.roles?.includes('admin') || course.delegateAuthTo?.some(course => ( // eslint-disable-line @typescript-eslint/prefer-nullish-coalescing
				course.subscriptions.length > 0
			));

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
				oldId: courseToUpdate.oldId,
				name: courseToUpdate.name,
				slug: courseToUpdate.slug,
				description: courseToUpdate.description,
				content: courseToUpdate.content,
				marketingContent: courseToUpdate.marketingContent,
				videoSourceUrl: courseToUpdate.videoSourceUrl,
				marketingVideoUrl: courseToUpdate.marketingVideoUrl,
				thumbnailUrl: courseToUpdate.thumbnailUrl,
				publicationDate: courseToUpdate.publicationDate,
				published: courseToUpdate.published,
				isSelling: courseToUpdate.isSelling,
				delegateAuthTo: {
					connect: courseToUpdate.delegateAuthTo?.map(slug => ({slug})),
				},
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
