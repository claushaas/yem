import type TypeCustomError from '../types/CustomError';
import mapStatusHttp from './mapStatusHttp';

export default class CustomError extends Error implements TypeCustomError {
	statusCode: number;

	constructor(statusCode: string, message: string) {
		super(message);
		this.statusCode = mapStatusHttp(statusCode);
	}
}
