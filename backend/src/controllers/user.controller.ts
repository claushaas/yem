import {type Request, type Response} from 'express';
import UserService from '../services/user.service.js';
import mapStatusHttp from '../utils/mapStatusHttp.js';
import {type TypeHttpStatus} from '../types/HTTPStatus.js';
import {type TypeUser, type TypeUserCreationAttributes} from '../types/User.js';
import {logger} from '../utils/Logger.js';

export default class UserController {
	private readonly _userService: UserService;

	constructor(service: UserService = new UserService()) {
		this._userService = service;
	}

	public async login(req: Request, res: Response) {
		const {username, password} = req.body as {username: string; password: string};

		const {status, data: {token, userData}} = await this._userService.login(username, password) as {status: TypeHttpStatus; data: {token: string; userData: TypeUser}};

		const statusCode = mapStatusHttp(status);

		return res.status(statusCode)
			.cookie('access_token', token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
			})
			.json({
				userData,
			});
	}

	public logout(_req: Request, res: Response) {
		const statusCode = mapStatusHttp('SUCCESSFUL');

		const user = res.locals.user as TypeUser;

		logger.logInfo(`User ${user.id} logged out successfully`);

		return res
			.status(statusCode)
			.clearCookie('access_token')
			.json({message: 'User logged out successfully'});
	}

	public async create(req: Request, res: Response) {
		const user = req.body as TypeUserCreationAttributes;

		const {status, data} = await this._userService.create(user);

		const statusCode = mapStatusHttp(status);

		return res.status(statusCode).json(data);
	}
}
