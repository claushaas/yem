import {type THttpStatusCode} from './http-status.js';

export type TCustomError = {
	statusCode?: THttpStatusCode;
} & Error;
