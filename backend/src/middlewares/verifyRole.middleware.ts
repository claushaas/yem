import {type NextFunction, type Request, type Response} from 'express';
import CustomError from '../utils/CustomError';
import type User from '../types/User';

const verifyRole = (req: Request, res: Response, next: NextFunction, role: string) => {
	const {user} = res.locals as {user: User};

	const {roles} = user;

	if (!roles?.includes(role)) {
		throw new CustomError('UNAUTHORIZED', 'You do not have the necessary permissions to access this resource');
	}

	next();
};

export default verifyRole;
