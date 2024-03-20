import {createCookieSessionStorage} from '@remix-run/node';

export const {
	getSession: getUserSession,
	commitSession: commitUserSession,
	destroySession: destroyUserSession,
} = createCookieSessionStorage({
	cookie: {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		name: '__session',
		maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
		secrets: [process.env.YEM_REMIX_COOKIE_SESSION_SECRET!],
		sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'none',
	},
});
