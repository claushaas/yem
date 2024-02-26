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
		if (userRoles.includes('admin')) {
			const courses = await this._model.course.findMany({
				include: {
					roles: true,
					modules: true,
				},
			});

			return {
				status: 'SUCCESSFUL',
				data: courses,
			};
		}

		const rawCourses = await this._model.course.findMany({
			include: {
				roles: true,
			},
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
}
