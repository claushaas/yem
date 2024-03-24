import {
	type Request, Router, type Response, type NextFunction,
} from 'express';
import {validateAuthToken} from '../middlewares/validate-auth-token.middleware.js';
import {verifyRole} from '../middlewares/verify-role.middleware.js';
import {LessonController} from '../controllers/lesson.controller.js';
import {getUserData} from '../middlewares/get-user-data.middleware.js';

// eslint-disable-next-line new-cap
const lessonRouter = Router();

lessonRouter.post(
	'/',
	validateAuthToken,
	(request: Request, response: Response, next: NextFunction) => {
		verifyRole(request, response, next, 'admin');
	},
	async (request: Request, response: Response) => {
		await new LessonController().create(request, response);
	},
);

lessonRouter.put(
	'/:id',
	validateAuthToken,
	(request: Request, response: Response, next: NextFunction) => {
		verifyRole(request, response, next, 'admin');
	},
	async (request: Request, response: Response) => {
		await new LessonController().update(request, response);
	},
);

lessonRouter.delete(
	'/:id',
	validateAuthToken,
	(request: Request, response: Response, next: NextFunction) => {
		verifyRole(request, response, next, 'admin');
	},
	async (request: Request, response: Response) => {
		await new LessonController().delete(request, response);
	},
);

lessonRouter.get(
	'/:courseId/:lessonId',
	getUserData,
	async (request: Request, response: Response) => {
		await new LessonController().getById(request, response);
	},
);

lessonRouter.get(
	'/:moduleId',
	getUserData,
	async (request: Request, response: Response) => {
		await new LessonController().getList(request, response);
	},
);

export {lessonRouter};
