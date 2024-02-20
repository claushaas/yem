import {type Request, type Response} from 'express';
import CourseService from '../services/course.service';
import {type Prisma} from '@prisma/client';

export default class CourseController {
	private readonly _service: CourseService;

	constructor(service: CourseService = new CourseService()) {
		this._service = service;
	}

	public async create(req: Request, res: Response) {
		const courseData = req.body as Prisma.CourseCreateInput;

		const createdCourse = await this._service.create(courseData);

		res.json(createdCourse);
	}
}
