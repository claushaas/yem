import {type TCustomError} from '../types/custom-error.type.js';
import {type THttpStatus, type THttpStatusCode} from '../types/http-status.type.js';
import {mapStatusHttp} from './map-status-http.js';

export class CustomError extends Error implements TCustomError {
	statusCode: THttpStatusCode;

	constructor(statusCode: THttpStatus, message: string) {
		super(message);
		this.statusCode = mapStatusHttp(statusCode);
	}
}
