import {PassThrough} from 'node:stream';
import {createReadableStreamFromReadable, type EntryContext} from '@remix-run/node';
import {RemixServer} from '@remix-run/react';
import {isbot} from 'isbot';
import {renderToPipeableStream} from 'react-dom/server';
import {IsBotProvider} from './context/is-bot.context.js';

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
