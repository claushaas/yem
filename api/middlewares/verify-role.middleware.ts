import {type NextFunction, type Request, type Response} from 'express';
import {CustomError} from '../utils/custom-error.js';
import {type TUser} from '../types/user.js';
import {logger} from '../utils/logger.js';

export const verifyRole = (request: Request, response: Response, next: NextFunction, role: string) => {
	logger.logDebug('Verifying role');
	const data = response.locals as {user: TUser};

	const roles = data?.user?.roles;

	if (!roles?.includes(role)) {
		logger.logError('Dont have necessary permissions');
		throw new CustomError('UNAUTHORIZED', 'You do not have the necessary permissions to access this resource');
	}

	logger.logDebug('Role verified');
	next();
};
