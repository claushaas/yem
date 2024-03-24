import {type Request, type Response} from 'express';
import {mapStatusHttp} from '../utils/map-status-http.js';
import {ModuleService} from '../services/module.service.js';
import {type TModule} from '../types/module.type.js';
import {type TUser} from '../types/user.type.js';

export class ModuleController {
	private readonly _service: ModuleService;

	constructor(service: ModuleService = new ModuleService()) {
		this._service = service;
	}

	public async create(request: Request, response: Response) {
		const moduleData = request.body as TModule;

		const {status, data} = await this._service.create(moduleData);

		const statusCode = mapStatusHttp(status);

		return response.status(statusCode).json(data);
	}

	public async update(request: Request, response: Response) {
		const {id} = request.params;
		const moduleData = request.body as TModule;

		const {status, data} = await this._service.update(id, moduleData);

		const statusCode = mapStatusHttp(status);

		return response.status(statusCode).json(data);
	}

	public async getList(request: Request, response: Response) {
		const {roles: userRoles} = response.locals.user as TUser;
		const {parentId} = request.params;

		const {status, data} = await this._service.getList(parentId, userRoles);

		const statusCode = mapStatusHttp(status);

		return response.status(statusCode).json(data);
	}

	public async getById(request: Request, response: Response) {
		const {courseId, id} = request.params;
		const user = response.locals.user as TUser;

		const {status, data} = await this._service.getById(courseId, id, user);

		const statusCode = mapStatusHttp(status);

		return response.status(statusCode).json(data);
	}

	public async delete(request: Request, response: Response) {
		const {id} = request.params;

		const {status, data} = await this._service.delete(id);

		const statusCode = mapStatusHttp(status);

		return response.status(statusCode).json(data);
	}
}
