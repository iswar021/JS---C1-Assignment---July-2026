import { Router } from 'express';
import { validateBody } from '../../middleware/validate';
import { createTicketSchema } from './ticket.schema';
import * as ticketController from './ticket.controller';

export const ticketRouter = Router();

// Create a ticket
ticketRouter.post('/', validateBody(createTicketSchema), ticketController.createTicket);
