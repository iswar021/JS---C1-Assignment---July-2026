import { RequestHandler } from 'express';
import * as commentService from './comment.service';
import { serializeComment } from './comment.mapper';
import { TicketIdParam } from '../tickets/ticket.schema';

/** POST /api/tickets/:id/comments — add a comment to a ticket. */
export const addComment: RequestHandler = async (req, res, next) => {
  try {
    const { id } = res.locals.params as TicketIdParam;
    const comment = await commentService.addComment(id, req.body);
    res.status(201).json(serializeComment(comment));
  } catch (err) {
    next(err);
  }
};
