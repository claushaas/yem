import express from 'express';
import 'express-async-errors'; // eslint-disable-line import/no-unassigned-import
import cookieParser from 'cookie-parser';
import {router} from './api/routes/index.js';
import {errorMiddleware} from './api/middlewares/error.middleware.js';
import {logger} from './api/utils/logger.js';
import {morganMiddleware} from './api/middlewares/morgan.middleware.js';
import {limiter} from './api/middlewares/rate-limiter.middleware.js';
import {viteDevelopmentServer, remixHandler} from './api/utils/remix-server-utils.js';

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

		this.app.use(express.json());
		this.app.use(cookieParser());
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

		this.app.use('/api', router);

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
