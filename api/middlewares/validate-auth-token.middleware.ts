import {type NextFunction, type Request, type Response} from 'express';
import {verifyToken} from '../utils/jwt.js';
import {CustomError} from '../utils/custom-error.js';
import {logger} from '../utils/logger.util.js';

export const validateAuthToken = (request: Request, response: Response, next: NextFunction) => {
	logger.logDebug('Validating token');
	const token = request.cookies.access_token as string ?? undefined;

	if (!token) {
		logger.logError('Token not found');
		throw new CustomError('UNAUTHORIZED', 'Token not found');
	}

	try {
		const decoded = verifyToken(token);

		response.locals.user = decoded;

		logger.logDebug('Token validated');
		next();
	} catch {
		logger.logError('Invalid token');
		throw new CustomError('UNAUTHORIZED', 'Token must be a valid token');
	}
};
