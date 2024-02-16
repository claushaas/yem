import App from './app';

const port = process.env.APP_PORT ?? 3001;

new App().start(port);
