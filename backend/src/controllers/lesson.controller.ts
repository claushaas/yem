import {type Request, type Response} from 'express';
import mapStatusHttp from '../utils/mapStatusHttp.js';
import LessonService from '../services/lesson.service.js';
import {type TypeUser} from '../types/User.js';
import {type TypeLesson} from '../types/Lesson.js';

export default class LessonController {
	private readonly _service: LessonService;

	constructor(service: LessonService = new LessonService()) {
		this._service = service;
	}

	public async create(req: Request, res: Response) {
		const lessonData = req.body as TypeLesson;

		const {status, data} = await this._service.create(lessonData);

		const statusCode = mapStatusHttp(status);

		return res.status(statusCode).json(data);
	}

	public async update(req: Request, res: Response) {
		const lessonData = req.body as TypeLesson;
		const {id} = req.params;

		const {status, data} = await this._service.update(id, lessonData);

		const statusCode = mapStatusHttp(status);

		return res.status(statusCode).json(data);
	}

	public async delete(req: Request, res: Response) {
		const {id} = req.params;

		const {status, data} = await this._service.delete(id);

		const statusCode = mapStatusHttp(status);

		return res.status(statusCode).json(data);
	}

	public async getList(req: Request, res: Response) {
		const {moduleId} = req.params;
		const {user} = res.locals as {user: TypeUser};

		const {status, data} = await this._service.getList(moduleId, user);

		const statusCode = mapStatusHttp(status);

		return res.status(statusCode).json(data);
	}

	public async getById(req: Request, res: Response) {
		const {courseId, lessonId} = req.params;
		const {user} = res.locals as {user: TypeUser};

		const {status, data} = await this._service.getById(courseId, lessonId, user);

		const statusCode = mapStatusHttp(status);

		return res.status(statusCode).json(data);
	}
}
