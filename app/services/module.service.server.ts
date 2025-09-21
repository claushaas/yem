/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/** biome-ignore-all lint/style/noNonNullAssertion: . */
import type { Prisma, PrismaClient } from '@prisma/client';
import { logger } from '~/utils/logger.util.js';
import { database } from '../database/database.server.js';
import { Module } from '../entities/module.entity.server.js';
import type {
	TModule,
	TPrismaPayloadCreateOrUpdateModule,
	TPrismaPayloadGetModuleBySlug,
	TPrismaPayloadGetModulesList,
} from '../types/module.type.js';
import type { TServiceReturn } from '../types/service-return.type.js';
import type { TUser } from '../types/user.type.js';
import { CustomError } from '../utils/custom-error.js';

// Tipo estendido para incluir a propriedade de paginação adicionada dinamicamente
type TModuleToCourseWithPagination = Prisma.ModuleToCourseGetPayload<{
	include: {
		course: true;
		module: {
			include: {
				lessons: { include: { lesson: { include: { tags: true } } } };
			};
		};
	};
}> & { pages?: number };

export class ModuleService {
	private readonly _model: PrismaClient;

	constructor(model: PrismaClient = database) {
		this._model = model;
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

	public async getAllForAdmin(): Promise<
		TServiceReturn<TPrismaPayloadGetModulesList>
	> {
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
	public async getOneForUser(
		courseSlug: string,
		moduleSlug: string,
		user: TUser,
		appliedTags: Array<[string, string]>,
		page?: number,
	): Promise<TServiceReturn<TModuleToCourseWithPagination | undefined>> {
		try {
			const moduleToCourse = await this._model.moduleToCourse.findUnique({
				include: {
					course: true,
					module: {
						include: {
							lessons: {
								include: {
									lesson: {
										select: {
											description: true,
											duration: true,
											id: true,
											name: true,
											slug: true,
											tags: true,
											thumbnailUrl: true,
										},
									},
								},
							},
						},
					},
				},
				where: {
					course: {
						delegateAuthTo: {
							some: {
								subscriptions: {
									some: {
										expiresAt: {
											gte: new Date(),
										},
										userId: user.id,
									},
								},
							},
						},
					},
					moduleToCourse: {
						courseSlug,
						moduleSlug,
					},
				},
			});

			const actualPage = page ?? 1;

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

			const lessons = moduleToCourse?.module.lessons.filter((lesson) => {
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

			const totalPages =
				(lessons?.length ?? 0) > 0 ? Math.ceil((lessons?.length ?? 0) / 16) : 1;

			const actualPageLessons =
				lessons?.slice((actualPage - 1) * 16, actualPage * 16) ?? [];

			if (moduleToCourse) {
				moduleToCourse.module.lessons = actualPageLessons;
				// Fazemos o cast para o tipo estendido que suporta pages
				(moduleToCourse as TModuleToCourseWithPagination).pages = totalPages;
			}

			return {
				data: moduleToCourse as TModuleToCourseWithPagination,
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
