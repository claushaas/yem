import {type Request, type Response} from 'express';
import mapStatusHttp from '../utils/mapStatusHttp';
import LessonService from '../services/lesson.service';
import type TypeUser from '../types/User';
import {type TypeLesson} from '../types/Lesson';

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
}
