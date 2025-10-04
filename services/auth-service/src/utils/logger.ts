import { createLogger, format, transports } from 'winston';
import config from '../config';


const { combine, timestamp, printf, colorize, errors } = format;

// Custom console format
const consoleFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
    let log = `[${timestamp}] [${level}] : ${stack || message}`;
    if (Object.keys(meta).length) {
        log += ` | meta: ${JSON.stringify(meta)}`;
    }
    return log;
});

const logger = createLogger({
    level: config.logLevel || 'info',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }) // print stack trace
    ),
    defaultMeta: { service: 'auth-service' },
    transports: [
        new transports.Console({
            format: combine(colorize(), consoleFormat),
        }),
        new transports.File({ filename: 'logs/error.log', level: 'error' }),
        new transports.File({ filename: 'logs/combined.log' }),
    ],
});


export default logger;
