import { createLogger, format, transports } from 'winston';
import { env } from './env';

const { combine, timestamp, json, colorize, printf } = format;

// custom format for log messages
const consoleLogFormat = combine(
  colorize(), // add colors to log levels,
  printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}]: ${message}`;
  }),
);

// create a Winston logger instance
const logger = createLogger({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug', // set log level based on environment
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // add timestamp to log messages
    json(), // format log messages as JSON
  ),
  transports: [
    new transports.File({ filename: 'logs/error.log', level: 'error' }), // log errors to a file
    new transports.File({ filename: 'logs/combined.log' }), // log all messages to a file
  ],
});

if (env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      format: consoleLogFormat, // use custom format for console logs
    }),
  );
}

export default logger;
