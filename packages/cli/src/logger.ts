// src/logger.ts
import { createLogger, format, transports } from 'winston';
const { combine, timestamp, printf, colorize } = format;

// Define custom format for logs
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

// Create logger instance
export const oiLogger = createLogger({
  level: 'info', // Set default log level
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Add timestamp to logs
    colorize(), // Colorize log output
    logFormat // Apply custom log format
  ),
  transports: [
    new transports.Console(), // Log to console
    new transports.File({ filename: 'logs/app.log' }) // Log to file
  ]
});

export default oiLogger;
