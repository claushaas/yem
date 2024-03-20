import {createCookieSessionStorage} from '@remix-run/node';

export const {
	getSession: getUserSession,
	commitSession: commitUserSession,
	destroySession: destroyUserSession,
} = createCookieSessionStorage({
	cookie: {
		name: '__session',
		maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
		// Secrets: ['r3m1xr0ck5'],
		// sameSite: 'lax',
	},
});
