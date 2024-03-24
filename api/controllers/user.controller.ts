import {type Request, type Response} from 'express';
import {UserService} from '../services/user.service.js';
import {mapStatusHttp} from '../utils/map-status-http.js';
import {type THttpStatus} from '../types/http-status.js';
import {type TUser, type TUserCreationAttributes} from '../types/user-type.js';
import {logger} from '../utils/logger.js';

export class UserController {
	private readonly _userService: UserService;

	constructor(service: UserService = new UserService()) {
		this._userService = service;
	}

	public async login(request: Request, response: Response) {
		const {username, password} = request.body as {username: string; password: string};

		const {status, data: {token, userData}} = await this._userService.login(username, password) as {status: THttpStatus; data: {token: string; userData: TUser}};

		const statusCode = mapStatusHttp(status);

		return response.status(statusCode)
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

	public logout(_request: Request, response: Response) {
		const statusCode = mapStatusHttp('SUCCESSFUL');

		logger.logInfo('User logged out successfully');

		return response
			.status(statusCode)
			.clearCookie('access_token')
			.json({message: 'User logged out successfully'});
	}

	public async createOrFail(request: Request, response: Response) {
		const user = request.body as TUserCreationAttributes;

		const {status, data} = await this._userService.createOrFail(user);

		const statusCode = mapStatusHttp(status);

		return response.status(statusCode).json(data);
	}

	public async getNewPassword(request: Request, response: Response) {
		const {email} = request.body as {email: string};

		const {status, data} = await this._userService.getNewPassword(email);

		const statusCode = mapStatusHttp(status);

		return response.status(statusCode).json(data);
	}
}
