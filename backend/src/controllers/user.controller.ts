import {type Request, type Response} from 'express';
import UserService from '../services/user.service';
import mapStatusHttp from '../utils/mapStatusHttp';

export default class UserController {
	private readonly _userService: UserService;

	constructor(service: UserService = new UserService()) {
		this._userService = service;
	}

	public async login(req: Request, res: Response) {
		const {username, password} = req.body as {username: string; password: string};

		const {status, data} = await this._userService.login(username, password);

		const statusCode = mapStatusHttp(status);

		return res.status(statusCode)
			.cookie('access_token', data.token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
			})
			.json({
				userData: data.userData,
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
