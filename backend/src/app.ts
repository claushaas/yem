import express from 'express';
import 'express-async-errors';
import router from './routes';
import errorMiddleware from './middlewares/error.middleware';
import cookieParser from 'cookie-parser';
// Import {HotmartService} from './services/hotmart.service';
// import {SecretService} from './services/secret.service';
// import CustomError from './utils/CustomError';

export default class App {
	public app: express.Express;

	constructor() {
		this.app = express();

		this.initializeMiddlewares();

		this.app.get('/health', (_req, res) => res.json({ok: true}));

		// This.app.get('/hotmart', async (_req, res) => {
		// 	try {
		// 		const secretService = new SecretService();

		// 		const {data: secrets} = await secretService.getSecret();

		// 		const hotmartService = new HotmartService(secrets.hotmartApiAccessToken);

		// 		const response = await hotmartService.getUserSubscriptions('claus.haas@me.com');

		// 		res.json(response);
		// 	} catch (error) {
		// 		throw new CustomError('INVALID_DATA', (error as Error).message);
		// 	}
		// });

		this.initializeErrorHandling();
	}

	public start(PORT: string | number): void {
		this.app.listen(PORT, () => {
			console.log(`Running on port ${PORT}`);
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
