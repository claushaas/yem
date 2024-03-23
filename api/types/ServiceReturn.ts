import {type THttpStatus} from './HTTPStatus.js';

export type TServiceReturn<T> = {status: THttpStatus; data: T};
