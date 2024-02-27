import {type Prisma, PrismaClient} from '@prisma/client';
import testUserRoles from '../utils/testUserRoles';
import {type TypeModule} from '../types/Module';
import Module from '../entities/module.entity';

type Test = Prisma.ModuleCreateInput;

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

	// Public async getAll(userRoles: UserRoles = []) {
	// 	const include = {
	// 		lessons: {
	// 			select: {
	// 				name: true,
	// 			},
	// 		},
	// 	};

	// 	if (userRoles.includes('admin')) {
	// 		const modules = await this._model.module.findMany({
	// 			include,
	// 		});

	// 		return {
	// 			status: 'SUCCESSFUL',
	// 			data: modules,
	// 		};
	// 	}

	// 	const rawModules = await this._model.module.findMany({
	// 		include,
	// 	});

	// 	const modules = rawModules.map(module => {
	// 		const lessons = module.lessons.map(lesson => lesson.name);

	// 		return {
	// 			...module,
	// 			lessons,
	// 		};
	// 	});

	// 	return {
	// 		status: 'SUCCESSFUL',
	// 		data: modules,
	// 	};
	// }

	// public async getById(id: number, userRoles: UserRoles = []) {
	// 	const include = {
	// 		lessons: {
	// 			select: {
	// 				name: true,
	// 			},
	// 		},
	// 	};

	// 	const module = await this._model.module.findUnique({
	// 		include,
	// 		where: {
	// 			id,
	// 		},
	// 	});

	// 	if (!module) {
	// 		return {
	// 			status: 'FAILED',
	// 			message: 'Module not found',
	// 		};
	// 	}

	// 	const lessons = module.lessons.map(lesson => lesson.name);

	// 	return {
	// 		status: 'SUCCESSFUL',
	// 		data: {
	// 			...module,
	// 			lessons,
	// 		},
	// 	};
	// }
}
