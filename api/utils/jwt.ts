import JWT from 'jsonwebtoken';

const secret: JWT.Secret = process.env.JWT_SECRET ?? '';

const jwtConfig: JWT.SignOptions = {
	expiresIn: '1y',
	algorithm: 'HS256',
	encoding: 'utf8',
};

export const generateToken = (payload: JWT.JwtPayload): string => JWT.sign(payload, secret, jwtConfig);

export const verifyToken = (token: string): JWT.JwtPayload | string => {
	try {
		return JWT.verify(token, secret);
	} catch {
		return 'Token must be a valid token';
	}
};

