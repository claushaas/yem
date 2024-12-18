/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import {type PrismaClient} from '@prisma/client';
import {
	type TPrismaPayloadCreateOrUpdateModule,
	type TModule,
	type TPrismaPayloadGetModulesList,
	type TPrismaPayloadGetModuleBySlug,
	type TModuleDataFromCache,
} from '../types/module.type.js';
import {Module} from '../entities/module.entity.server.js';
import {type TUser} from '../types/user.type.js';
import {CustomError} from '../utils/custom-error.js';
import {type TServiceReturn} from '../types/service-return.type.js';
import {database} from '../database/database.server.js';
import {logger} from '~/utils/logger.util.js';
import {memoryCache} from '~/cache/memory-cache.js';
import {type TSubscription} from '~/types/subscription.type.js';
import {type TLessonDataForCache} from '~/cache/populate-lessons-to-cache.js';
import {type TCourseDataForCache} from '~/cache/populate-courses-to-cache.js';

export class ModuleService {
	private static cache: typeof memoryCache;
	private readonly _model: PrismaClient;

	constructor(model: PrismaClient = database) {
		this._model = model;
		ModuleService.cache = memoryCache;
	}

	public async create(moduleData: TModule): Promise<TServiceReturn<TPrismaPayloadCreateOrUpdateModule>> {
		const newModule = new Module(moduleData);

		const createdModule = await this._model.module.create({
			include: {
				courses: {
					include: {
						course: true,
					},
				},
			},
			data: {
				oldId: newModule.oldId,
				name: newModule.name,
				slug: newModule.slug,
				description: newModule.description,
				content: newModule.content,
				marketingContent: newModule.marketingContent,
				videoSourceUrl: newModule.videoSourceUrl,
				marketingVideoUrl: newModule.marketingVideoUrl,
				thumbnailUrl: newModule.thumbnailUrl,
				isLessonsOrderRandom: newModule.isLessonsOrderRandom,
				showTagsFilters: newModule.showTagsFilters,
				courses: {
					create: newModule.courses!.map(course => ({
						courseSlug: course,
						isPublished: newModule.isPublished!,
						publicationDate: newModule.publicationDate!,
						order: newModule.order!,
					})),
				},
			},
		});

		return {
			status: 'CREATED',
			data: createdModule,
		};
	}

	public async update(id: string, moduleData: TModule): Promise<TServiceReturn<TPrismaPayloadCreateOrUpdateModule>> {
		const newModule = new Module(moduleData);

		const updatedModule = await this._model.module.update({
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
			data: {
				oldId: newModule.oldId,
				name: newModule.name,
				slug: newModule.slug,
				description: newModule.description,
				content: newModule.content,
				marketingContent: newModule.marketingContent,
				videoSourceUrl: newModule.videoSourceUrl,
				marketingVideoUrl: newModule.marketingVideoUrl,
				thumbnailUrl: newModule.thumbnailUrl,
				isLessonsOrderRandom: newModule.isLessonsOrderRandom,
				showTagsFilters: newModule.showTagsFilters,
			},
		});

		return {
			status: 'SUCCESSFUL',
			data: updatedModule,
		};
	}

	public async getAllForAdmin(user: TUser): Promise<TServiceReturn<TPrismaPayloadGetModulesList>> {
		const modules = await this._model.module.findMany({
			select: {
				id: true,
				slug: true,
				name: true,
			},
		});

		if (modules.length === 0) {
			throw new CustomError('NOT_FOUND', 'No modules found');
		}

		return {
			status: 'SUCCESSFUL',
			data: modules,
		};
	}

	public async getBySlug(courseSlug: string, moduleSlug: string, user: TUser): Promise<TServiceReturn<TPrismaPayloadGetModuleBySlug | undefined>> {
		try {
			const moduleToCourse = await this._model.moduleToCourse.findUnique({
				where: {
					moduleToCourse: {
						moduleSlug,
						courseSlug,
					},
					isPublished: user.roles?.includes('admin') ? undefined : true,
					publicationDate: {
						lte: user.roles?.includes('admin') ? undefined : new Date(),
					},
				},
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
							lessons: {
								where: {
									moduleSlug,
									isPublished: user.roles?.includes('admin') ? undefined : true,
									publicationDate: {
										lte: user.roles?.includes('admin') ? undefined : new Date(),
									},
								},
								orderBy: [
									{order: 'asc'},
									{publicationDate: 'asc'},
								],
								include: {
									lesson: {
										select: {
											id: true,
											name: true,
											slug: true,
											description: true,
											thumbnailUrl: true,
											tags: true,
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
						},
					},
				},
			});

			if (!moduleToCourse) {
				throw new CustomError('NOT_FOUND', 'Module not found');
			}

			const hasActiveSubscription = user.roles?.includes('admin')
				|| moduleToCourse.course.delegateAuthTo.some(
					course => course.subscriptions.some(
						subscription => subscription.expiresAt >= new Date(),
					),
				);

			const returnableModule = {
				...moduleToCourse,
				module: {
					...moduleToCourse.module,
					content: hasActiveSubscription ? moduleToCourse.module.content : moduleToCourse.module.marketingContent,
					videoSourceUrl: hasActiveSubscription ? moduleToCourse.module.videoSourceUrl : moduleToCourse.module.marketingVideoUrl,
				},
			};

			return {
				status: 'SUCCESSFUL',
				data: returnableModule as TPrismaPayloadGetModuleBySlug,
			};
		} catch (error) {
			logger.logError(`Error getting module by slug: ${(error as Error).message}`);
			return {
				status: 'UNKNOWN',
				data: undefined,
			};
		}
	}

	// eslint-disable-next-line max-params
	public getBySlugFromCache(courseSlug: string, moduleSlug: string, user: TUser, appliedTags: Array<[string, string]>, page?: number): TServiceReturn<TModuleDataFromCache | undefined> {
		try {
			const module = JSON.parse(ModuleService.cache.get(`${courseSlug}:${moduleSlug}`) ?? '{}') as TModuleDataFromCache;
			const course = JSON.parse(ModuleService.cache.get(`course:${courseSlug}`) ?? '{}') as TCourseDataForCache;

			if (!module) {
				logger.logError(`Module ${moduleSlug} for ${courseSlug} not found in cache`);
				throw new CustomError('NOT_FOUND', 'Module not found');
			}

			const isAdmin = user.roles?.includes('admin');

			const hasActiveSubscription = isAdmin || module.delegateAuthTo.some(courseSlug => {
				const subscription = ModuleService.cache.get(`${courseSlug}:${user.id}`);

				if (!subscription) {
					return false;
				}

				const {expiresAt} = JSON.parse(subscription) as TSubscription;
				return new Date(expiresAt) >= new Date();
			});

			const actualPage = page ?? 1;

			if (!hasActiveSubscription) {
				module.module.content = module.module.marketingContent || course.marketingContent;
				module.module.videoSourceUrl = module.module.marketingVideoUrl || course.marketingVideoUrl;
			}

			const allModuleLessons = module.lessons
				.map(lessonSlug => {
					const lessonData = JSON.parse(ModuleService.cache.get(`${moduleSlug}:${lessonSlug as string}`) ?? '{}') as TLessonDataForCache;

					if (!hasActiveSubscription) {
						lessonData.lesson.content = lessonData.lesson.marketingContent || module.module.marketingContent;
						lessonData.lesson.videoSourceUrl = lessonData.lesson.marketingVideoUrl || module.module.marketingVideoUrl;
					}

					return lessonData;
				});

			// eslint-disable-next-line unicorn/no-array-reduce
			const organizedTags = appliedTags.reduce<Array<Record<string, string[]>>>((accumulator, [key, value]) => {
				const tagIndex = accumulator.findIndex(tag => tag[key]);

				if (tagIndex === -1) {
					accumulator.push({[key]: [value]});
				} else if (!accumulator[tagIndex][key].includes(value)) {
					accumulator[tagIndex][key].push(value);
				}

				return accumulator;
			}, []);

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

			const lessons = allModuleLessons.filter(lesson => {
				if (appliedTags.length === 0) {
					return true;
				}

				return organizedTags.every(tagObject =>
					Object.entries(tagObject).every(([key, values]) => {
						if (key === 'Duração') {
							return values.some(value => durationTagsTest(Number(value), lesson.lesson.duration ?? 500));
						}

						return lesson.lesson.tags.some(tag =>
							tag.tagOptionName === key && values.includes(tag.tagValueName),
						);
					}),
				);
			});

			module.pages = Math.ceil(lessons.length / 16);

			const actualPageLessons = lessons.slice((actualPage - 1) * 16, actualPage * 16);

			module.lessons = actualPageLessons;

			return {
				status: 'SUCCESSFUL',
				data: module,
			};
		} catch (error) {
			logger.logError(`Error getting module by slug from cache: ${(error as Error).message}`);
			return {
				status: 'UNKNOWN',
				data: undefined,
			};
		}
	}
}
