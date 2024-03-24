import {
	type NextFunction, type Request, type Response, Router,
} from 'express';
import {ModuleController} from '../controllers/module.controller.js';
import {validateAuthToken} from '../middlewares/validate-auth-token.middleware.js';
import {verifyRole} from '../middlewares/verify-role.middleware.js';
import {getUserData} from '../middlewares/get-user-data.middleware.js';

// eslint-disable-next-line new-cap
const moduleRouter = Router();

moduleRouter.post(
	'/',
	validateAuthToken,
	(request: Request, response: Response, next: NextFunction) => {
		verifyRole(request, response, next, 'admin');
	},
	async (request: Request, response: Response) => {
		await new ModuleController().create(request, response);
	},
);

moduleRouter.put(
	'/:id',
	validateAuthToken,
	(request: Request, response: Response, next: NextFunction) => {
		verifyRole(request, response, next, 'admin');
	},
	async (request: Request, response: Response) => {
		await new ModuleController().update(request, response);
	},
);

moduleRouter.delete(
	'/:id',
	validateAuthToken,
	(request: Request, response: Response, next: NextFunction) => {
		verifyRole(request, response, next, 'admin');
	},
	async (request: Request, response: Response) => {
		await new ModuleController().delete(request, response);
	},
);

moduleRouter.get(
	'/:courseId/:id',
	getUserData,
	async (request: Request, response: Response) => {
		await new ModuleController().getById(request, response);
	},
);

moduleRouter.get(
	'/:parentId',
	getUserData,
	async (request: Request, response: Response) => {
		await new ModuleController().getList(request, response);
	},
);

export {moduleRouter};
