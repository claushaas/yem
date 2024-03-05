import {type NextFunction, type Request, type Response} from 'express';
import {verifyToken} from '../utils/jwt';
import CustomError from '../utils/CustomError';

const validateAuthToken = (req: Request, res: Response, next: NextFunction) => {
	const token = req.cookies.access_token as string ?? undefined;

	if (!token) {
		throw new CustomError('UNAUTHORIZED', 'Token not found');
	}

	try {
		const decoded = verifyToken(token);

		res.locals.user = decoded;

		next();
	} catch (error) {
		throw new CustomError('UNAUTHORIZED', 'Token must be a valid token');
	}
};

export default validateAuthToken;
