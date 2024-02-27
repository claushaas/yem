import {Router} from 'express';
import ModuleController from '../controllers/module.controller';

const moduleRouter = Router();

moduleRouter.post(
	'/',
	async (req, res) => {
		await new ModuleController().create(req, res);
	},
);

export default moduleRouter;
