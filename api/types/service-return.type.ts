import {type THttpStatus} from './http-status.type.js';

export type TServiceReturn<T> = {status: THttpStatus; data: T};
