import {type THttpStatusCode} from './HTTPStatus.js';

export type TCustomError = {
	statusCode?: THttpStatusCode;
} & Error;
