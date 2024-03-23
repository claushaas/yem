import {type Request, type Response, Router} from 'express';
import {UserController} from '../controllers/user.controller.js';

// eslint-disable-next-line new-cap
const userRouter = Router();

userRouter.post(
	'/login',
	async (req: Request, res: Response) => {
		await new UserController().login(req, res);
	},
);

userRouter.get(
	'/logout',
	(req: Request, res: Response) => new UserController().logout(req, res),
);

userRouter.post(
	'/new-password',
	async (req: Request, res: Response) => new UserController().getNewPassword(req, res),
);

userRouter.post(
	'/create-or-fail',
	async (req: Request, res: Response) => {
		await new UserController().createOrFail(req, res);
	},
);

export {userRouter};

