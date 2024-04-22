/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import {type PrismaClient} from '@prisma/client';
import {
	type TPrismaPayloadCreateOrUpdateModule,
	type TModule,
	type TPrismaPayloadGetModulesList,
	type TPrismaPayloadGetModuleBySlug,
} from '../types/module.type.js';
import {Module} from '../entities/module.entity.server.js';
import {type TUser} from '../types/user.type.js';
import {CustomError} from '../utils/custom-error.js';
import {type TServiceReturn} from '../types/service-return.type.js';
import {db} from '../database/db.js';
import {logger} from '~/utils/logger.util.js';

export class ModuleService {
	private readonly _model: PrismaClient;

	constructor(model: PrismaClient = db) {
		this._model = model;
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
				courses: {
					create: newModule.courses?.map(course => ({
						courseId: course,
						isPublished: newModule.isPublished,
						publicationDate: newModule.publicationDate,
						order: newModule.order,
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

	public async getById(courseId: string, moduleId: string, user: TUser): Promise<TServiceReturn<TPrismaPayloadGetModuleBySlug | undefined>> {
		try {
			const moduleToCourse = await this._model.moduleToCourse.findUnique({
				where: {
					moduleToCourse: {
						moduleId,
						courseId,
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
									moduleId,
									isPublished: user.roles?.includes('admin') ? undefined : true,
									publicationDate: {
										lte: user.roles?.includes('admin') ? undefined : new Date(),
									},
								},
								orderBy: {
									order: 'asc',
									publicationDate: 'asc',
								},
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
}
