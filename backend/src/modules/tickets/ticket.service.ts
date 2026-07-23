import { ValidationError } from '../../errors/AppError';
import { userRepository } from '../users/user.repository';
import { ticketRepository, TicketWithRefs } from './ticket.repository';
import { CreateTicketInput } from './ticket.schema';

/**
 * Creates a ticket after verifying that the referenced users exist.
 * Referential problems are reported as 400 ValidationError (field-scoped) rather
 * than leaking a database foreign-key error.
 */
export async function createTicket(input: CreateTicketInput): Promise<TicketWithRefs> {
  const creatorExists = await userRepository.existsById(input.createdById);
  if (!creatorExists) {
    throw new ValidationError('Validation failed', {
      createdById: ['User does not exist'],
    });
  }

  if (input.assignedToId) {
    const assigneeExists = await userRepository.existsById(input.assignedToId);
    if (!assigneeExists) {
      throw new ValidationError('Validation failed', {
        assignedToId: ['User does not exist'],
      });
    }
  }

  return ticketRepository.create({
    title: input.title,
    description: input.description,
    priority: input.priority,
    createdById: input.createdById,
    assignedToId: input.assignedToId ?? null,
  });
}
