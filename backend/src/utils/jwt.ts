import {
	type JwtPayload, type Secret, sign, type SignOptions, verify,
} from 'jsonwebtoken';

const secret: Secret = process.env.JWT_SECRET ?? '';

const jwtConfig: SignOptions = {
	expiresIn: '10d',
	algorithm: 'HS256',
	encoding: 'utf-8',
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
export const generateToken = (payload: JwtPayload): string => sign(payload, secret, jwtConfig);

export const verifyToken = (token: string): JwtPayload | string => {
	try {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-call
		return verify(token, secret);
	} catch (error) {
		return 'Token must be a valid token';
	}
};

