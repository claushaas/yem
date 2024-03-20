import morgan, {type StreamOptions} from 'morgan';
import {logger} from '../utils/Logger.js';

const skip = () => {
	const env = process.env.NODE_ENV ?? 'development';
	return env !== 'development';
};

const stream: StreamOptions = {
	write(message: string) {
		logger.logSilly(message);
	},
};

export const morganMiddleware = morgan(
	':method :url :status :res[content-length] - :response-time ms',
	{
		stream,
		skip,
	},
);
