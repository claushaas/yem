import {type THttpStatusCode} from './http-status.type.js';

export type TCustomError = {
	statusCode?: THttpStatusCode;
} & Error;
