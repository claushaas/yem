import {type THttpStatus} from './http-status.js';

export type TServiceReturn<T> = {status: THttpStatus; data: T};
