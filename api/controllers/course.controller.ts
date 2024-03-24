import {type Request, type Response} from 'express';
import {CourseService} from '../services/course.service.js';
import {mapStatusHttp} from '../utils/map-status-http.js';
import {type TUser} from '../types/user.type.js';
import {type TCourse} from '../types/course.type.js';
import {logger} from '../utils/logger.js';
import SearchService from '../services/search.service.js';
import {FuzzySearchEngine} from '../engines/fuzzy-search.engine.js';
import {CourseRepository} from '../repositories/course.repository.js';

export class CourseController {
	private readonly _service: CourseService;

	constructor(service: CourseService = new CourseService()) {
		this._service = service;
	}

	public async create(request: Request, response: Response) {
		const courseData = request.body as TCourse;

		const {status, data} = await this._service.create(courseData);

		const statusCode = mapStatusHttp(status);

		return response.status(statusCode).json(data);
	}

	public async getAll(_request: Request, resposne: Response) {
		const {roles: userRoles} = resposne.locals.user as TUser;

		const {status, data} = await this._service.getAll(userRoles);

		const statusCode = mapStatusHttp(status);

		return resposne.status(statusCode).json(data);
	}

	public async getById(request: Request, response: Response) {
		const {id} = request.params;
		const user = response.locals.user as TUser;

		const {status, data} = await this._service.getById(id, user);

		const statusCode = mapStatusHttp(status);

		return response.status(statusCode).json(data);
	}

	public async update(request: Request, response: Response) {
		const {id} = request.params;
		const courseData = request.body as TCourse;

		const {status, data} = await this._service.update(id, courseData);

		const statusCode = mapStatusHttp(status);

		return response.status(statusCode).json(data);
	}

	public async delete(request: Request, response: Response) {
		const {id} = request.params;

		const {status, data} = await this._service.delete(id);

		const statusCode = mapStatusHttp(status);

		return response.status(statusCode).json(data);
	}

	public async search(request: Request, response: Response) {
		const {term} = request.params;

		const searchService = new SearchService(new CourseRepository(), new FuzzySearchEngine());
		logger.logDebug(`Searching for term: ${JSON.stringify(await searchService.searchByTerm(term))}`);

		return response.status(200).json(await searchService.searchByTerm(term));
	}
}
