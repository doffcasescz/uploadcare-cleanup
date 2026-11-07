const LOG_DIRECTORY = process.env.LOG_DIRECTORY || "./logs";

const logFileName = `${date.formatedDate}.txt`;
const logFilePath = `${LOG_DIRECTORY}/${logFileName}`;

// Ensure the log directory exists
import { mkdirSync, writeFileSync } from "fs";
import {date} from "./date.js";
mkdirSync(LOG_DIRECTORY, { recursive: true });

// Function to log messages to the file
export function logMessage(message: string): void {
  const logEntry = `[${new Date().toISOString()}] ${message}\n`;
  writeFileSync(logFilePath, logEntry, { flag: "a" });
  console.log(message); // Also log to console
}
