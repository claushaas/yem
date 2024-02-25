import CourseModel from '../models/course.model';
import {type Prisma} from '@prisma/client';
import testUserRoles from '../utils/testUserRoles';
import type Role from '../types/Role';
import {type UserRoles} from '../types/User';

export default class CourseService {
	private readonly _model: CourseModel;

	constructor(model: CourseModel = new CourseModel()) {
		this._model = model;
	}

	public async create(courseData: Prisma.CourseCreateInput) {
		const createdCourse = await this._model.create(courseData);

		return {
			status: 'CREATED',
			data: createdCourse,
		};
	}

	public async getAll(userRoles: UserRoles = []) {
		if (userRoles.includes('admin')) {
			const courses = await this._model.getAll();

			return {
				status: 'SUCCESSFUL',
				data: courses,
			};
		}

		const rawCourses = await this._model.getPublished();

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
