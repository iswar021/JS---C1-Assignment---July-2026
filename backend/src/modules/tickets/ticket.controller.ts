import { RequestHandler } from 'express';
import * as ticketService from './ticket.service';
import { serializeTicket } from './ticket.mapper';
import { ListTicketsQuery } from './ticket.schema';

/** POST /api/tickets — create a ticket. */
export const createTicket: RequestHandler = async (req, res, next) => {
  try {
    const ticket = await ticketService.createTicket(req.body);
    res.status(201).json(serializeTicket(ticket));
  } catch (err) {
    next(err);
  }
};

/** GET /api/tickets — list tickets with search, status filter, and pagination. */
export const listTickets: RequestHandler = async (_req, res, next) => {
  try {
    const query = res.locals.query as ListTicketsQuery;
    const result = await ticketService.listTickets(query);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
