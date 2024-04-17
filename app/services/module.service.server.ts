import {type PrismaClient} from '@prisma/client';
import {
	type TPrismaPayloadCreateModule,
	type TModule,
	type TPrismaPayloadUpdateModule,
	type TPrismaPayloadGetModulesList,
	type TPrismaPayloadGetModuleById,
} from '../types/module.type.js';
import {Module} from '../entities/module.entity.server.js';
import {type TUser, type TUserRoles} from '../types/user.type.js';
import {type TUuid} from '../types/uuid.type.js';
import {CustomError} from '../utils/custom-error.js';
import {type TServiceReturn} from '../types/service-return.type.js';
import {db} from '../database/db.js';
import {logger} from '~/utils/logger.util.js';

export class ModuleService {
	private readonly _model: PrismaClient;

	constructor(model: PrismaClient = db) {
		this._model = model;
	}

	public async create(moduleData: TModule): Promise<TServiceReturn<TPrismaPayloadCreateModule>> {
		const newModule = new Module(moduleData);

		const createdModule = await this._model.module.create({
			include: {
				course: true,
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
				oldId: newModule.oldId,
				name: newModule.name,
				slug: newModule.slug,
				description: newModule.description,
				content: newModule.content,
				marketingContent: newModule.marketingContent,
				videoSourceUrl: newModule.videoSourceUrl,
				marketingVideoUrl: newModule.marketingVideoUrl,
				thumbnailUrl: newModule.thumbnailUrl,
				publicationDate: newModule.publicationDate,
				published: newModule.published,
				course: {
					connect: newModule.courses?.map(course => ({id: course})),
				},
				tags: {
					connectOrCreate: newModule.tags?.map(tag => ({
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
			data: createdModule,
		};
	}

	public async update(id: TUuid, moduleData: TModule): Promise<TServiceReturn<TPrismaPayloadUpdateModule>> {
		const newModule = new Module(moduleData);

		const updatedModule = await this._model.module.update({
			include: {
				course: true,
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
				oldId: newModule.oldId,
				name: newModule.name,
				slug: newModule.slug,
				description: newModule.description,
				content: newModule.content,
				marketingContent: newModule.marketingContent,
				videoSourceUrl: newModule.videoSourceUrl,
				marketingVideoUrl: newModule.marketingVideoUrl,
				thumbnailUrl: newModule.thumbnailUrl,
				publicationDate: newModule.publicationDate,
				published: newModule.published,
				course: {
					connect: newModule.courses?.map(course => ({id: course})),
				},
				tags: {
					connectOrCreate: newModule.tags?.map(tag => ({
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
			status: 'SUCCESSFUL',
			data: updatedModule,
		};
	}

	public async getAll(user: TUser): Promise<TServiceReturn<TPrismaPayloadGetModulesList>> {
		const modules = await this._model.module.findMany({
			where: {
				published: user.roles?.includes('admin') ? undefined : true,
				publicationDate: {
					lte: user.roles?.includes('admin') ? undefined : new Date(),
				},
			},
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

	public async getBySlug(courseSlug: string, slug: string, user: TUser): Promise<TServiceReturn<TPrismaPayloadGetModuleById | undefined>> {
		try {
			const module = await this._model.module.findUnique({
				where: {
					published: user.roles?.includes('admin') ? undefined : true,
					publicationDate: {
						lte: user.roles?.includes('admin') ? undefined : new Date(),
					},
					slug,
				},
				include: {
					course: {
						where: {
							published: user.roles?.includes('admin') ? undefined : true,
							slug: user.roles?.includes('admin') ? undefined : courseSlug,
						},
						select: {
							id: true,
							name: true,
							slug: true,
							delegateAuthTo: {
								select: {
									id: true,
									name: true,
									slug: true,
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
					},
					lessons: {
						where: {
							published: user.roles?.includes('admin') ? undefined : true,
							publicationDate: {
								lte: user.roles?.includes('admin') ? undefined : new Date(),
							},
						},
						orderBy: {
							publicationDate: 'asc',
						},
						select: {
							id: true,
							name: true,
							slug: true,
							description: true,
							thumbnailUrl: true,
							published: true,
							publicationDate: true,
							lessonProgress: {
								where: {
									userId: user.id ?? '',
								},
							},
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
					},
					comments: {
						where: {
							published: user.roles?.includes('admin') ? undefined : true,
						},
						orderBy: {
							createdAt: 'desc',
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
								orderBy: {
									createdAt: 'desc',
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
				},
			});

			if (!module) {
				throw new CustomError('NOT_FOUND', 'Module not found');
			}

			const hasActiveSubscription = user.roles?.includes('admin') || module.course?.some(course => ( // eslint-disable-line @typescript-eslint/prefer-nullish-coalescing
				course.delegateAuthTo?.some(course => (
					course.subscriptions?.length > 0
				))
			));

			const returnableModule = {
				...module,
				content: hasActiveSubscription ? module?.content : module.marketingContent,
				videoSourceUrl: hasActiveSubscription ? module?.videoSourceUrl : module.marketingVideoUrl,
			};

			return {
				status: 'SUCCESSFUL',
				data: returnableModule,
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
