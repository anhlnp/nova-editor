// Structured logging adapter (Pino) — server-side only.
// Serverless-friendly: JSON to stdout, no file transports, no worker threads.
// Routes/lib code import from here, never from "pino" directly (SOLID D).
import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? (process.env.NODE_ENV === "production" ? "info" : "debug"),
  base: undefined,
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ level: label }),
  },
});

export type Logger = typeof logger;

/** Child logger scoped to one API route, e.g. routeLogger("api/projects"). */
export function routeLogger(route: string): Logger {
  return logger.child({ route });
}
