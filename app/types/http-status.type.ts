export type THttpStatus =
	| 'SUCCESSFUL'
	| 'CREATED'
	| 'INVALID_DATA'
	| 'NOT_FOUND'
	| 'UNAUTHORIZED'
	| 'UNPROCESSABLE_ENTITY'
	| 'NO_CONTENT'
	| 'UNKNOWN'
	| 'CONFLICT';
export type THttpStatusCode =
	| 200
	| 201
	| 400
	| 404
	| 401
	| 422
	| 500
	| 204
	| 409;
