import {createRequestHandler} from '@remix-run/express';
import process from 'process';

export const viteDevServer = process.env.NODE_ENV === 'production' ? undefined : await import('vite').then(vite => vite.createServer({server: {middlewareMode: true}}));

export const remixHandler = createRequestHandler({
	build: viteDevServer
		? () => viteDevServer.ssrLoadModule('virtual:remix/server-build')
		: await import('../../server/index.js'),
});
