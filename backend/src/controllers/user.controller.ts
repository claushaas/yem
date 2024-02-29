import {type Request, type Response} from 'express';
import UserService from '../services/user.service';
import mapStatusHttp from '../utils/mapStatusHttp';
import {type TypeHttpStatus} from '../types/HTTPStatus';
import type TypeUser from '../types/User';

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

		return res
			.status(statusCode)
			.clearCookie('access_token')
			.json({message: 'User logged out successfully'});
	}
}
