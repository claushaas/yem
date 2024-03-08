import {type Request, type Response, Router} from 'express';
import UserController from '../controllers/user.controller.js';
import validateAuthToken from '../middlewares/validateAuthToken.middleware.js';

const userRouter = Router();

userRouter.post(
	'/login',
	async (req: Request, res: Response) => {
		await new UserController().login(req, res);
	},
);

userRouter.get(
	'/logout',
	validateAuthToken,
	(req: Request, res: Response) => new UserController().logout(req, res),
);

userRouter.post(
	'/',
	async (req: Request, res: Response) => {
		await new UserController().create(req, res);
	},
);

export default userRouter;

