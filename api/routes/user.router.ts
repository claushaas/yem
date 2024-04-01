import {
	// Type Request,
	// type Response,
	Router,
} from 'express';
// Import {UserController} from '../controllers/user.controller.js';

// eslint-disable-next-line new-cap
const userRouter = Router();

// UserRouter.post(
// 	'/login',
// 	async (request: Request, response: Response) => {
// 		await new UserController().login(request, response);
// 	},
// );

// userRouter.get(
// 	'/logout',
// 	(request: Request, response: Response) => new UserController().logout(request, response),
// );

// userRouter.post(
// 	'/new-password',
// 	async (request: Request, response: Response) => new UserController().getNewPassword(request, response),
// );

// userRouter.post(
// 	'/create-or-fail',
// 	async (request: Request, response: Response) => {
// 		await new UserController().createOrFail(request, response);
// 	},
// );

export {userRouter};

