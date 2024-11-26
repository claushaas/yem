import {PassThrough} from 'node:stream';
import {type AppLoadContext, type EntryContext, ServerRouter} from 'react-router';
import {createReadableStreamFromReadable} from '@react-router/node';
import {isbot} from 'isbot';
import {type RenderToPipeableStreamOptions, renderToPipeableStream} from 'react-dom/server';
import {executeAndRepeat} from './utils/background-task.js';
import {logger} from './utils/logger.util.js';
import {populateCache} from './cache/initial-cache-population.js';

const ABORT_DELAY = 5000;

export default async function handleRequest( // eslint-disable-line max-params
	request: Request,
	responseStatusCode: number,
	responseHeaders: Headers,
	routerContext: EntryContext,
	loadContext: AppLoadContext,
) {
	return new Promise((resolve, reject) => {
		let shellRendered = false;
		const userAgent = request.headers.get('user-agent');

		// Ensure requests from bots and SPA Mode renders wait for all content to load before responding
		// https://react.dev/reference/react-dom/server/renderToPipeableStream#waiting-for-all-content-to-load-for-crawlers-and-static-generation
		const readyOption: keyof RenderToPipeableStreamOptions
      = (userAgent && isbot(userAgent)) || routerContext.isSpaMode ? 'onAllReady' : 'onShellReady'; // eslint-disable-line @typescript-eslint/prefer-nullish-coalescing

		const {pipe, abort} = renderToPipeableStream(
			<ServerRouter
				context={routerContext}
				url={request.url}
				abortDelay={ABORT_DELAY}
			/>,
			{
				[readyOption]() {
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
					// eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
					reject(error);
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

const ONE_DAY = 1000 * 60 * 60 * 24;

executeAndRepeat(async () => { // eslint-disable-line @typescript-eslint/no-floating-promises
	logger.logInfo('Populate cache task started');
	await populateCache();
	logger.logInfo('Populate cache task finished');
}, ONE_DAY);
