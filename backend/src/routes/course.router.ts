import {
	type Request, Router, type Response, type NextFunction,
} from 'express';
import CourseController from '../controllers/course.controller';
import validateAuthToken from '../middlewares/validateAuthToken.middleware';
import verifyRole from '../middlewares/verifyRole.middleware';

const courseRouter = Router();

courseRouter.post(
	'/',
	validateAuthToken,
	(req: Request, res: Response, next: NextFunction) => {
		verifyRole(req, res, next, 'admin');
	},
	async (req: Request, res: Response) => {
		await new CourseController().create(req, res);
	},
);

courseRouter.get(
	'/',
	async (req: Request, res: Response) => {
		await new CourseController().getAll(req, res);
	},
);

export default courseRouter;
