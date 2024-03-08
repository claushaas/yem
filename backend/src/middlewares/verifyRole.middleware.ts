import {type NextFunction, type Request, type Response} from 'express';
import CustomError from '../utils/CustomError.js';
import {type TypeUser} from '../types/User.js';

const verifyRole = (req: Request, res: Response, next: NextFunction, role: string) => {
	const {user} = res.locals as {user: TypeUser};

	const {roles} = user;

	if (!roles?.includes(role)) {
		throw new CustomError('UNAUTHORIZED', 'You do not have the necessary permissions to access this resource');
	}

	next();
};

export default verifyRole;
