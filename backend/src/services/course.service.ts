import {PrismaClient} from '@prisma/client';
import testUserRoles from '../utils/testUserRoles';
import type Role from '../types/Role';
import {type UserRoles} from '../types/User';
import Course from '../entities/course.entity';
import type TypeCourse from '../types/Course';

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
		const include = {
			roles: {
				select: {
					name: true,
				},
			},
			modules: {
				select: {
					id: true,
					name: true,
					description: true,
					thumbnailUrl: true,
					published: true,
				},
			},
		};

		if (userRoles.includes('admin')) {
			const course = await this._model.course.findUnique({
				include,
				where: {
					id,
				},
			});

			return {
				status: 'SUCCESSFUL',
				data: course,
			};
		}

		const rawCourse = await this._model.course.findUnique({
			include,
			where: {
				id,
				published: true,
			},
		});

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
			},
		});

		return {
			status: 'SUCCESSFUL',
			data: updatedCourse,
		};
	}

	public async delete(id: string) {
		await this._model.course.update({
			where: {
				id,
			},
			data: {
				published: false,
			},
		});

		return {
			status: 'NO_CONTENT',
			data: null,
		};
	}
}
