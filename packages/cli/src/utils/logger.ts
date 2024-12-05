import { OiLoggerInterface } from '@openibex/core';
import { createLogger, format, transports, Logger } from 'winston';

const { combine, timestamp, printf, colorize } = format;

const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

let loggerInstance: OiLoggerInterface | null = null;

export function getOiLogger(dest: string = 'logs/app.log'): OiLoggerInterface {
  // If logger is already initialized, return the instance
  if (loggerInstance) {
    return loggerInstance;
  }

  // Create and configure the logger instance
  loggerInstance = createLogger({
    level: 'info', // Default log level
    format: combine(
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Add timestamp to logs
      colorize(), // Colorize log output
      logFormat // Apply custom log format
    ),
    transports: [
      new transports.Console(), // Log to console
      new transports.File({ filename: dest }) // Log to file with dynamic destination
    ]
  });

  return loggerInstance;
}
