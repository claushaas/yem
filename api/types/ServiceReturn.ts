import {type TypeHttpStatus} from './HTTPStatus.js';

export type TypeServiceReturn<T> = {status: TypeHttpStatus; data: T};
