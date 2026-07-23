import { Router } from 'express';
import { validateBody, validateParams } from '../../middleware/validate';
import { ticketIdParamSchema } from '../tickets/ticket.schema';
import { createCommentSchema } from './comment.schema';
import * as commentController from './comment.controller';

// mergeParams so the parent ticket `:id` is available here.
export const commentRouter = Router({ mergeParams: true });

// Add a comment to a ticket
commentRouter.post(
  '/',
  validateParams(ticketIdParamSchema),
  validateBody(createCommentSchema),
  commentController.addComment,
);
