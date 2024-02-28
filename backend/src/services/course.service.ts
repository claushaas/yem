import {PrismaClient} from '@prisma/client';
import testUserRoles from '../utils/testUserRoles';
import type Role from '../types/Role';
import {type UserRoles} from '../types/User';
import Course from '../entities/course.entity';
import type TypeCourse from '../types/Course';
import CustomError from '../utils/CustomError';

export default class CourseService {
	private readonly _model: PrismaClient;

	constructor(model: PrismaClient = new PrismaClient()) {
		this._model = model;
	}

	public async create(courseData: TypeCourse) {
		const newCourse = new Course(courseData);

		const createdCourse = await this._model.course.create({
			include: {
				roles: true,
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
				name: newCourse.name,
				description: newCourse.description,
				content: newCourse.content,
				videoSourceUrl: newCourse.videoSourceUrl,
				thumbnailUrl: newCourse.thumbnailUrl,
				publicationDate: newCourse.publicationDate,
				published: newCourse.published,
				roles: {
					connectOrCreate: newCourse.roles.map(role => ({
						where: {id: undefined, name: role},
						create: {name: role},
					})),
				},
				tags: {
					connectOrCreate: newCourse.tags?.map(tag => ({
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
			data: createdCourse,
		};
	}

	public async getAll(userRoles: UserRoles = []) {
		const include = {
			roles: {
				select: {
					name: true,
				},
			},
		};

		if (userRoles.includes('admin')) {
			const courses = await this._model.course.findMany({
				include,
			});

			if (courses.length === 0) {
				throw new CustomError('NOT_FOUND', 'No courses found');
			}

			return {
				status: 'SUCCESSFUL',
				data: courses,
			};
		}

		const rawCourses = await this._model.course.findMany({
			include,
			where: {
				published: true,
			},
		});

		if (rawCourses.length === 0) {
			throw new CustomError('NOT_FOUND', 'No courses found');
		}

		const returnableCourses = rawCourses.map(course => ({
			...course,
			content: testUserRoles(course.roles as Role[], userRoles) ? course.content : '',
			videoSourceUrl: testUserRoles(course.roles as Role[], userRoles) ? course.videoSourceUrl : '',
		}));

		return {
			status: 'SUCCESSFUL',
			data: returnableCourses,
		};
	}

	public async getById(id: string, userRoles: UserRoles = []) {
		const includeRoles = {
			select: {
				name: true,
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

		const includeModules = {
			select: {
				id: true,
				name: true,
				description: true,
				thumbnailUrl: true,
				published: true,
				publicationDate: true,
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
			const course = await this._model.course.findUnique({
				include: {
					roles: includeRoles,
					tags: includeTags,
					modules: includeModules,
					comments: includeComments,
				},
				where: {
					id,
				},
			});

			if (!course) {
				throw new CustomError('NOT_FOUND', 'Course not found');
			}

			return {
				status: 'SUCCESSFUL',
				data: course,
			};
		}

		const rawCourse = await this._model.course.findUnique({
			where: {
				id,
				published: true,
			},
			include: {
				roles: includeRoles,
				tags: includeTags,
				modules: {
					...includeModules,
					where: {
						published: true,
					},
				},
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

		if (!rawCourse) {
			throw new CustomError('NOT_FOUND', 'Course not found');
		}

		const returnableCourse = {
			...rawCourse,
			content: testUserRoles(rawCourse?.roles as Role[], userRoles) ? rawCourse?.content : '',
			videoSourceUrl: testUserRoles(rawCourse?.roles as Role[], userRoles) ? rawCourse?.videoSourceUrl : '',
		};

		return {
			status: 'SUCCESSFUL',
			data: returnableCourse,
		};
	}

	public async update(id: string, courseData: TypeCourse) {
		const courseToUpdate = new Course(courseData);

		const updatedCourse = await this._model.course.update({
			include: {
				roles: true,
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
				name: courseToUpdate.name,
				description: courseToUpdate.description,
				content: courseToUpdate.content,
				videoSourceUrl: courseToUpdate.videoSourceUrl,
				thumbnailUrl: courseToUpdate.thumbnailUrl,
				publicationDate: courseToUpdate.publicationDate,
				published: courseToUpdate.published,
				roles: {
					connectOrCreate: courseToUpdate.roles.map(role => ({
						where: {id: undefined, name: role},
						create: {name: role},
					})),
				},
				tags: {
					connectOrCreate: courseToUpdate.tags?.map(tag => ({
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

		if (!updatedCourse) {
			throw new CustomError('NOT_FOUND', `Course with id ${id} not found`);
		}

		return {
			status: 'SUCCESSFUL',
			data: updatedCourse,
		};
	}

	public async delete(id: string) {
		const deletedCourse = await this._model.course.update({
			where: {
				id,
			},
			data: {
				published: false,
			},
		});

		if (!deletedCourse) {
			throw new CustomError('NOT_FOUND', 'No course to delete');
		}

		return {
			status: 'NO_CONTENT',
			data: null,
		};
	}
}
