import App from './app';
import newrelic from 'newrelic';

const port = process.env.APP_PORT ?? 3001;

const app = new App();
app.start(port);

newrelic.instrumentLoadedModule('express', app);
