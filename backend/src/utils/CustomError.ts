import type TypeCustomError from '../types/CustomError';
import {type TypeHttpStatus, type TypeHttpStatusCode} from '../types/HTTPStatus';
import mapStatusHttp from './mapStatusHttp';

export default class CustomError extends Error implements TypeCustomError {
	statusCode: TypeHttpStatusCode;

	constructor(statusCode: TypeHttpStatus, message: string) {
		super(message);
		this.statusCode = mapStatusHttp(statusCode);
	}
}
