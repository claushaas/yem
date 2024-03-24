import {
	type Request, Router, type Response, type NextFunction,
} from 'express';
import {CourseController} from '../controllers/course.controller.js';
import {validateAuthToken} from '../middlewares/validate-auth-token.middleware.js';
import {getUserData} from '../middlewares/get-user-data.middleware.js';
import {verifyRole} from '../middlewares/verify-role.middleware.js';

// eslint-disable-next-line new-cap
const courseRouter = Router();

courseRouter.post(
	'/',
	validateAuthToken,
	(request: Request, response: Response, next: NextFunction) => {
		verifyRole(request, response, next, 'admin');
	},
	async (request: Request, response: Response) => {
		await new CourseController().create(request, response);
	},
);

courseRouter.get(
	'/',
	getUserData,
	async (request: Request, response: Response) => {
		await new CourseController().getAll(request, response);
	},
);

courseRouter.get(
	'/:id',
	getUserData,
	async (request: Request, response: Response) => {
		await new CourseController().getById(request, response);
	},
);

courseRouter.put(
	'/:id',
	validateAuthToken,
	(request: Request, response: Response, next: NextFunction) => {
		verifyRole(request, response, next, 'admin');
	},
	async (request: Request, response: Response) => {
		await new CourseController().update(request, response);
	},
);

courseRouter.delete(
	'/:id',
	validateAuthToken,
	(request: Request, response: Response, next: NextFunction) => {
		verifyRole(request, response, next, 'admin');
	},
	async (request: Request, response: Response) => {
		await new CourseController().delete(request, response);
	},
);

export {courseRouter};
