import {PassThrough} from 'node:stream';
import HTTP from 'node:http';
import http2 from 'node:http2';
import {createReadableStreamFromReadable, type EntryContext} from '@remix-run/node';
import {RemixServer} from '@remix-run/react';
import {isbot} from 'isbot';
import {renderToPipeableStream} from 'react-dom/server';
import {createExpressApp} from 'remix-create-express-app';
import compression from 'compression';
import helmet from 'helmet';
import morgan from 'morgan';
import express from 'express';
import http2Express from 'http2-express-bridge';
import {IsBotProvider} from './hooks/use-is-bot.hook.js';
import {executeAndRepeat} from './utils/background-task.js';
import {logger} from './utils/logger.util.js';
import {populateCache} from './cache/initial-cache-population.js';

const ABORT_DELAY = 5000;

export default async function handleRequest(
	request: Request,
	responseStatusCode: number,
	responseHeaders: Headers,
	remixContext: EntryContext,
	// This is ignored so we can keep it in the template for visibility.  Feel
	// free to delete this parameter in your app if you're not using it!

	// loadContext: AppLoadContext,
) {
	return isbot(request.headers.get('user-agent') ?? '')
		? handleBotRequest(
			request,
			responseStatusCode,
			responseHeaders,
			remixContext,
		)
		: handleBrowserRequest(
			request,
			responseStatusCode,
			responseHeaders,
			remixContext,
		);
}

async function handleBotRequest(
	request: Request,
	responseStatusCode: number,
	responseHeaders: Headers,
	remixContext: EntryContext,
) {
	return new Promise((resolve, reject) => {
		let shellRendered = false;
		const {pipe, abort} = renderToPipeableStream(
			<IsBotProvider isBot={isbot(request.headers.get('User-Agent') ?? '')}>
				<RemixServer
					context={remixContext}
					url={request.url}
					abortDelay={ABORT_DELAY}
				/>
			</IsBotProvider>,
			{
				onAllReady() {
					shellRendered = true;
					const body = new PassThrough();
					const stream = createReadableStreamFromReadable(body);

					responseHeaders.set('Content-Type', 'text/html');

					resolve(
						new Response(stream, {
							headers: responseHeaders,
							status: responseStatusCode,
						}),
					);

					pipe(body);
				},
				onShellError(error: unknown) {
					if (error instanceof Error) {
						reject(error);
					} else {
						reject(new Error(String(error)));
					}
				},
				onError(error: unknown) {
					responseStatusCode = 500;
					// Log streaming rendering errors from inside the shell.  Don't log
					// errors encountered during initial shell rendering since they'll
					// reject and get logged in handleDocumentRequest.
					if (shellRendered) {
						console.error(error);
					}
				},
			},
		);

		setTimeout(abort, ABORT_DELAY);
	});
}

async function handleBrowserRequest(
	request: Request,
	responseStatusCode: number,
	responseHeaders: Headers,
	remixContext: EntryContext,
) {
	return new Promise((resolve, reject) => {
		let shellRendered = false;
		const {pipe, abort} = renderToPipeableStream(
			<IsBotProvider isBot={isbot(request.headers.get('User-Agent') ?? '')}>
				<RemixServer
					context={remixContext}
					url={request.url}
					abortDelay={ABORT_DELAY}
				/>
			</IsBotProvider>,
			{
				onShellReady() {
					shellRendered = true;
					const body = new PassThrough();
					const stream = createReadableStreamFromReadable(body);

					responseHeaders.set('Content-Type', 'text/html');

					resolve(
						new Response(stream, {
							headers: responseHeaders,
							status: responseStatusCode,
						}),
					);

					pipe(body);
				},
				onShellError(error: unknown) {
					if (error instanceof Error) {
						reject(error);
					} else {
						reject(new Error(String(error)));
					}
				},
				onError(error: unknown) {
					responseStatusCode = 500;
					// Log streaming rendering errors from inside the shell.  Don't log
					// errors encountered during initial shell rendering since they'll
					// reject and get logged in handleDocumentRequest.
					if (shellRendered) {
						console.error(error);
					}
				},
			},
		);

		setTimeout(abort, ABORT_DELAY);
	});
}

export const app = createExpressApp({
	getExpress() {
		return http2Express(express);
	},
	createServer(app) {
		if (process.env.NODE_ENV === 'production') {
			return http2.createSecureServer({allowHTTP1: true},	app);
		}

		return HTTP.createServer(app);
	},
	configure(app) {
		// Setup additional express middleware here
		app.use(compression());
		app.use(
			helmet({
				xPoweredBy: false,
				referrerPolicy: {policy: 'same-origin'},
				crossOriginEmbedderPolicy: false,
				contentSecurityPolicy: false,
			}),
		);
		app.use(morgan('tiny'));
	},
});

const ONE_DAY = 1000 * 60 * 60 * 24;
// eslint-disable-next-line @typescript-eslint/no-floating-promises
executeAndRepeat(async () => {
	logger.logInfo('Populate cache task started');
	await populateCache();
	logger.logInfo('Populate cache task finished');
}, ONE_DAY);
