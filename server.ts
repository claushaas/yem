import {installGlobals} from '@remix-run/node';
import compression from 'compression';
import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import {viteDevelopmentServer, remixHandler} from './remix-handler.js';
import { executeAndRepeat } from '~/utils/background-task';
import {
    populateCourses,
    populateLessons,
    populateModules,
    populateSubscriptions
} from "~/cache/initial-cache-population";

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
app.all('*', remixHandler)

const FIVE_MINUTES = 1000 * 60 * 5
executeAndRepeat(async () => {
	console.log('Populate cache task started')
	console.log('courses populate started')
	await populateCourses()
	console.log('lessons populate started')
	await populateLessons()
	console.log('modules populate started')
	await populateModules()
	console.log('subscriptions populate started')
	await populateSubscriptions()
	console.log('Populate cache task started')
}, FIVE_MINUTES)

const port = process.env.APP_PORT ?? 3001;
app.listen(port, () => {
	console.log(`Express server listening at http://localhost:${port}`);
});
