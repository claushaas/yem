import type TypeCustomError from '../types/CustomError.js';
import {type TypeHttpStatus, type TypeHttpStatusCode} from '../types/HTTPStatus.js';
import mapStatusHttp from './mapStatusHttp.js';

export default class CustomError extends Error implements TypeCustomError {
	statusCode: TypeHttpStatusCode;

	constructor(statusCode: TypeHttpStatus, message: string) {
		super(message);
		this.statusCode = mapStatusHttp(statusCode);
	}
}
