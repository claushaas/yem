import {type Request, type Response} from 'express';
import CourseService from '../services/course.service.js';
import mapStatusHttp from '../utils/mapStatusHttp.js';
import {type TUser} from '../types/User.js';
import {type TCourse} from '../types/Course.js';
import SearchService from '#/services/search.service.js';
import {FuzzySearchEngine} from '#/engines/FuzzySearchEngine.js';
import {CourseRepository} from '#/repositories/course.repository.js';
import {logger} from '../utils/Logger.js';

export class CourseController {
	private readonly _service: CourseService;

	constructor(service: CourseService = new CourseService()) {
		this._service = service;
	}

	public async create(req: Request, res: Response) {
		const courseData = req.body as TCourse;

		const {status, data} = await this._service.create(courseData);

		const statusCode = mapStatusHttp(status);

		return res.status(statusCode).json(data);
	}

	public async getAll(_req: Request, res: Response) {
		const {roles: userRoles} = res.locals.user as TUser;

		const {status, data} = await this._service.getAll(userRoles);

		const statusCode = mapStatusHttp(status);

		return res.status(statusCode).json(data);
	}

	public async getById(req: Request, res: Response) {
		const {id} = req.params;
		const user = res.locals.user as TUser;

		const {status, data} = await this._service.getById(id, user);

		const statusCode = mapStatusHttp(status);

		return res.status(statusCode).json(data);
	}

	public async update(req: Request, res: Response) {
		const {id} = req.params;
		const courseData = req.body as TCourse;

		const {status, data} = await this._service.update(id, courseData);

		const statusCode = mapStatusHttp(status);

		return res.status(statusCode).json(data);
	}

	public async delete(req: Request, res: Response) {
		const {id} = req.params;

		const {status, data} = await this._service.delete(id);

		const statusCode = mapStatusHttp(status);

		return res.status(statusCode).json(data);
	}

	public async search(req: Request, res: Response) {
		const {term} = req.params;

		const searchService = new SearchService(new CourseRepository(), new FuzzySearchEngine());
		logger.logDebug(`Searching for term: ${JSON.stringify(await searchService.searchByTerm(term))}`);

		return res.status(200).json(await searchService.searchByTerm(term));
	}
}
