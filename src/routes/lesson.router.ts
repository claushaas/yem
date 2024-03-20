import {
	type Request, Router, type Response, type NextFunction,
} from 'express';
import validateAuthToken from '../middlewares/validateAuthToken.middleware.js';
import verifyRole from '../middlewares/verifyRole.middleware.js';
import LessonController from '../controllers/lesson.controller.js';
import getUserData from '../middlewares/getUserData.middleware.js';

// eslint-disable-next-line new-cap
const lessonRouter = Router();

lessonRouter.post(
	'/',
	validateAuthToken,
	(req: Request, res: Response, next: NextFunction) => {
		verifyRole(req, res, next, 'admin');
	},
	async (req: Request, res: Response) => {
		await new LessonController().create(req, res);
	},
);

lessonRouter.put(
	'/:id',
	validateAuthToken,
	(req: Request, res: Response, next: NextFunction) => {
		verifyRole(req, res, next, 'admin');
	},
	async (req: Request, res: Response) => {
		await new LessonController().update(req, res);
	},
);

lessonRouter.delete(
	'/:id',
	validateAuthToken,
	(req: Request, res: Response, next: NextFunction) => {
		verifyRole(req, res, next, 'admin');
	},
	async (req: Request, res: Response) => {
		await new LessonController().delete(req, res);
	},
);

lessonRouter.get(
	'/:courseId/:lessonId',
	getUserData,
	async (req: Request, res: Response) => {
		await new LessonController().getById(req, res);
	},
);

lessonRouter.get(
	'/:moduleId',
	getUserData,
	async (req: Request, res: Response) => {
		await new LessonController().getList(req, res);
	},
);

export default lessonRouter;
