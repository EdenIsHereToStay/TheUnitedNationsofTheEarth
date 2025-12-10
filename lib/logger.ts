// Structured logging utility

import { createLogEntry, logDb } from "./db";

export function logInfo(
  source: "api" | "worker",
  message: string,
  meta?: Record<string, unknown>
): void {
  const entry = createLogEntry("info", source, message, meta);
  logDb.insert(entry);
  console.log(`[${entry.level.toUpperCase()}] [${source}] ${message}`, meta || "");
}

export function logError(
  source: "api" | "worker",
  message: string,
  meta?: Record<string, unknown>
): void {
  const entry = createLogEntry("error", source, message, meta);
  logDb.insert(entry);
  console.error(`[${entry.level.toUpperCase()}] [${source}] ${message}`, meta || "");
}

export function logApiRequest(
  path: string,
  method: string,
  status: number,
  duration: number,
  callerIp?: string
): void {
  logInfo("api", `${method} ${path}`, {
    status,
    duration,
    callerIp,
  });
}

