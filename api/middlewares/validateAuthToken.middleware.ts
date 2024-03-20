import {type NextFunction, type Request, type Response} from 'express';
import {verifyToken} from '../utils/jwt.js';
import CustomError from '../utils/CustomError.js';
import {logger} from '../utils/Logger.js';

const validateAuthToken = (req: Request, res: Response, next: NextFunction) => {
	logger.logDebug('Validating token');
	const token = req.cookies.access_token as string ?? undefined;

	if (!token) {
		logger.logError('Token not found');
		throw new CustomError('UNAUTHORIZED', 'Token not found');
	}

	try {
		const decoded = verifyToken(token);

		res.locals.user = decoded;

		logger.logDebug('Token validated');
		next();
	} catch (error) {
		logger.logError('Invalid token');
		throw new CustomError('UNAUTHORIZED', 'Token must be a valid token');
	}
};

export default validateAuthToken;
