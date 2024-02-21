import {type Request, Router, type Response} from 'express';
import CourseController from '../controllers/course.controller';
import validateAuthToken from '../middlewares/validateAuthToken.middleware';

const courseRouter = Router();

courseRouter.use(validateAuthToken);

courseRouter.post(
	'/',
	async (req: Request, res: Response) => {
		await new CourseController().create(req, res);
	},
);

export default courseRouter;
