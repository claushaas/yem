import {createExpressApp} from 'remix-express-vite-plugin/express';
import compression from 'compression';
import morgan from 'morgan';
import helmet from 'helmet';
import {executeAndRepeat} from '~/utils/background-task.js';
import {logger} from '~/utils/logger.util';
import {populateCache} from '~/cache/initial-cache-population.js';

export default createExpressApp({
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
executeAndRepeat(async () => { // eslint-disable-line @typescript-eslint/no-floating-promises
	logger.logInfo('Populate cache task started');
	await populateCache();
	logger.logInfo('Populate cache task finished');
}, ONE_DAY);
