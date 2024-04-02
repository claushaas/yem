import express from 'express';
import 'express-async-errors'; // eslint-disable-line import/no-unassigned-import
import {errorMiddleware} from './app/middlewares/error.middleware.js';
import {logger} from './app/utils/logger.util.js';
import {morganMiddleware} from './app/middlewares/morgan.middleware.js';
import {limiter} from './app/middlewares/rate-limiter.middleware.js';
import {viteDevelopmentServer, remixHandler} from './app/utils/remix-server-utils.js';

export default class App {
	public app: express.Express;

	constructor() {
		this.app = express();

		this.initializeMiddlewares();

		this.initializeErrorHandling();
	}

	public start(PORT: string | number): void {
		this.app.listen(PORT, () => {
			logger.logInfo(`Server running on port ${PORT}`);
		});
	}

	private initializeMiddlewares() {
		if (process.env.NODE_ENV === 'production') {
			this.app.use(limiter);
		}

		this.app.use(morganMiddleware);

		if (viteDevelopmentServer) {
			this.app.use(viteDevelopmentServer.middlewares);
		} else {
			// Vite fingerprints its assets so we can cache forever.
			this.app.use(
				'/assets',
				express.static('build/client/assets', {immutable: true, maxAge: '1y'}),
			);
		}

		this.app.use(express.static('build/client', {maxAge: '1h'}));

		this.app.get('/health', (_request, response) => {
			logger.logInfo('Health check');
			response.json({ok: true});
		});

		this.app.all('*', remixHandler);
	}

	private initializeErrorHandling() {
		this.app.use(errorMiddleware);
	}
}
