import express from 'express';
import 'express-async-errors';
import router from './routes';
import errorMiddleware from './middlewares/error.middleware';
import cookieParser from 'cookie-parser';
import {logger} from './utils/Logger';

export default class App {
	public app: express.Express;

	constructor() {
		this.app = express();

		this.initializeMiddlewares();

		this.app.get('/health', (_req, res) => {
			logger.logInfo('Health check');
			res.json({ok: true});
		});

		this.initializeErrorHandling();
	}

	public start(PORT: string | number): void {
		this.app.listen(PORT, () => {
			logger.logInfo(`Server running on port ${PORT}`);
		});
	}

	private initializeMiddlewares() {
		this.app.use(express.json());

		this.app.use(cookieParser());

		this.app.use(router);
	}

	private initializeErrorHandling() {
		this.app.use(errorMiddleware);
	}
}
