import {type NextFunction, type Request, type Response} from 'express';
import type TypeCustomError from '../types/CustomError';

const errorMiddleware = (error: TypeCustomError, _req: Request, res: Response, _next: NextFunction) => {
	const statusCode = error.statusCode ?? 500;
	const message = error.message ?? 'Something went wrong';

	return res.status(statusCode).json({message});
};

export default errorMiddleware;
