import {type NextFunction, type Request, type Response} from 'express';
import {verifyToken} from '../utils/jwt.js';
import {type TUser} from '../types/user.type.js';
import {logger} from '../utils/logger.js';

export const getUserData = (request: Request, response: Response, next: NextFunction) => {
	logger.logDebug('Getting user data');
	const token = request.cookies.access_token as string ?? undefined;

	try {
		const decoded = verifyToken(token);

		response.locals.user = decoded as TUser;

		logger.logDebug('User data retrieved');
		next();
	} catch {
		logger.logError('User data not found');
		response.locals.user = undefined;
		next();
	}
};
