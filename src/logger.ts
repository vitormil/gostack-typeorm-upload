import pino from 'pino';
import expressPino from 'express-pino-logger';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
});
export const expressLogger = expressPino({ logger });

export default logger;
