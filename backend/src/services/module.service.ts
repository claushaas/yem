import {PrismaClient} from '@prisma/client';
import {type TypeModule} from '../types/Module';
import Module from '../entities/module.entity';
import type TypeUser from '../types/User';
import {type UserRoles} from '../types/User';
import {type TypeUuid} from '../types/UUID';
import type Role from '../types/Role';
import CustomError from '../utils/CustomError';
import {type TypeServiceReturn} from '../types/ServiceReturn';

export default class ModuleService {
	private readonly _model: PrismaClient;

	constructor(model: PrismaClient = new PrismaClient()) {
		this._model = model;
	}

	public async create(moduleData: TypeModule): Promise<TypeServiceReturn<unknown>> {
		const newModule = new Module(moduleData);

		const createdModule = await this._model.module.create({
			include: {
				course: true,
				belongToModules: true,
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
				belongToModules: {
					connect: newModule.belongToModules?.map(module => ({id: module})),
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

	public async update(id: TypeUuid, moduleData: TypeModule): Promise<TypeServiceReturn<unknown>> {
		const newModule = new Module(moduleData);

		const updatedModule = await this._model.module.update({
			include: {
				course: true,
				belongToModules: true,
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
				belongToModules: {
					connect: newModule.belongToModules?.map(module => ({id: module})),
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

	public async getList(parentId: TypeUuid, userRoles: UserRoles = []): Promise<TypeServiceReturn<unknown>> {
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

		const moduleWhere = {
			// eslint-disable-next-line @typescript-eslint/naming-convention
			OR: [
				{
					course: {
						some: {
							id: parentId,
						},
					},
				},
				{
					belongToModules: {
						some: {
							id: parentId,
						},
					},
				},
			],
		};

		if (userRoles.includes('admin')) {
			const modules = await this._model.module.findMany({
				select: moduleSelect,
				where: moduleWhere,
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
				...moduleWhere,
				published: true,
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

	public async getById(courseId: TypeUuid, id: TypeUuid, user: TypeUser): Promise<TypeServiceReturn<unknown>> {
		const includeSubModules = {
			select: {
				id: true,
				name: true,
				description: true,
				thumbnailUrl: true,
				published: true,
				publicationDate: true,
			},
		};

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

		if (user.roles.includes('admin')) {
			const module = await this._model.module.findUnique({
				where: {
					id,
				},
				include: {
					subModules: includeSubModules,
					lessons: includeLessons,
					comments: includeComments,
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
				subModules: {
					...includeSubModules,
					where: {
						published: true,
					},
				},
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
			},
		});

		if (!rawModule) {
			throw new CustomError('NOT_FOUND', 'Module not found');
		}

		const course = await this._model.course.findUnique({
			where: {
				id: courseId,
			},
			select: {
				id: false,
				name: false,
				description: false,
				content: false,
				videoSourceUrl: false,
				thumbnailUrl: false,
				createdAt: false,
				updatedAt: false,
				publicationDate: false,
				published: false,
				modules: false,
				comments: false,
				tags: false,
				roles: {
					select: {
						name: true,
					},
				},
				subscriptions: {
					where: {
						userId: user.id,
						courseId,
					},
				},
			},
		});

		const hasActiveSubscription = course?.subscriptions.some(subscription => subscription.expiresAt > new Date());

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

	public async delete(id: TypeUuid): Promise<TypeServiceReturn<unknown>> {
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
			data: null,
		};
	}
}
