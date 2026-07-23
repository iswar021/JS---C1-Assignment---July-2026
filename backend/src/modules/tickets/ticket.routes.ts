import { Router } from 'express';
import { validateBody, validateParams, validateQuery } from '../../middleware/validate';
import {
  createTicketSchema,
  listTicketsQuerySchema,
  ticketIdParamSchema,
  updateTicketSchema,
} from './ticket.schema';
import * as ticketController from './ticket.controller';

export const ticketRouter = Router();

// List tickets (search + status filter + pagination)
ticketRouter.get('/', validateQuery(listTicketsQuerySchema), ticketController.listTickets);

// Get a single ticket with its comments
ticketRouter.get('/:id', validateParams(ticketIdParamSchema), ticketController.getTicket);

// Create a ticket
ticketRouter.post('/', validateBody(createTicketSchema), ticketController.createTicket);

// Update editable ticket fields (title, description, priority, assignee)
ticketRouter.patch(
  '/:id',
  validateParams(ticketIdParamSchema),
  validateBody(updateTicketSchema),
  ticketController.updateTicket,
);
