import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { ticketRouter } from './modules/tickets/ticket.routes';
import { userRouter } from './modules/users/user.routes';
import { errorHandler, notFoundHandler } from './middleware/error';
import { requestLogger } from './middleware/logger';

/**
 * Builds and configures the Express application.
 */
export function createApp(): Express {
  const app = express();

  // Restrict CORS to the configured frontend origin(s) rather than allowing all.
  const corsOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim());
  app.use(cors({ origin: corsOrigins }));

  app.use(express.json());
  app.use(requestLogger);

  // Liveness probe — confirms the API process is up.
  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  // Feature routes
  app.use('/api/tickets', ticketRouter);
  app.use('/api/users', userRouter);

  // Unmatched routes → consistent 404.
  app.use(notFoundHandler);

  // Centralized error handler — must be registered last.
  app.use(errorHandler);

  return app;
}
