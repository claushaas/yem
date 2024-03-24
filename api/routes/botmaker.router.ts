import {
	type Request, Router, type Response, type NextFunction,
} from 'express';
import {BotmakerController} from '../controllers/botmaker.controller.js';
import {validateAuthToken} from '../middlewares/validate-auth-token.middleware.js';
import {verifyRole} from '../middlewares/verify-role.middleware.js';

// eslint-disable-next-line new-cap
const botmakerRouter = Router();

botmakerRouter.use(validateAuthToken);
botmakerRouter.use((request: Request, response: Response, next: NextFunction) => {
	verifyRole(request, response, next, 'admin');
});

botmakerRouter.post(
	'/send-whatsapp-template-message',
	async (request: Request, response: Response) => {
		await new BotmakerController().sendWhatsappTemplateMessate(request, response);
	},
);

botmakerRouter.post(
	'/add-to-blacklist',
	async (request: Request, response: Response) => {
		await new BotmakerController().addToBlacklist(request, response);
	},
);

export {
	botmakerRouter,
};
