import {type NextFunction, type Request, type Response} from 'express';
import {verifyToken} from '../utils/jwt';

const getUserData = (req: Request, res: Response, next: NextFunction) => {
	const token = req.cookies.access_token as string ?? undefined;

	try {
		const decoded = verifyToken(token);

		res.locals.user = decoded;

		next();
	} catch (error) {
		res.locals.user = undefined;
		next();
	}
};

export default getUserData;
