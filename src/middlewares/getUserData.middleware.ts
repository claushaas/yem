import {type NextFunction, type Request, type Response} from 'express';
import {verifyToken} from '../utils/jwt.js';
import {type TypeUser} from '../types/User.js';
import {logger} from '../utils/Logger.js';

const getUserData = (req: Request, res: Response, next: NextFunction) => {
	logger.logDebug('Getting user data');
	const token = req.cookies.access_token as string ?? undefined;

	try {
		const decoded = verifyToken(token);

		res.locals.user = decoded as TypeUser;

		logger.logDebug('User data retrieved');
		next();
	} catch (error) {
		logger.logError('User data not found');
		res.locals.user = undefined;
		next();
	}
};

export default getUserData;
