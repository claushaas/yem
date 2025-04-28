import { createCookieSessionStorage } from 'react-router';

export const {
	getSession: getUserSession,
	commitSession: commitUserSession,
	destroySession: destroyUserSession,
} = createCookieSessionStorage({
	cookie: {
		httpOnly: process.env.NODE_ENV === 'production',
		maxAge: 1000 * 60 * 60 * 24 * 365,
		name: '__session',
		sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax', // 1 year
		secrets: [process.env.YEM_REMIX_COOKIE_SESSION_SECRET!],
		secure: process.env.NODE_ENV === 'production',
	},
});
