import morgan from 'morgan';
import logger from '../utils/logger';

// --- Express request logging middleware using morgan ---
export const requestLogger = morgan(
    (tokens, req, res) => {
        const ip =
            req.headers['x-forwarded-for'] || // if behind proxy
            req.socket.remoteAddress        

        const log = {
            method: tokens.method(req, res),
            url: tokens.url(req, res),
            status: Number(tokens.status(req, res)),
            contentLength: Number(tokens.res(req, res, 'content-length')) || 0,
            responseTime: Number(tokens['response-time'](req, res)) || 0,
            ip,
        };

        // log all requests at info level
        logger.info('HTTP request', log);

        return ''; // morgan won't print anything itself
    },
    { stream: { write: () => {} } } // disable default morgan output
);