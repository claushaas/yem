import {
	type Request, Router, type Response, type NextFunction,
} from 'express';
import {BotmakerController} from '../controllers/botmaker.controller';
import validateAuthToken from '../middlewares/validateAuthToken.middleware';
import verifyRole from '../middlewares/verifyRole.middleware';

const botmakerRouter = Router();

botmakerRouter.use(validateAuthToken);
botmakerRouter.use((req: Request, res: Response, next: NextFunction) => {
	verifyRole(req, res, next, 'admin');
});

botmakerRouter.post(
	'/send-whatsapp-template-message',
	async (req: Request, res: Response) => {
		await new BotmakerController().sendWhatsappTemplateMessate(req, res);
	},
);

botmakerRouter.post(
	'/add-to-blacklist',
	async (req: Request, res: Response) => {
		await new BotmakerController().addToBlacklist(req, res);
	},
);

export {
	botmakerRouter,
};
