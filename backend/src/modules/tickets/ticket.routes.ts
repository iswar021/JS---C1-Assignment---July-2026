import { Router } from 'express';
import { validateBody, validateQuery } from '../../middleware/validate';
import { createTicketSchema, listTicketsQuerySchema } from './ticket.schema';
import * as ticketController from './ticket.controller';

export const ticketRouter = Router();

// List tickets (search + status filter + pagination)
ticketRouter.get('/', validateQuery(listTicketsQuerySchema), ticketController.listTickets);

// Create a ticket
ticketRouter.post('/', validateBody(createTicketSchema), ticketController.createTicket);
