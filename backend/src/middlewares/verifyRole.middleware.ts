import {type NextFunction, type Request, type Response} from 'express';
import CustomError from '../utils/CustomError';
import type TypeUser from '../types/User';

const verifyRole = (req: Request, res: Response, next: NextFunction, role: string) => {
	const {user}: {
		user: TypeUser;} = res.locals as {user: TypeUser};

	console.log(user);
	const {roles} = user;

	if (!roles.includes(role)) {
		throw new CustomError('UNAUTHORIZED', 'You do not have the necessary permissions to access this resource');
	}

	next();
};

export default verifyRole;
