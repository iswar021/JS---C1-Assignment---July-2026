import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { ticketRouter } from './modules/tickets/ticket.routes';
import { errorHandler } from './middleware/error';

/**
 * Builds and configures the Express application.
 */
export function createApp(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Liveness probe — confirms the API process is up.
  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  // Feature routes
  app.use('/api/tickets', ticketRouter);

  // Centralized error handler — must be registered last.
  app.use(errorHandler);

  return app;
}
