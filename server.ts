import {installGlobals} from '@remix-run/node';
import compression from 'compression';
import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import {viteDevelopmentServer, remixHandler} from './remix-handler.js';

installGlobals();

const app = express();

app.use(compression());
app.use(
	helmet({
		xPoweredBy: false,
		referrerPolicy: {policy: 'same-origin'},
		crossOriginEmbedderPolicy: false,
		contentSecurityPolicy: false,
	}),
);

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
app.use(express.static('build/client', {maxAge: '1y'}));

app.use(morgan('tiny'));

// Handle SSR requests
app.all('*', remixHandler);

const port = process.env.APP_PORT ?? 3001;
app.listen(port, () => {
	console.log(`Express server listening at http://localhost:${port}`);
});
