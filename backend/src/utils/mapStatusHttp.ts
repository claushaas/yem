import {type TypeHttpStatusCode, type TypeHttpStatus} from '../types/HTTPStatus.js';

export default function mapStatusHttp(status: TypeHttpStatus): TypeHttpStatusCode {
	switch (status) {
		case 'SUCCESSFUL': return 200;
		case 'CREATED': return 201;
		case 'INVALID_DATA': return 400;
		case 'NOT_FOUND': return 404;
		case 'UNAUTHORIZED': return 401;
		case 'UNPROCESSABLE_ENTITY': return 422;
		case 'NO_CONTENT': return 204;
		default: return 500;
	}
}
