import {type Request, type Response} from 'express';
import {mapStatusHttp} from '../utils/map-status-http.js';
import {LessonService} from '../services/lesson.service.js';
import {type TUser} from '../types/user-type.js';
import {type TLesson} from '../types/lesson-type.js';

export class LessonController {
	private readonly _service: LessonService;

	constructor(service: LessonService = new LessonService()) {
		this._service = service;
	}

	public async create(request: Request, response: Response) {
		const lessonData = request.body as TLesson;

		const {status, data} = await this._service.create(lessonData);

		const statusCode = mapStatusHttp(status);

		return response.status(statusCode).json(data);
	}

	public async update(request: Request, response: Response) {
		const lessonData = request.body as TLesson;
		const {id} = request.params;

		const {status, data} = await this._service.update(id, lessonData);

		const statusCode = mapStatusHttp(status);

		return response.status(statusCode).json(data);
	}

	public async delete(request: Request, response: Response) {
		const {id} = request.params;

		const {status, data} = await this._service.delete(id);

		const statusCode = mapStatusHttp(status);

		return response.status(statusCode).json(data);
	}

	public async getList(request: Request, response: Response) {
		const {moduleId} = request.params;
		const {user} = response.locals as {user: TUser};

		const {status, data} = await this._service.getList(moduleId, user);

		const statusCode = mapStatusHttp(status);

		return response.status(statusCode).json(data);
	}

	public async getById(request: Request, response: Response) {
		const {courseId, lessonId} = request.params;
		const {user} = response.locals as {user: TUser};

		const {status, data} = await this._service.getById(courseId, lessonId, user);

		const statusCode = mapStatusHttp(status);

		return response.status(statusCode).json(data);
	}
}
