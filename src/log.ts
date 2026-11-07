const LOG_DIRECTORY = process.env.LOG_DIRECTORY || './logs';

// Get current date and time to create a unique log file name
const now = new Date();
const timestamp = now.toISOString().replace(/[:.]/g, '-');
const logFileName = `log-${timestamp}.txt`;
const logFilePath = `${LOG_DIRECTORY}/${logFileName}`;

// Ensure the log directory exists
import { mkdirSync, writeFileSync } from 'fs';
mkdirSync(LOG_DIRECTORY, { recursive: true });

// Function to log messages to the file
export function logMessage(message: string): void {
  const logEntry = `[${new Date().toISOString()}] ${message}\n`;
  writeFileSync(logFilePath, logEntry, { flag: 'a' });
  console.log(message); // Also log to console
}
