import {type NextFunction, type Request, type Response} from 'express';
import {type TCustomError} from '../types/custom-error.type.js';
import {logger} from '../utils/logger.util.js';

export const errorMiddleware = (error: TCustomError, _request: Request, response: Response, _next: NextFunction) => {
	const statusCode = error.statusCode ?? 500;
	const message = error.message ?? 'Something went wrong';

	logger.logError(`Error: ${message}`);

	return response.status(statusCode).json({message});
};
