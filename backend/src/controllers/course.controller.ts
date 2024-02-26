import {type Request, type Response} from 'express';
import CourseService from '../services/course.service';
import mapStatusHttp from '../utils/mapStatusHttp';
import type TypeUser from '../types/User';
import type TypeCourse from '../types/Course';

export default class CourseController {
	private readonly _service: CourseService;

	constructor(service: CourseService = new CourseService()) {
		this._service = service;
	}

	public async create(req: Request, res: Response) {
		const courseData = req.body as TypeCourse;

		const {status, data} = await this._service.create(courseData);

		const statusCode = mapStatusHttp(status);

		return res.status(statusCode).json(data);
	}

	public async getAll(req: Request, res: Response) {
		const {roles: userRoles} = res.locals.user as TypeUser;

		const {status, data} = await this._service.getAll(userRoles);

		const statusCode = mapStatusHttp(status);

		return res.status(statusCode).json(data);
	}
}
