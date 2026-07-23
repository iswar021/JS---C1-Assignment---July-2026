import { RequestHandler } from 'express';
import * as ticketService from './ticket.service';
import { serializeTicket } from './ticket.mapper';

/** POST /api/tickets — create a ticket. */
export const createTicket: RequestHandler = async (req, res, next) => {
  try {
    const ticket = await ticketService.createTicket(req.body);
    res.status(201).json(serializeTicket(ticket));
  } catch (err) {
    next(err);
  }
};
