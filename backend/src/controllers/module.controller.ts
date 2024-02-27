import {type Request, type Response} from 'express';
import mapStatusHttp from '../utils/mapStatusHttp';
import ModuleService from '../services/module.service';
import {type TypeModule} from '../types/Module';
import type TypeUser from '../types/User';

export default class ModuleController {
	private readonly _service: ModuleService;

	constructor(service: ModuleService = new ModuleService()) {
		this._service = service;
	}

	public async create(req: Request, res: Response) {
		const moduleData = req.body as TypeModule;

		const {status, data} = await this._service.create(moduleData);

		const statusCode = mapStatusHttp(status);

		return res.status(statusCode).json(data);
	}

	public async getList(req: Request, res: Response) {
		const {roles: userRoles} = res.locals.user as TypeUser;
		const {courseId, parentId} = req.params;

		const {status, data} = await this._service.getList(courseId, parentId, userRoles);

		const statusCode = mapStatusHttp(status);

		return res.status(statusCode).json(data);
	}

	public async getById(req: Request, res: Response) {
		const {id} = req.params;
		const {roles: userRoles} = res.locals.user as TypeUser;

		const {status, data} = await this._service.getById(id, userRoles);

		const statusCode = mapStatusHttp(status);

		return res.status(statusCode).json(data);
	}

	// Public async update(req: Request, res: Response) {
	// 	const {id} = req.params;
	// 	const moduleData = req.body as TypeModule;

	// 	const {status, data} = await this._service.update(id, moduleData);

	// 	const statusCode = mapStatusHttp(status);

	// 	return res.status(statusCode).json(data);
	// }

	// public async delete(req: Request, res: Response) {
	// 	const {id} = req.params;

	// 	const {status, data} = await this._service.delete(id);

	// 	const statusCode = mapStatusHttp(status);

	// 	return res.status(statusCode).json(data);
	// }
}
