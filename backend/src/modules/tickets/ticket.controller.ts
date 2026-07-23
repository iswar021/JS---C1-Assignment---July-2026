import { RequestHandler } from 'express';
import * as ticketService from './ticket.service';
import { serializeTicket } from './ticket.mapper';
import { ListTicketsQuery, TicketIdParam } from './ticket.schema';

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

/** GET /api/tickets/:id — fetch a single ticket with its comments. */
export const getTicket: RequestHandler = async (_req, res, next) => {
  try {
    const { id } = res.locals.params as TicketIdParam;
    const ticket = await ticketService.getTicketById(id);
    res.json(serializeTicket(ticket));
  } catch (err) {
    next(err);
  }
};

/** PATCH /api/tickets/:id — update editable ticket fields. */
export const updateTicket: RequestHandler = async (req, res, next) => {
  try {
    const { id } = res.locals.params as TicketIdParam;
    const ticket = await ticketService.updateTicket(id, req.body);
    res.json(serializeTicket(ticket));
  } catch (err) {
    next(err);
  }
};
