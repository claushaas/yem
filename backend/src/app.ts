import express from 'express';
import 'express-async-errors';
import {type Request, type Response, type NextFunction} from 'express';

export default class App {
	public app: express.Express;

	constructor() {
		this.app = express();

		this.initializeMiddlewares();
		this.initializeErrorHandling();
	}

	public start(PORT: string | number): void {
		this.app.listen(PORT, () => {
			console.log(`Running on port ${PORT}`);
		});
	}

	private initializeMiddlewares() {
		this.app.use(express.json());
	}

	private initializeErrorHandling() {
		this.app.use((err: Error, req: Request, res: Response, next: NextFunction) => res.status(500).send(err.message));
	}
}
