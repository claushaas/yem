import {type NextFunction, type Request, type Response} from 'express';
import CustomError from '../utils/CustomError';

const verifyRole = (req: Request, res: Response, next: NextFunction, role: string) => {
	const {user}: {
		user: {
			'custom:roles': string;
		};} = res.locals as {user: {'custom:roles': string}};
	const {'custom:roles': roles}: {'custom:roles': string} = user;

	const rolesArray = roles.split('-');

	if (!rolesArray.includes(role)) {
		throw new CustomError('UNAUTHORIZED', 'You do not have the necessary permissions to access this resource');
	}

	next();
};

export default verifyRole;
