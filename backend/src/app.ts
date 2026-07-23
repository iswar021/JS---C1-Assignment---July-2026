import express, { Express, Request, Response } from 'express';
import cors from 'cors';

/**
 * Builds and configures the Express application.
 * Route modules and the centralized error handler are added in Milestone 3.
 */
export function createApp(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Liveness probe — confirms the API process is up.
  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  return app;
}
