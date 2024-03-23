import {type Request, type Response} from 'express';
import UserService from '../services/user.service.js';
import mapStatusHttp from '../utils/mapStatusHttp.js';
import {type THttpStatus} from '../types/HTTPStatus.js';
import {type TUser, type TUserCreationAttributes} from '../types/User.js';
import {logger} from '../utils/Logger.js';

export class UserController {
	private readonly _userService: UserService;

	constructor(service: UserService = new UserService()) {
		this._userService = service;
	}

	public async login(req: Request, res: Response) {
		const {username, password} = req.body as {username: string; password: string};

		const {status, data: {token, userData}} = await this._userService.login(username, password) as {status: THttpStatus; data: {token: string; userData: TUser}};

		const statusCode = mapStatusHttp(status);

		return res.status(statusCode)
			.cookie('access_token', token, {
				httpOnly: process.env.NODE_ENV === 'production',
				secure: process.env.NODE_ENV === 'production',
				maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
				sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'none',
			})
			.json({
				userData,
			});
	}

	public logout(_req: Request, res: Response) {
		const statusCode = mapStatusHttp('SUCCESSFUL');

		logger.logInfo('User logged out successfully');

		return res
			.status(statusCode)
			.clearCookie('access_token')
			.json({message: 'User logged out successfully'});
	}

	public async createOrFail(req: Request, res: Response) {
		const user = req.body as TUserCreationAttributes;

		const {status, data} = await this._userService.createOrFail(user);

		const statusCode = mapStatusHttp(status);

		return res.status(statusCode).json(data);
	}

	public async getNewPassword(req: Request, res: Response) {
		const {email} = req.body as {email: string};

		const {status, data} = await this._userService.getNewPassword(email);

		const statusCode = mapStatusHttp(status);

		return res.status(statusCode).json(data);
	}
}
