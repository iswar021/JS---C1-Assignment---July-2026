import { Router } from 'express';
import { validateBody, validateParams, validateQuery } from '../../middleware/validate';
import {
  createTicketSchema,
  listTicketsQuerySchema,
  ticketIdParamSchema,
} from './ticket.schema';
import * as ticketController from './ticket.controller';

export const ticketRouter = Router();

// List tickets (search + status filter + pagination)
ticketRouter.get('/', validateQuery(listTicketsQuerySchema), ticketController.listTickets);

// Get a single ticket with its comments
ticketRouter.get('/:id', validateParams(ticketIdParamSchema), ticketController.getTicket);

// Create a ticket
ticketRouter.post('/', validateBody(createTicketSchema), ticketController.createTicket);
