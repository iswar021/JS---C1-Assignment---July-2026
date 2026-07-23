import { NotFoundError } from '../../errors/AppError';
import { assertUserExists } from '../users/user.guards';
import { ticketRepository } from '../tickets/ticket.repository';
import { commentRepository, CommentWithAuthor } from './comment.repository';
import { CreateCommentInput } from './comment.schema';

/**
 * Adds a comment to a ticket.
 * Business rules:
 *  - the ticket must exist (else 404);
 *  - the author must reference an existing user (else 400).
 */
export async function addComment(
  ticketId: string,
  input: CreateCommentInput,
): Promise<CommentWithAuthor> {
  const ticketExists = await ticketRepository.exists(ticketId);
  if (!ticketExists) {
    throw new NotFoundError('Ticket not found');
  }

  await assertUserExists(input.createdById, 'createdById');

  return commentRepository.create({
    ticketId,
    message: input.message,
    createdById: input.createdById,
  });
}
