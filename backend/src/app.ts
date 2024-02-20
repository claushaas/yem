import express from 'express';
import 'express-async-errors';
import router from './routes';
import errorMiddleware from './middlewares/error.middleware';

export default class App {
	public app: express.Express;

	constructor() {
		this.app = express();

		this.initializeMiddlewares();

		this.app.get('/health', (req, res) => res.json({ok: true}));

		this.initializeErrorHandling();
	}

	public start(PORT: string | number): void {
		this.app.listen(PORT, () => {
			console.log(`Running on port ${PORT}`);
		});
	}

	private initializeMiddlewares() {
		this.app.use(express.json());

		this.app.use(router);
	}

	private initializeErrorHandling() {
		this.app.use(errorMiddleware);
	}
}
