import {createRequestHandler} from '@remix-run/express';

export const viteDevelopmentServer
  = process.env.NODE_ENV === 'production' ? undefined : await import('vite').then(async vite => vite.createServer({server: {middlewareMode: true}}));

export const remixHandler = createRequestHandler({
	build: async () => viteDevelopmentServer
		? viteDevelopmentServer.ssrLoadModule('virtual:remix/server-build')
		: import('./build/server/index.js'),
});
