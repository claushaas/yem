import {createRequestHandler} from '@remix-run/express';
import {installGlobals} from '@remix-run/node';
import compression from 'compression';
import express from 'express';
import morgan from 'morgan';
import helmet from "helmet";

installGlobals();

const viteDevelopmentServer
  = process.env.NODE_ENV === 'production' ? undefined : await import('vite').then(vite => vite.createServer({server: {middlewareMode: true}}));

const remixHandler = createRequestHandler({
	build: viteDevelopmentServer
		? () => viteDevelopmentServer.ssrLoadModule('virtual:remix/server-build')
		: await import('./build/server/index.js'),
});

const app = express();

app.use(compression());
app.use(helmet());

// Handle asset requests
if (viteDevelopmentServer) {
	app.use(viteDevelopmentServer.middlewares);
} else {
	// Vite fingerprints its assets so we can cache forever.
	app.use(
		'/assets',
		express.static('build/client/assets', {immutable: true, maxAge: '1y'}),
	);
}

// Everything else (like favicon.ico) is cached for an hour. You may want to be
// more aggressive with this caching.
app.use(express.static('build/client', {maxAge: '1h'}));

app.use(morgan('tiny'));

// Handle SSR requests
app.all('*', remixHandler);

const port = process.env.APP_PORT || 3001;
app.listen(port, () =>
	console.log(`Express server listening at http://localhost:${port}`),
);


