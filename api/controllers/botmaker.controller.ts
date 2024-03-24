import {type Request, type Response} from 'express';
import {BotmakerService} from '../services/botmaker.service.js';
import {mapStatusHttp} from '../utils/map-status-http.js';
import {type TWhatsappIntent} from '../types/whatsapp-intent.type.js';

export class BotmakerController {
	private readonly _service: BotmakerService;

	constructor(service: BotmakerService = new BotmakerService()) {
		this._service = service;
	}

	public async sendWhatsappTemplateMessate(
		request: Request,
		response: Response,
	) {
		const {userPhoneNumber, whatsappTemplateName, variables}
      = request.body as TWhatsappIntent;

		const {status, data} = await this._service.sendWhatsappTemplateMessate(
			userPhoneNumber,
			whatsappTemplateName,
			variables,
		);

		const statusCode = mapStatusHttp(status);

		return response.status(statusCode).json(data);
	}

	public async addToBlacklist(request: Request, response: Response) {
		const {phoneNumber} = request.body as {phoneNumber: string};

		const {status, data} = await this._service.addToBlackList(phoneNumber);

		const statusCode = mapStatusHttp(status);

		return response.status(statusCode).json(data);
	}
}
