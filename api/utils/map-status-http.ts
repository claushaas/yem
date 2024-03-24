import {type THttpStatusCode, type THttpStatus} from '../types/http-status.type.js';

export function mapStatusHttp(status: THttpStatus): THttpStatusCode {
	switch (status) {
		case 'SUCCESSFUL': {
			return 200;
		}

		case 'CREATED': {
			return 201;
		}

		case 'INVALID_DATA': {
			return 400;
		}

		case 'NOT_FOUND': {
			return 404;
		}

		case 'UNAUTHORIZED': {
			return 401;
		}

		case 'UNPROCESSABLE_ENTITY': {
			return 422;
		}

		case 'NO_CONTENT': {
			return 204;
		}

		case 'CONFLICT': {
			return 409;
		}

		default: {
			return 500;
		}
	}
}
