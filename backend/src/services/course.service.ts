import {PrismaClient} from '@prisma/client';
import type TypeUser from '../types/User';
import {type UserRoles} from '../types/User';
import Course from '../entities/course.entity';
import type TypeCourse from '../types/Course';
import CustomError from '../utils/CustomError';
import {type TypeServiceReturn} from '../types/ServiceReturn';

export default class CourseService {
	private readonly _model: PrismaClient;

	constructor(model: PrismaClient = new PrismaClient()) {
		this._model = model;
	}

	public async create(courseData: TypeCourse): Promise<TypeServiceReturn<unknown>> {
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
						where: {name: role},
						create: {name: role},
					})),
				},
				tags: {
					connectOrCreate: newCourse.tags?.map(tag => ({
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
			data: createdCourse,
		};
	}

	public async getAll(userRoles: UserRoles = []): Promise<TypeServiceReturn<unknown>> {
		const select = {
			name: true,
			description: true,
			thumbnailUrl: true,
			publicationDate: true,
			published: true,
		};

		if (userRoles.includes('admin')) {
			const courses = await this._model.course.findMany({
				select,
			});

			if (courses.length === 0) {
				throw new CustomError('NOT_FOUND', 'No courses found');
			}

			return {
				status: 'SUCCESSFUL',
				data: courses,
			};
		}

		const coursesForStudents = await this._model.course.findMany({
			select,
			where: {
				published: true,
			},
		});

		if (coursesForStudents.length === 0) {
			throw new CustomError('NOT_FOUND', 'No courses found');
		}

		return {
			status: 'SUCCESSFUL',
			data: coursesForStudents,
		};
	}

	public async getById(id: string, user: TypeUser): Promise<TypeServiceReturn<unknown>> {
		const includeRoles = {
			select: {
				name: true,
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

		if (user.roles.includes('admin')) {
			const course = await this._model.course.findUnique({
				include: {
					roles: includeRoles,
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
				subscriptions: {
					where: {
						userId: user.id,
						courseId: id,
					},
				},
				roles: includeRoles,
				modules: {
					...includeModules,
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

		if (!rawCourse) {
			throw new CustomError('NOT_FOUND', 'Course not found');
		}

		const hasActiveSubscription = rawCourse.subscriptions.some(subscription => subscription.expiresAt > new Date());

		const returnableCourse = {
			...rawCourse,
			content: hasActiveSubscription ? rawCourse?.content : '',
			videoSourceUrl: hasActiveSubscription ? rawCourse?.videoSourceUrl : '',
		};

		return {
			status: 'SUCCESSFUL',
			data: returnableCourse,
		};
	}

	public async update(id: string, courseData: TypeCourse): Promise<TypeServiceReturn<unknown>> {
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
						where: {name: role},
						create: {name: role},
					})),
				},
				tags: {
					connectOrCreate: courseToUpdate.tags?.map(tag => ({
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

		if (!updatedCourse) {
			throw new CustomError('NOT_FOUND', `Course with id ${id} not found`);
		}

		return {
			status: 'SUCCESSFUL',
			data: updatedCourse,
		};
	}

	public async delete(id: string): Promise<TypeServiceReturn<unknown>> {
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
