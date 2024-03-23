import {type TCustomError} from '../types/CustomError.js';
import {type THttpStatus, type THttpStatusCode} from '../types/HTTPStatus.js';
import mapStatusHttp from './mapStatusHttp.js';

export class CustomError extends Error implements TCustomError {
	statusCode: THttpStatusCode;

	constructor(statusCode: THttpStatus, message: string) {
		super(message);
		this.statusCode = mapStatusHttp(statusCode);
	}
}
