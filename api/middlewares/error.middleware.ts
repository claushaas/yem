import {type NextFunction, type Request, type Response} from 'express';
import {type TCustomError} from '../types/CustomError.js';
import {logger} from '../utils/Logger.js';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorMiddleware = (error: TCustomError, _req: Request, res: Response, _next: NextFunction) => {
	const statusCode = error.statusCode ?? 500;
	const message = error.message ?? 'Something went wrong';

	logger.logError(`Error: ${message}`);

	return res.status(statusCode).json({message});
};
