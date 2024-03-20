import 'newrelic';

import App from './app.js';
import {installGlobals} from '@remix-run/node';

installGlobals();

const port = process.env.APP_PORT ?? 3001;

const app = new App();
app.start(port);

