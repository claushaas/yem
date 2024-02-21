import {type Request, type Response, Router} from 'express';
import UserController from '../controllers/user.controller';

const userRouter = Router();

userRouter.post(
	'/login',
	async (req: Request, res: Response) => {
		await new UserController().login(req, res);
	},
);

export default userRouter;

