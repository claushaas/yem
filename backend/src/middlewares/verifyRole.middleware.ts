import {type NextFunction, type Request, type Response} from 'express';
import CustomError from '../utils/CustomError.js';
import {type TypeUser} from '../types/User.js';
import {logger} from '../utils/Logger.js';

const verifyRole = (req: Request, res: Response, next: NextFunction, role: string) => {
	logger.logDebug('Verifying role');
	const data = res.locals as {user: TypeUser};

	const roles = data?.user?.roles;

	if (!roles?.includes(role)) {
		logger.logError('Dont have necessary permissions');
		throw new CustomError('UNAUTHORIZED', 'You do not have the necessary permissions to access this resource');
	}

	logger.logDebug('Role verified');
	next();
};

export default verifyRole;
