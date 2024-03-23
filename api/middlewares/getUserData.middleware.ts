import {type NextFunction, type Request, type Response} from 'express';
import {verifyToken} from '../utils/jwt.js';
import {type TUser} from '../types/User.js';
import {logger} from '../utils/Logger.js';

export const getUserData = (req: Request, res: Response, next: NextFunction) => {
	logger.logDebug('Getting user data');
	const token = req.cookies.access_token as string ?? undefined;

	try {
		const decoded = verifyToken(token);

		res.locals.user = decoded as TUser;

		logger.logDebug('User data retrieved');
		next();
	} catch (error) {
		logger.logError('User data not found');
		res.locals.user = undefined;
		next();
	}
};
