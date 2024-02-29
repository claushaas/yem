import {
	type NextFunction, type Request, type Response, Router,
} from 'express';
import ModuleController from '../controllers/module.controller';
import validateAuthToken from '../middlewares/validateAuthToken.middleware';
import verifyRole from '../middlewares/verifyRole.middleware';

const moduleRouter = Router();

moduleRouter.post(
	'/',
	validateAuthToken,
	(req: Request, res: Response, next: NextFunction) => {
		verifyRole(req, res, next, 'admin');
	},
	async (req: Request, res: Response) => {
		await new ModuleController().create(req, res);
	},
);

moduleRouter.put(
	'/:id',
	validateAuthToken,
	(req: Request, res: Response, next: NextFunction) => {
		verifyRole(req, res, next, 'admin');
	},
	async (req: Request, res: Response) => {
		await new ModuleController().update(req, res);
	},
);

moduleRouter.delete(
	'/:id',
	validateAuthToken,
	(req: Request, res: Response, next: NextFunction) => {
		verifyRole(req, res, next, 'admin');
	},
	async (req: Request, res: Response) => {
		await new ModuleController().delete(req, res);
	},
);

moduleRouter.get(
	'/:courseId/:id',
	async (req: Request, res: Response) => {
		await new ModuleController().getById(req, res);
	},
);

moduleRouter.get(
	'/:parentId',
	async (req: Request, res: Response) => {
		await new ModuleController().getList(req, res);
	},
);

export default moduleRouter;
