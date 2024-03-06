import {type Request, type Response} from 'express';
import {BotmakerService} from '../services/botmaker.service';
import mapStatusHttp from '../utils/mapStatusHttp';
import {type TypeWhatsappIntent} from '../types/WhatsappIntent';

export class BotmakerController {
	private readonly _service: BotmakerService;

	constructor(service: BotmakerService = new BotmakerService()) {
		this._service = service;
	}

	public async sendWhatsappTemplateMessate(req: Request, res: Response) {
		const {userPhoneNumber, whatsappTemplateName, variables} = req.body as TypeWhatsappIntent;

		const {status, data} = await this._service.sendWhatsappTemplateMessate(
			userPhoneNumber,
			whatsappTemplateName,
			variables,
		);

		const statusCode = mapStatusHttp(status);

		return res.status(statusCode).json(data);
	}

	public async addToBlacklist(req: Request, res: Response) {
		const {phoneNumber} = req.body as {phoneNumber: string};

		const {status, data} = await this._service.addToBlackList(phoneNumber);

		const statusCode = mapStatusHttp(status);

		return res.status(statusCode).json(data);
	}
}