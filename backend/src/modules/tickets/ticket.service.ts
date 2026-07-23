import { ValidationError } from '../../errors/AppError';
import { userRepository } from '../users/user.repository';
import { ticketRepository, TicketWithRefs } from './ticket.repository';
import { serializeTicketSummary, TicketSummaryDTO } from './ticket.mapper';
import { CreateTicketInput, ListTicketsQuery } from './ticket.schema';

export interface PaginatedTickets {
  data: TicketSummaryDTO[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
}

/** Lists tickets with keyword/status filtering and pagination. */
export async function listTickets(query: ListTicketsQuery): Promise<PaginatedTickets> {
  const { q, status, page, pageSize } = query;

  const { items, total } = await ticketRepository.list({
    q,
    status,
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  return {
    data: items.map(serializeTicketSummary),
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

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
