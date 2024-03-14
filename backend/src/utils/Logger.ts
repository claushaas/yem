import winston from 'winston';
import newrelicFormatter from '@newrelic/winston-enricher';

const newrelicWinstonFormatter = newrelicFormatter(winston);

const timezoned = () => new Date().toLocaleString('pt-BR', {
	timeZone: 'America/Sao_Paulo',
});

class Logger {
	private readonly _instance: winston.Logger;

	constructor() {
		this._instance = winston.createLogger({
			level: process.env.WINSTON_LOG_LEVEL ?? 'debug',
			format: winston.format.combine(
				winston.format.timestamp({format: timezoned}),
				winston.format.json(),
				newrelicWinstonFormatter(),
			),
			transports: [
				new winston.transports.Console({
					format: winston.format.combine(
						winston.format.colorize(),
						winston.format.simple(),
					),
				}),
			],
			exceptionHandlers: [
				new winston.transports.Console({
					format: winston.format.combine(
						winston.format.colorize(),
						winston.format.simple(),
					),
				}),
			],
			rejectionHandlers: [
				new winston.transports.Console({
					format: winston.format.combine(
						winston.format.colorize(),
						winston.format.simple(),
					),
				}),
			],
		});
	}

	public logError(message: string): void {
		this._instance.error(message);
	}

	public logWarn(message: string): void {
		this._instance.warn(message);
	}

	public logInfo(message: string): void {
		this._instance.info(message);
	}

	public logVerbose(message: string): void {
		this._instance.verbose(message);
	}

	public logDebug(message: string): void {
		this._instance.debug(message);
	}

	public logSilly(message: string): void {
		this._instance.silly(message);
	}
}

export const logger = new Logger();
