import {type TypeHttpStatus} from './HTTPStatus';

export type TypeServiceReturn<T> = {status: TypeHttpStatus; data: T};
