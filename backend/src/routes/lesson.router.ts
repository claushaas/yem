import e, {
	type Request, Router, type Response, type NextFunction,
} from 'express';
import validateAuthToken from '../middlewares/validateAuthToken.middleware';
import verifyRole from '../middlewares/verifyRole.middleware';
import LessonController from '../controllers/lesson.controller';
import getUserData from '../middlewares/getUserData.middleware';

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
	'/:moduleId',
	getUserData,
	async (req: Request, res: Response) => {
		await new LessonController().getList(req, res);
	},
);

export default lessonRouter;
