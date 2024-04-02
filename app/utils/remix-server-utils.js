import {createRequestHandler} from '@remix-run/express';

export const viteDevelopmentServer = process.env.NODE_ENV === 'production' ? undefined : await import('vite').then(vite => vite.createServer({
	server: {
		middlewareMode: true,
		watch: {
			ignored: ['!**/node_modules/@newrelic/**'],
		},
	},
	optimizeDeps: {
		exclude: ['newrelic', '@newrelic'],
	},
}));

export const remixHandler = createRequestHandler({
	build: viteDevelopmentServer
		? () => viteDevelopmentServer.ssrLoadModule('virtual:remix/server-build')
		: await import('../../server/index.js'),
});
