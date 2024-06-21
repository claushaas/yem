import {type PrismaClient} from '@prisma/client';
import {type TUser, type TUserRoles} from '../types/user.type.js';
import {Course} from '../entities/course.entity.server.js';
import {
	type TPrismaPayloadGetCourseBySlug,
	type TCourse, type TPrismaPayloadGetAllCourses,
	type TPrismaPayloadCreateOrUpdateCourse,
} from '../types/course.type.js';
import {CustomError} from '../utils/custom-error.js';
import {type TServiceReturn} from '../types/service-return.type.js';
import {database} from '../database/database.server.js';
import {logger} from '~/utils/logger.util.js';
import {memoryCache} from '~/cache/memory-cache.js';
import {type TCourseDataForCache} from '~/cache/populate-courses-to-cache.js';
import {type TModuleDataForCache} from '~/cache/populate-modules-to-cache.js';
import {type TSubscription} from '~/types/subscription.type.js';

export class CourseService {
	private static cache: typeof memoryCache;
	private readonly _model: PrismaClient;

	constructor(model: PrismaClient = database) {
		this._model = model;
		CourseService.cache = memoryCache;
	}

	public async create(courseData: TCourse): Promise<TServiceReturn<TPrismaPayloadCreateOrUpdateCourse>> {
		const newCourse = new Course(courseData);

		const createdCourse = await this._model.course.create({
			data: {
				oldId: newCourse.oldId,
				name: newCourse.name,
				slug: newCourse.slug,
				description: newCourse.description,
				order: newCourse.order,
				content: newCourse.content,
				marketingContent: newCourse.marketingContent,
				videoSourceUrl: newCourse.videoSourceUrl,
				marketingVideoUrl: newCourse.marketingVideoUrl,
				thumbnailUrl: newCourse.thumbnailUrl,
				publicationDate: newCourse.publicationDate,
				isPublished: newCourse.isPublished,
				isSelling: newCourse.isSelling,
				delegateAuthTo: {
					connect: newCourse.delegateAuthTo?.map(slug => ({slug})),
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
				isPublished: userRoles.includes('admin') ? undefined : true,
				publicationDate: {
					lte: userRoles.includes('admin') ? undefined : new Date(),
				},
			},
			orderBy: [
				{order: 'asc'},
				{name: 'asc'},
			],
			select: {
				id: true,
				name: true,
				slug: true,
				order: true,
				description: true,
				thumbnailUrl: true,
				publicationDate: true,
				isPublished: true,
				isSelling: true,
			},
		});

		courses.sort((a, b) => {
			if (!a.order && !b.order) {
				return a.name.localeCompare(b.name);
			}

			if (!a.order && b.order) {
				return 1;
			}

			if (a.order && !b.order) {
				return -1;
			}

			return a.order! - b.order!;
		});

		return {
			status: 'SUCCESSFUL',
			data: courses,
		};
	}

	public getAllFromCache(userRoles: TUserRoles = []): TServiceReturn<TCourseDataForCache[]> {
		const isAdmin = userRoles.includes('admin');

		const allCoursesKeys = CourseService.cache.keys().filter(key => key.startsWith('course:'));
		logger.logDebug(`All courses keys: ${JSON.stringify(allCoursesKeys)}`);

		const allCourses = allCoursesKeys.map(key => {
			const course = JSON.parse(CourseService.cache.get(key) ?? '{}') as TCourseDataForCache;

			return {
				...course,
				content: isAdmin ? course.content : course.marketingContent,
				videoSourceUrl: isAdmin ? course.videoSourceUrl : course.marketingVideoUrl,
			};
		});

		const filteredCourses = allCourses.filter(course => isAdmin || course.isPublished);

		filteredCourses.sort((a, b) => {
			if (!a.order && !b.order) {
				return a.name.localeCompare(b.name);
			}

			if (!a.order && b.order) {
				return 1;
			}

			if (a.order && !b.order) {
				return -1;
			}

			return a.order! - b.order!;
		});

		return {
			status: 'SUCCESSFUL',
			data: filteredCourses,
		};
	}

	public async getBySlug(slug: string, user: TUser): Promise<TServiceReturn<TPrismaPayloadGetCourseBySlug | undefined>> {
		try {
			const course = await this._model.course.findUnique({
				where: {
					slug,
					isPublished: user.roles?.includes('admin') ? undefined : true,
					publicationDate: {
						lte: user.roles?.includes('admin') ? undefined : new Date(),
					},
				},
				include: {
					modules: {
						where: {
							isPublished: user.roles?.includes('admin') ? undefined : true,
							publicationDate: {
								lte: user.roles?.includes('admin') ? undefined : new Date(),
							},
						},
						orderBy: [
							{order: 'asc'},
							{publicationDate: 'asc'},
						],
						select: {
							id: true,
							order: true,
							isPublished: true,
							publicationDate: true,
							module: {
								select: {
									id: true,
									slug: true,
									name: true,
									description: true,
									thumbnailUrl: true,
								},
							},
						},
					},
					comments: {
						where: {
							OR: [
								{published: user.roles?.includes('admin') ? undefined : true},
								{userId: user.id},
							],
						},
						orderBy: {
							createdAt: 'desc',
						},
						include: {
							responses: {
								where: {
									OR: [
										{published: user.roles?.includes('admin') ? undefined : true},
										{userId: user.id},
									],
								},
								orderBy: {
									createdAt: 'asc',
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
				content: hasActiveSubscription ? course?.content : course.marketingContent,
				videoSourceUrl: hasActiveSubscription ? course?.videoSourceUrl : course.marketingVideoUrl,
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

	public getBySlugFromCache(slug: string, user: TUser): TServiceReturn<TCourseDataForCache> {
		const isAdmin = user.roles?.includes('admin');

		const course = JSON.parse(CourseService.cache.get(`course:${slug}`) ?? '{}') as TCourseDataForCache;

		if (!course) {
			logger.logError(`Course with slug ${slug} not found in cache`);
			throw new CustomError('NOT_FOUND', 'Course not found');
		}

		// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
		const hasActiveSubscription = isAdmin || course.delegateAuthTo.some(courseSlug => {
			const subscription = CourseService.cache.get(`${courseSlug}:${user.id}`);

			if (!subscription) {
				return false;
			}

			const {expiresAt} = JSON.parse(subscription) as TSubscription;
			return expiresAt >= new Date();
		});

		const modules = course.modules.map(module => {
			const moduleData = JSON.parse(CourseService.cache.get(`${course.slug}:${module as string}`) ?? '{}') as TModuleDataForCache;

			moduleData.module.content = hasActiveSubscription ? moduleData.module.content : moduleData.module.marketingContent;
			moduleData.module.videoSourceUrl = hasActiveSubscription ? moduleData.module.videoSourceUrl : moduleData.module.marketingVideoUrl;

			return moduleData;
		});
		course.modules = modules;
		course.content = hasActiveSubscription ? course.content : course.marketingContent;
		course.videoSourceUrl = hasActiveSubscription ? course.videoSourceUrl : course.marketingVideoUrl;

		return {
			status: 'SUCCESSFUL',
			data: course,
		};
	}

	public async update(id: string, courseData: TCourse): Promise<TServiceReturn<TPrismaPayloadCreateOrUpdateCourse>> {
		const courseToUpdate = new Course(courseData);

		const updatedCourse = await this._model.course.update({
			where: {
				id,
			},
			data: {
				oldId: courseToUpdate.oldId,
				name: courseToUpdate.name,
				slug: courseToUpdate.slug,
				order: courseToUpdate.order,
				description: courseToUpdate.description,
				content: courseToUpdate.content,
				marketingContent: courseToUpdate.marketingContent,
				videoSourceUrl: courseToUpdate.videoSourceUrl,
				marketingVideoUrl: courseToUpdate.marketingVideoUrl,
				thumbnailUrl: courseToUpdate.thumbnailUrl,
				publicationDate: courseToUpdate.publicationDate,
				isPublished: courseToUpdate.isPublished,
				isSelling: courseToUpdate.isSelling,
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

	public async addDelegateAuthTo(courseId: string, delegateAuthTo: string[]): Promise<TServiceReturn<TPrismaPayloadCreateOrUpdateCourse>> {
		const updatedCourse = await this._model.course.update({
			where: {
				id: courseId,
			},
			data: {
				delegateAuthTo: {
					connect: delegateAuthTo.map(slug => ({slug})),
				},
			},
		});

		if (!updatedCourse) {
			throw new CustomError('NOT_FOUND', `Course with id ${courseId} not found`);
		}

		return {
			status: 'SUCCESSFUL',
			data: updatedCourse,
		};
	}

	public async removeDelegateAuthTo(courseId: string, delegateAuthToSlug: string): Promise<TServiceReturn<TPrismaPayloadCreateOrUpdateCourse>> {
		const updatedCourse = await this._model.course.update({
			where: {
				id: courseId,
			},
			data: {
				delegateAuthTo: {
					disconnect: {
						slug: delegateAuthToSlug,
					},
				},
			},
		});

		if (!updatedCourse) {
			throw new CustomError('NOT_FOUND', `Course with id ${courseId} not found`);
		}

		return {
			status: 'SUCCESSFUL',
			data: updatedCourse,
		};
	}
}
