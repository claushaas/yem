/** biome-ignore-all lint/style/noNonNullAssertion: . */
import type { PrismaClient } from '@prisma/client';
import { memoryCache } from '~/cache/memory-cache.js';
import type { TCourseDataForCache } from '~/cache/populate-courses-to-cache.js';
import type { TModuleDataForCache } from '~/cache/populate-modules-to-cache.js';
import type { TSubscription } from '~/types/subscription.type.js';
import { logger } from '~/utils/logger.util.js';
import { database } from '../database/database.server.js';
import { Course } from '../entities/course.entity.server.js';
import type {
	TCourse,
	TPrismaPayloadCreateOrUpdateCourse,
	TPrismaPayloadGetAllCourses,
	TPrismaPayloadGetCourseBySlug,
} from '../types/course.type.js';
import type { TServiceReturn } from '../types/service-return.type.js';
import type { TUser, TUserRoles } from '../types/user.type.js';
import { CustomError } from '../utils/custom-error.js';

export class CourseService {
	private static cache: typeof memoryCache;
	private readonly _model: PrismaClient;

	constructor(model: PrismaClient = database) {
		this._model = model;
		CourseService.cache = memoryCache;
	}

	public async create(
		courseData: TCourse,
	): Promise<TServiceReturn<TPrismaPayloadCreateOrUpdateCourse>> {
		const newCourse = new Course(courseData);

		const createdCourse = await this._model.course.create({
			data: {
				content: newCourse.content,
				delegateAuthTo: {
					connect: newCourse.delegateAuthTo?.map((slug) => ({ slug })),
				},
				description: newCourse.description,
				isPublished: newCourse.isPublished,
				isSelling: newCourse.isSelling,
				marketingContent: newCourse.marketingContent,
				marketingVideoUrl: newCourse.marketingVideoUrl,
				name: newCourse.name,
				oldId: newCourse.oldId,
				order: newCourse.order,
				publicationDate: newCourse.publicationDate,
				slug: newCourse.slug,
				thumbnailUrl: newCourse.thumbnailUrl,
				videoSourceUrl: newCourse.videoSourceUrl,
			},
		});

		return {
			data: createdCourse,
			status: 'CREATED',
		};
	}

	public async getAll(
		userRoles: TUserRoles = [],
	): Promise<TServiceReturn<TPrismaPayloadGetAllCourses>> {
		const courses = await this._model.course.findMany({
			orderBy: [{ order: 'asc' }, { name: 'asc' }],
			select: {
				description: true,
				id: true,
				isPublished: true,
				isSelling: true,
				name: true,
				order: true,
				publicationDate: true,
				slug: true,
				thumbnailUrl: true,
			},
			where: {
				isPublished: userRoles.includes('admin') ? undefined : true,
				publicationDate: {
					lte: userRoles.includes('admin') ? undefined : new Date(),
				},
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
			data: courses,
			status: 'SUCCESSFUL',
		};
	}

	public getAllFromCache(user: TUser): TServiceReturn<TCourseDataForCache[]> {
		const allCoursesKeys = CourseService.cache
			.keys()
			.filter((key) => key.startsWith('course:'));
		logger.logDebug(`All courses keys: ${JSON.stringify(allCoursesKeys)}`);

		const allCourses = allCoursesKeys.map((key) => {
			const course = JSON.parse(
				CourseService.cache.get(key) ?? '{}',
			) as TCourseDataForCache;

			const hasActiveSubscription =
				user.roles?.includes('admin') ||
				course.delegateAuthTo.some((courseSlug) => {
					// eslint-disable-line @typescript-eslint/prefer-nullish-coalescing
					const subscription = CourseService.cache.get(
						`${courseSlug}:${user.id}`,
					);

					if (!subscription) {
						return false;
					}

					const { expiresAt } = JSON.parse(subscription) as TSubscription;
					return expiresAt >= new Date();
				});

			return {
				...course,
				content: hasActiveSubscription
					? course.content
					: course.marketingContent,
				hasActiveSubscription,
				videoSourceUrl: hasActiveSubscription
					? course.videoSourceUrl
					: course.marketingVideoUrl,
			};
		});

		const filteredCourses = allCourses.filter(
			(course) =>
				user.roles?.includes('admin') ||
				(course.isPublished && course.hasActiveSubscription)
		); // eslint-disable-line @typescript-eslint/prefer-nullish-coalescing

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
			data: filteredCourses,
			status: 'SUCCESSFUL',
		};
	}

	public async getBySlug(
		slug: string,
		user: TUser,
	): Promise<TServiceReturn<TPrismaPayloadGetCourseBySlug | undefined>> {
		try {
			const course = await this._model.course.findUnique({
				include: {
					comments: {
						include: {
							responses: {
								orderBy: {
									createdAt: 'asc',
								},
								where: {
									OR: [
										{
											published: user.roles?.includes('admin')
												? undefined
												: true,
										},
										{ userId: user.id },
									],
								},
							},
						},
						orderBy: {
							createdAt: 'desc',
						},
						where: {
							OR: [
								{ published: user.roles?.includes('admin') ? undefined : true },
								{ userId: user.id },
							],
						},
					},
					delegateAuthTo: {
						select: {
							id: true,
							name: true,
							slug: true,
							subscriptions: {
								where: {
									expiresAt: {
										gte: new Date(),
									},
									userId: user.id ?? '',
								},
							},
						},
					},
					modules: {
						orderBy: [{ order: 'asc' }, { publicationDate: 'asc' }],
						select: {
							id: true,
							isPublished: true,
							module: {
								select: {
									description: true,
									id: true,
									name: true,
									slug: true,
									thumbnailUrl: true,
								},
							},
							order: true,
							publicationDate: true,
						},
						where: {
							isPublished: user.roles?.includes('admin') ? undefined : true,
							publicationDate: {
								lte: user.roles?.includes('admin') ? undefined : new Date(),
							},
						},
					},
				},
				where: {
					isPublished: user.roles?.includes('admin') ? undefined : true,
					publicationDate: {
						lte: user.roles?.includes('admin') ? undefined : new Date(),
					},
					slug,
				},
			});

			if (!course) {
				throw new CustomError('NOT_FOUND', 'Course not found');
			}

			const hasActiveSubscription =
				user.roles?.includes('admin') ||
				course.delegateAuthTo?.some(
					(
						course, // eslint-disable-line @typescript-eslint/prefer-nullish-coalescing
					) => course.subscriptions.length > 0,
				);

			const returnableCourse = {
				...course,
				content: hasActiveSubscription
					? course?.content
					: course.marketingContent,
				videoSourceUrl: hasActiveSubscription
					? course?.videoSourceUrl
					: course.marketingVideoUrl,
			};

			return {
				data: returnableCourse,
				status: 'SUCCESSFUL',
			};
		} catch (error) {
			logger.logError(
				`Error getting course by slug: ${(error as Error).message}`,
			);
			return {
				data: undefined,
				status: 'UNKNOWN',
			};
		}
	}

	public getBySlugFromCache(
		slug: string,
		user: TUser,
	): TServiceReturn<TCourseDataForCache> {
		const isAdmin = user.roles?.includes('admin');

		const course = JSON.parse(
			CourseService.cache.get(`course:${slug}`) ?? '{}',
		) as TCourseDataForCache;

		if (!course) {
			logger.logError(`Course with slug ${slug} not found in cache`);
			throw new CustomError('NOT_FOUND', 'Course not found');
		}

		// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
		const hasActiveSubscription =
			isAdmin ||
			course.delegateAuthTo.some((courseSlug) => {
				const subscription = CourseService.cache.get(
					`${courseSlug}:${user.id}`,
				);

				if (!subscription) {
					return false;
				}

				const { expiresAt } = JSON.parse(subscription) as TSubscription;
				return new Date(expiresAt) >= new Date();
			});

		const modules = course.modules.map((module) => {
			const moduleData = JSON.parse(
				CourseService.cache.get(`${course.slug}:${module as string}`) ?? '{}',
			) as TModuleDataForCache;

			moduleData.module.content = hasActiveSubscription
				? moduleData.module.content
				: moduleData.module.marketingContent;
			moduleData.module.videoSourceUrl = hasActiveSubscription
				? moduleData.module.videoSourceUrl
				: moduleData.module.marketingVideoUrl;

			return moduleData;
		});
		course.modules = modules;
		course.content = hasActiveSubscription
			? course.content
			: course.marketingContent;
		course.videoSourceUrl = hasActiveSubscription
			? course.videoSourceUrl
			: course.marketingVideoUrl;

		return {
			data: course,
			status: 'SUCCESSFUL',
		};
	}

	public async update(
		id: string,
		courseData: TCourse,
	): Promise<TServiceReturn<TPrismaPayloadCreateOrUpdateCourse>> {
		const courseToUpdate = new Course(courseData);

		const updatedCourse = await this._model.course.update({
			data: {
				content: courseToUpdate.content,
				description: courseToUpdate.description,
				isPublished: courseToUpdate.isPublished,
				isSelling: courseToUpdate.isSelling,
				marketingContent: courseToUpdate.marketingContent,
				marketingVideoUrl: courseToUpdate.marketingVideoUrl,
				name: courseToUpdate.name,
				oldId: courseToUpdate.oldId,
				order: courseToUpdate.order,
				publicationDate: courseToUpdate.publicationDate,
				slug: courseToUpdate.slug,
				thumbnailUrl: courseToUpdate.thumbnailUrl,
				videoSourceUrl: courseToUpdate.videoSourceUrl,
			},
			where: {
				id,
			},
		});

		if (!updatedCourse) {
			throw new CustomError('NOT_FOUND', `Course with id ${id} not found`);
		}

		return {
			data: updatedCourse,
			status: 'SUCCESSFUL',
		};
	}

	public async addDelegateAuthTo(
		courseId: string,
		delegateAuthTo: string[],
	): Promise<TServiceReturn<TPrismaPayloadCreateOrUpdateCourse>> {
		const updatedCourse = await this._model.course.update({
			data: {
				delegateAuthTo: {
					connect: delegateAuthTo.map((slug) => ({ slug })),
				},
			},
			where: {
				id: courseId,
			},
		});

		if (!updatedCourse) {
			throw new CustomError(
				'NOT_FOUND',
				`Course with id ${courseId} not found`,
			);
		}

		return {
			data: updatedCourse,
			status: 'SUCCESSFUL',
		};
	}

	public async removeDelegateAuthTo(
		courseId: string,
		delegateAuthToSlug: string,
	): Promise<TServiceReturn<TPrismaPayloadCreateOrUpdateCourse>> {
		const updatedCourse = await this._model.course.update({
			data: {
				delegateAuthTo: {
					disconnect: {
						slug: delegateAuthToSlug,
					},
				},
			},
			where: {
				id: courseId,
			},
		});

		if (!updatedCourse) {
			throw new CustomError(
				'NOT_FOUND',
				`Course with id ${courseId} not found`,
			);
		}

		return {
			data: updatedCourse,
			status: 'SUCCESSFUL',
		};
	}
}
