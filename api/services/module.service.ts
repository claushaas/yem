import {type PrismaClient} from '@prisma/client';
import {
	type TPrismaPayloadCreateModule, type TModule, type TPrismaPayloadUpdateModule, type TPrismaPayloadGetModulesList, type TPrismaPayloadGetModuleById,
} from '../types/module.type.js';
import {Module} from '../entities/module.entity.js';
import {type TUser, type TUserRoles} from '../types/user.type.js';
import {type TUuid} from '../types/uuid.type.js';
import {CustomError} from '../utils/custom-error.js';
import {type TServiceReturn} from '../types/service-return.type.js';
import {db} from '../database/db.js';

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
				name: newModule.name,
				description: newModule.description,
				content: newModule.content,
				videoSourceUrl: newModule.videoSourceUrl,
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
				name: newModule.name,
				description: newModule.description,
				content: newModule.content,
				videoSourceUrl: newModule.videoSourceUrl,
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

	public async getList(parentId: TUuid, userRoles: TUserRoles = []): Promise<TServiceReturn<TPrismaPayloadGetModulesList>> {
		const moduleSelect = {
			name: true,
			description: true,
			thumbnailUrl: true,
			publicationDate: true,
			published: true,
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
		};

		if (userRoles.includes('admin')) {
			const modules = await this._model.module.findMany({
				select: moduleSelect,
				where: {
					course: {
						some: {
							id: parentId,
						},
					},
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

		const modulesForStudents = await this._model.module.findMany({
			select: moduleSelect,
			where: {
				published: true,
				course: {
					some: {
						id: parentId,
					},
				},
			},
		});

		if (modulesForStudents.length === 0) {
			throw new CustomError('NOT_FOUND', 'No modules found');
		}

		return {
			status: 'SUCCESSFUL',
			data: modulesForStudents,
		};
	}

	public async getById(courseId: TUuid, id: TUuid, user: TUser): Promise<TServiceReturn<TPrismaPayloadGetModuleById>> {
		const includeTags = {
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
		};

		const includeLessons = {
			select: {
				id: true,
				name: true,
				description: true,
				thumbnailUrl: true,
				published: true,
				publicationDate: true,
				tags: includeTags,
			},
		};

		const includeComments = {
			select: {
				id: true,
				content: true,
				createdAt: true,
				userId: true,
				responses: {
					select: {
						id: true,
						content: true,
						createdAt: true,
						userId: true,
					},
				},
			},
		};

		const includeCourse = {
			where: {
				id: courseId,
			},
			select: {
				id: true,
				name: true,
				subscriptions: {
					where: {
						userId: user.id,
						expiresAt: {
							gte: new Date(),
						},
					},
				},
			},
		};

		if (user.roles?.includes('admin')) {
			const module = await this._model.module.findUnique({
				where: {
					id,
				},
				include: {
					lessons: includeLessons,
					comments: includeComments,
					course: includeCourse,
				},
			});

			if (!module) {
				throw new CustomError('NOT_FOUND', 'Module not found');
			}

			return {
				status: 'SUCCESSFUL',
				data: module,
			};
		}

		const rawModule = await this._model.module.findUnique({
			where: {
				id,
				published: true,
			},
			include: {
				lessons: {
					...includeLessons,
					where: {
						published: true,
					},
				},
				comments: {
					...includeComments,
					select: {
						...includeComments.select,
						responses: {
							...includeComments.select.responses,
							where: {
								published: true,
							},
						},
					},
					where: {
						published: true,
					},
				},
				course: includeCourse,
			},
		});

		if (!rawModule) {
			throw new CustomError('NOT_FOUND', 'Module not found');
		}

		const hasActiveSubscription = rawModule.course?.some(course => course.subscriptions.length > 0);

		const returnableModule = {
			...rawModule,
			content: hasActiveSubscription ? rawModule?.content : '',
			videoSourceUrl: hasActiveSubscription ? rawModule?.videoSourceUrl : '',
		};

		return {
			status: 'SUCCESSFUL',
			data: returnableModule,
		};
	}

	public async delete(id: TUuid): Promise<TServiceReturn<string>> {
		const module = await this._model.module.update({
			where: {
				id,
			},
			data: {
				published: false,
			},
		});

		if (!module) {
			throw new CustomError('NOT_FOUND', `Module with id ${id} not found`);
		}

		return {
			status: 'NO_CONTENT',
			data: 'Module unpublished',
		};
	}
}
