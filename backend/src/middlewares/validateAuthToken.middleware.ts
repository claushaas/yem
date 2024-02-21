import {type NextFunction, type Request, type Response} from 'express';
import {verifyToken} from '../utils/jwt';
import CustomError from '../utils/CustomError';

const validateAuthToken = (req: Request, res: Response, next: NextFunction) => {
	const {authorization} = req.headers;

	if (!authorization) {
		throw new CustomError('UNAUTHORIZED', 'Token not found');
	}

	const [, token] = authorization.split(' ');

	if (!token) {
		throw new CustomError('UNAUTHORIZED', 'Token must be a valid token');
	}

	try {
		const decoded = verifyToken(token);

		console.log(decoded);

		res.locals.user = decoded;

		next();
	} catch (error) {
		throw new CustomError('UNAUTHORIZED', 'Token must be a valid token');
	}
};

export default validateAuthToken;
