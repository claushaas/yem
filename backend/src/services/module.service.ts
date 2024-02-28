import {PrismaClient} from '@prisma/client';
import testUserRoles from '../utils/testUserRoles';
import {type TypeModule} from '../types/Module';
import Module from '../entities/module.entity';
import {type UserRoles} from '../types/User';
import {type TypeUuid} from '../types/UUID';
import type Role from '../types/Role';

export default class ModuleService {
	private readonly _model: PrismaClient;

	constructor(model: PrismaClient = new PrismaClient()) {
		this._model = model;
	}

	public async create(moduleData: TypeModule) {
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
							id: undefined,
							tagOption: {
								name: tag[0],
							},
							tagValue: {
								name: tag[1],
							},
						},
						create: {
							tagOption: {
								connectOrCreate: {
									where: {
										id: undefined,
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
										id: undefined,
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

	public async update(id: TypeUuid, moduleData: TypeModule) {
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
							id: undefined,
							tagOption: {
								name: tag[0],
							},
							tagValue: {
								name: tag[1],
							},
						},
						create: {
							tagOption: {
								connectOrCreate: {
									where: {
										id: undefined,
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
										id: undefined,
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

	public async getList(courseId: TypeUuid, parentId: TypeUuid, userRoles: UserRoles = []) {
		const moduleInclude = {
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
				include: moduleInclude,
				where: moduleWhere,
			});

			if (modules.length === 0) {
				return {
					status: 'NOT_FOUND',
					message: 'No modules found',
				};
			}

			return {
				status: 'SUCCESSFUL',
				data: modules,
			};
		}

		const rawModules = await this._model.module.findMany({
			include: moduleInclude,
			where: {
				...moduleWhere,
				published: true,
			},
		});

		if (rawModules.length === 0) {
			return {
				status: 'NOT_FOUND',
				message: 'No modules found',
			};
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
			},
		});

		const modules = rawModules.map(module => ({
			...module,
			content: testUserRoles(course?.roles as Role[], userRoles) ? module.content : '',
			videoSourceUrl: testUserRoles(course?.roles as Role[], userRoles) ? module.videoSourceUrl : '',
		}));

		return {
			status: 'SUCCESSFUL',
			data: modules,
		};
	}

	public async getById(courseId: TypeUuid, id: TypeUuid, userRoles: UserRoles = []) {
		const includeSubModules = {
			select: {
				id: true,
				name: true,
				description: true,
				thumbnailUrl: true,
				published: true,
				publicationDate: true,
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
		};

		const includeLessons = {
			select: {
				id: true,
				name: true,
				description: true,
				thumbnailUrl: true,
				published: true,
				publicationDate: true,
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

		if (userRoles.includes('admin')) {
			const module = await this._model.module.findUnique({
				where: {
					id,
				},
				include: {
					subModules: includeSubModules,
					lessons: includeLessons,
					tags: includeTags,
					comments: includeComments,
				},
			});

			if (!module) {
				return {
					status: 'NOT_FOUND',
					message: 'Module not found',
				};
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
				tags: includeTags,
				comments: {
					...includeComments,
					select: {
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

		if (!module) {
			return {
				status: 'NOT_FOUND',
				message: 'Module not found',
			};
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
			},
		});

		const returnableModule = {
			...rawModule,
			content: testUserRoles(course?.roles as Role[], userRoles) ? rawModule?.content : '',
			videoSourceUrl: testUserRoles(course?.roles as Role[], userRoles) ? rawModule?.videoSourceUrl : '',
		};

		return {
			status: 'SUCCESSFUL',
			data: returnableModule,
		};
	}

	public async delete(id: TypeUuid) {
		const module = await this._model.module.update({
			where: {
				id,
			},
			data: {
				published: false,
			},
		});

		if (!module) {
			return {
				status: 'NOT_FOUND',
				message: 'Module not found',
			};
		}

		return {
			status: 'SUCCESSFUL',
			data: module,
		};
	}
}
