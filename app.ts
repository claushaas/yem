import express from 'express';
import 'express-async-errors';
import {router} from './api/routes/index.js';
import {errorMiddleware} from './api/middlewares/error.middleware.js';
import cookieParser from 'cookie-parser';
import {logger} from './api/utils/Logger.js';
import {morganMiddleware} from './api/middlewares/morgan.middleware.js';
import {limiter} from './api/middlewares/rateLimiter.middleware.js';
import {viteDevServer, remixHandler} from './api/utils/remixServerUtils.js';

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

		if (viteDevServer) {
			this.app.use(viteDevServer.middlewares);
		} else {
			// Vite fingerprints its assets so we can cache forever.
			this.app.use(
				'/assets',
				express.static('build/client/assets', {immutable: true, maxAge: '1y'}),
			);
		}

		this.app.use(express.static('build/client', {maxAge: '1h'}));

		this.app.use('/api', router);

		this.app.get('/health', (_req, res) => {
			logger.logInfo('Health check');
			res.json({ok: true});
		});

		this.app.all('*', remixHandler);
	}

	private initializeErrorHandling() {
		this.app.use(errorMiddleware);
	}
}
