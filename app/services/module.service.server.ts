/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/** biome-ignore-all lint/style/noNonNullAssertion: . */
import type { PrismaClient } from '@prisma/client';
import { memoryCache } from '~/cache/memory-cache.js';
import type { TCourseDataForCache } from '~/cache/populate-courses-to-cache.js';
import type { TLessonDataForCache } from '~/cache/populate-lessons-to-cache.js';
import type { TSubscription } from '~/types/subscription.type.js';
import { logger } from '~/utils/logger.util.js';
import { database } from '../database/database.server.js';
import { Module } from '../entities/module.entity.server.js';
import type {
	TModule,
	TModuleDataFromCache,
	TPrismaPayloadCreateOrUpdateModule,
	TPrismaPayloadGetModuleBySlug,
	TPrismaPayloadGetModulesList,
} from '../types/module.type.js';
import type { TServiceReturn } from '../types/service-return.type.js';
import type { TUser } from '../types/user.type.js';
import { CustomError } from '../utils/custom-error.js';

export class ModuleService {
	private static cache: typeof memoryCache;
	private readonly _model: PrismaClient;

	constructor(model: PrismaClient = database) {
		this._model = model;
		ModuleService.cache = memoryCache;
	}

	public async create(
		moduleData: TModule,
	): Promise<TServiceReturn<TPrismaPayloadCreateOrUpdateModule>> {
		const newModule = new Module(moduleData);

		const createdModule = await this._model.module.create({
			data: {
				content: newModule.content,
				courses: {
					create: newModule.courses!.map((course) => ({
						courseSlug: course,
						isPublished: newModule.isPublished!,
						order: newModule.order!,
						publicationDate: newModule.publicationDate!,
					})),
				},
				description: newModule.description,
				isLessonsOrderRandom: newModule.isLessonsOrderRandom,
				marketingContent: newModule.marketingContent,
				marketingVideoUrl: newModule.marketingVideoUrl,
				name: newModule.name,
				oldId: newModule.oldId,
				showTagsFilters: newModule.showTagsFilters,
				slug: newModule.slug,
				thumbnailUrl: newModule.thumbnailUrl,
				videoSourceUrl: newModule.videoSourceUrl,
			},
			include: {
				courses: {
					include: {
						course: true,
					},
				},
			},
		});

		return {
			data: createdModule,
			status: 'CREATED',
		};
	}

	public async update(
		id: string,
		moduleData: TModule,
	): Promise<TServiceReturn<TPrismaPayloadCreateOrUpdateModule>> {
		const newModule = new Module(moduleData);

		const updatedModule = await this._model.module.update({
			data: {
				content: newModule.content,
				description: newModule.description,
				isLessonsOrderRandom: newModule.isLessonsOrderRandom,
				marketingContent: newModule.marketingContent,
				marketingVideoUrl: newModule.marketingVideoUrl,
				name: newModule.name,
				oldId: newModule.oldId,
				showTagsFilters: newModule.showTagsFilters,
				slug: newModule.slug,
				thumbnailUrl: newModule.thumbnailUrl,
				videoSourceUrl: newModule.videoSourceUrl,
			},
			include: {
				courses: {
					include: {
						course: true,
					},
				},
			},
			where: {
				id,
			},
		});

		return {
			data: updatedModule,
			status: 'SUCCESSFUL',
		};
	}

	public async getAllForAdmin(): Promise<TServiceReturn<TPrismaPayloadGetModulesList>> {
		const modules = await this._model.module.findMany({
			select: {
				id: true,
				name: true,
				slug: true,
			},
		});

		if (modules.length === 0) {
			throw new CustomError('NOT_FOUND', 'No modules found');
		}

		return {
			data: modules,
			status: 'SUCCESSFUL',
		};
	}

	public async getBySlug(
		courseSlug: string,
		moduleSlug: string,
		user: TUser,
	): Promise<TServiceReturn<TPrismaPayloadGetModuleBySlug | undefined>> {
		try {
			const moduleToCourse = await this._model.moduleToCourse.findUnique({
				include: {
					course: {
						select: {
							delegateAuthTo: {
								select: {
									id: true,
									subscriptions: {
										where: {
											userId: user.id,
										},
									},
								},
							},
						},
					},
					module: {
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
										{
											published: user.roles?.includes('admin')
												? undefined
												: true,
										},
										{ userId: user.id },
									],
								},
							},
							lessons: {
								include: {
									lesson: {
										select: {
											description: true,
											id: true,
											name: true,
											slug: true,
											tags: true,
											thumbnailUrl: true,
										},
									},
								},
								orderBy: [{ order: 'asc' }, { publicationDate: 'asc' }],
								where: {
									isPublished: user.roles?.includes('admin') ? undefined : true,
									moduleSlug,
									publicationDate: {
										lte: user.roles?.includes('admin') ? undefined : new Date(),
									},
								},
							},
						},
					},
				},
				where: {
					isPublished: user.roles?.includes('admin') ? undefined : true,
					moduleToCourse: {
						courseSlug,
						moduleSlug,
					},
					publicationDate: {
						lte: user.roles?.includes('admin') ? undefined : new Date(),
					},
				},
			});

			if (!moduleToCourse) {
				throw new CustomError('NOT_FOUND', 'Module not found');
			}

			const hasActiveSubscription =
				user.roles?.includes('admin') ||
				moduleToCourse.course.delegateAuthTo.some((course) =>
					course.subscriptions.some(
						(subscription) => subscription.expiresAt >= new Date(),
					),
				);

			const returnableModule = {
				...moduleToCourse,
				module: {
					...moduleToCourse.module,
					content: hasActiveSubscription
						? moduleToCourse.module.content
						: moduleToCourse.module.marketingContent,
					videoSourceUrl: hasActiveSubscription
						? moduleToCourse.module.videoSourceUrl
						: moduleToCourse.module.marketingVideoUrl,
				},
			};

			return {
				data: returnableModule as TPrismaPayloadGetModuleBySlug,
				status: 'SUCCESSFUL',
			};
		} catch (error) {
			logger.logError(
				`Error getting module by slug: ${(error as Error).message}`,
			);
			return {
				data: undefined,
				status: 'UNKNOWN',
			};
		}
	}

	// eslint-disable-next-line max-params
	public getBySlugFromCache(
		courseSlug: string,
		moduleSlug: string,
		user: TUser,
		appliedTags: Array<[string, string]>,
		page?: number,
	): TServiceReturn<TModuleDataFromCache | undefined> {
		try {
			const module = JSON.parse(
				ModuleService.cache.get(`${courseSlug}:${moduleSlug}`) ?? '{}',
			) as TModuleDataFromCache;
			const course = JSON.parse(
				ModuleService.cache.get(`course:${courseSlug}`) ?? '{}',
			) as TCourseDataForCache;

			if (!module) {
				logger.logError(
					`Module ${moduleSlug} for ${courseSlug} not found in cache`,
				);
				throw new CustomError('NOT_FOUND', 'Module not found');
			}

			const isAdmin = user.roles?.includes('admin');

			const hasActiveSubscription =
				isAdmin ||
				module.delegateAuthTo.some((courseSlug) => {
					const subscription = ModuleService.cache.get(
						`${courseSlug}:${user.id}`,
					);

					if (!subscription) {
						return false;
					}

					const { expiresAt } = JSON.parse(subscription) as TSubscription;
					return new Date(expiresAt) >= new Date();
				});

			const actualPage = page ?? 1;

			if (!hasActiveSubscription) {
				module.module.content =
					module.module.marketingContent || course.marketingContent;
				module.module.videoSourceUrl =
					module.module.marketingVideoUrl || course.marketingVideoUrl;
			}

			const allModuleLessons = module.lessons.map((lessonSlug) => {
				const lessonData = JSON.parse(
					ModuleService.cache.get(`${moduleSlug}:${lessonSlug as string}`) ??
						'{}',
				) as TLessonDataForCache;

				if (!hasActiveSubscription) {
					lessonData.lesson.content =
						lessonData.lesson.marketingContent ||
						module.module.marketingContent;
					lessonData.lesson.videoSourceUrl =
						lessonData.lesson.marketingVideoUrl ||
						module.module.marketingVideoUrl;
				}

				return lessonData;
			});

			// eslint-disable-next-line unicorn/no-array-reduce
			const organizedTags = appliedTags.reduce<Array<Record<string, string[]>>>(
				(accumulator, [key, value]) => {
					const tagIndex = accumulator.findIndex((tag) => tag[key]);

					if (tagIndex === -1) {
						accumulator.push({ [key]: [value] });
					} else if (!accumulator[tagIndex][key].includes(value)) {
						accumulator[tagIndex][key].push(value);
					}

					return accumulator;
				},
				[],
			);

			const durationTagsTest = (value: number, lessonDuration: number) => {
				switch (value) {
					case 1: {
						return lessonDuration <= 30;
					}

					case 2: {
						return lessonDuration >= 31 && lessonDuration <= 50;
					}

					case 3: {
						return lessonDuration >= 51 && lessonDuration <= 70;
					}

					case 4: {
						return lessonDuration >= 71;
					}

					default: {
						return false;
					}
				}
			};

			const lessons = allModuleLessons.filter((lesson) => {
				if (appliedTags.length === 0) {
					return true;
				}

				return organizedTags.every((tagObject) =>
					Object.entries(tagObject).every(([key, values]) => {
						if (key === 'Duração') {
							return values.some((value) =>
								durationTagsTest(Number(value), lesson.lesson.duration ?? 500),
							);
						}

						return lesson.lesson.tags.some(
							(tag) =>
								tag.tagOptionName === key && values.includes(tag.tagValueName),
						);
					}),
				);
			});

			module.pages = Math.ceil(lessons.length / 16);

			const actualPageLessons = lessons.slice(
				(actualPage - 1) * 16,
				actualPage * 16,
			);

			module.lessons = actualPageLessons;

			return {
				data: module,
				status: 'SUCCESSFUL',
			};
		} catch (error) {
			logger.logError(
				`Error getting module by slug from cache: ${(error as Error).message}`,
			);
			return {
				data: undefined,
				status: 'UNKNOWN',
			};
		}
	}
}
