import {type Request, type Response} from 'express';
import mapStatusHttp from '../utils/mapStatusHttp.js';
import ModuleService from '../services/module.service.js';
import {type TModule} from '../types/Module.js';
import {type TUser} from '../types/User.js';

export class ModuleController {
	private readonly _service: ModuleService;

	constructor(service: ModuleService = new ModuleService()) {
		this._service = service;
	}

	public async create(req: Request, res: Response) {
		const moduleData = req.body as TModule;

		const {status, data} = await this._service.create(moduleData);

		const statusCode = mapStatusHttp(status);

		return res.status(statusCode).json(data);
	}

	public async update(req: Request, res: Response) {
		const {id} = req.params;
		const moduleData = req.body as TModule;

		const {status, data} = await this._service.update(id, moduleData);

		const statusCode = mapStatusHttp(status);

		return res.status(statusCode).json(data);
	}

	public async getList(req: Request, res: Response) {
		const {roles: userRoles} = res.locals.user as TUser;
		const {parentId} = req.params;

		const {status, data} = await this._service.getList(parentId, userRoles);

		const statusCode = mapStatusHttp(status);

		return res.status(statusCode).json(data);
	}

	public async getById(req: Request, res: Response) {
		const {courseId, id} = req.params;
		const user = res.locals.user as TUser;

		const {status, data} = await this._service.getById(courseId, id, user);

		const statusCode = mapStatusHttp(status);

		return res.status(statusCode).json(data);
	}

	public async delete(req: Request, res: Response) {
		const {id} = req.params;

		const {status, data} = await this._service.delete(id);

		const statusCode = mapStatusHttp(status);

		return res.status(statusCode).json(data);
	}
}
