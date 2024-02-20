import {type Request, Router, type Response} from 'express';
import CourseController from '../controllers/course.controller';

const courseRouter = Router();

courseRouter.post(
	'/',
	async (req: Request, res: Response) => {
		await new CourseController().create(req, res);
	},
);

export default courseRouter;
