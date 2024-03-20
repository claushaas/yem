import {type TypeHttpStatusCode} from './HTTPStatus.js';

type TypeCustomError = {
	statusCode?: TypeHttpStatusCode;
} & Error;
export default TypeCustomError;
