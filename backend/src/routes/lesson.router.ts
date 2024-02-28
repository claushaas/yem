import e, {
	type Request, Router, type Response, type NextFunction,
} from 'express';
import validateAuthToken from '../middlewares/validateAuthToken.middleware';
import verifyRole from '../middlewares/verifyRole.middleware';
import LessonController from '../controllers/lesson.controller';

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

export default lessonRouter;
