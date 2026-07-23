import { Router } from 'express';
import { validateBody, validateParams, validateQuery } from '../../middleware/validate';
import {
  assignTicketSchema,
  changeStatusSchema,
  createTicketSchema,
  listTicketsQuerySchema,
  ticketIdParamSchema,
  updateTicketSchema,
} from './ticket.schema';
import * as ticketController from './ticket.controller';
import { commentRouter } from '../comments/comment.routes';

export const ticketRouter = Router();

// List tickets (search + status/priority/assignee filters + sorting + pagination)
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

// Assign / unassign a ticket
ticketRouter.patch(
  '/:id/assign',
  validateParams(ticketIdParamSchema),
  validateBody(assignTicketSchema),
  ticketController.assignTicket,
);

// Change status through the enforced state machine
ticketRouter.patch(
  '/:id/status',
  validateParams(ticketIdParamSchema),
  validateBody(changeStatusSchema),
  ticketController.changeStatus,
);

// Nested comments routes: /api/tickets/:id/comments
ticketRouter.use('/:id/comments', commentRouter);
