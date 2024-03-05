import {type TypeHttpStatusCode} from './HTTPStatus';

type TypeCustomError = {
	statusCode?: TypeHttpStatusCode;
} & Error;
export default TypeCustomError;
