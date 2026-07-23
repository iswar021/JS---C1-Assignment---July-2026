import { RequestHandler } from 'express';

/**
 * Minimal request logger: logs method, path, status code, and duration once the
 * response finishes. Silent during tests to keep test output clean. Kept
 * dependency-free intentionally (no morgan) per the project's dependency policy.
 */
export const requestLogger: RequestHandler = (req, res, next) => {
  if (process.env.NODE_ENV === 'test') {
    next();
    return;
  }

  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    // eslint-disable-next-line no-console
    console.log(
      `${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs.toFixed(1)}ms`,
    );
  });

  next();
};
