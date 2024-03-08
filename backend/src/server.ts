import App from './app.js';

const port = process.env.APP_PORT ?? 3001;

const app = new App();
app.start(port);

