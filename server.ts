import 'newrelic'; // eslint-disable-line import/no-unassigned-import
import {installGlobals} from '@remix-run/node';
import App from './app.js';

installGlobals();

const port = process.env.APP_PORT ?? 3001;

const app = new App();
app.start(port);

