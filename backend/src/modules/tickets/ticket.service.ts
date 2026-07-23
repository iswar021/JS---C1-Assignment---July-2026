import { Prisma } from '@prisma/client';
import { NotFoundError, ValidationError } from '../../errors/AppError';
import { userRepository } from '../users/user.repository';
import { ticketRepository, TicketWithDetails, TicketWithRefs } from './ticket.repository';
import { serializeTicketSummary, TicketSummaryDTO } from './ticket.mapper';
import { CreateTicketInput, ListTicketsQuery, UpdateTicketInput } from './ticket.schema';

export interface PaginatedTickets {
  data: TicketSummaryDTO[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
}

/** Fetches a single ticket (with comments) or throws 404 if it does not exist. */
export async function getTicketById(id: string): Promise<TicketWithDetails> {
  const ticket = await ticketRepository.findById(id);
  if (!ticket) {
    throw new NotFoundError('Ticket not found');
  }
  return ticket;
}

/**
 * Updates editable ticket fields (title, description, priority, assignee).
 * Business rules:
 *  - the ticket must exist (else 404);
 *  - a provided assignee must reference an existing user (else 400);
 *  - status is NOT updatable here (rejected at the schema layer).
 */
export async function updateTicket(
  id: string,
  input: UpdateTicketInput,
): Promise<TicketWithDetails> {
  const exists = await ticketRepository.exists(id);
  if (!exists) {
    throw new NotFoundError('Ticket not found');
  }

  if (input.assignedToId) {
    const assigneeExists = await userRepository.existsById(input.assignedToId);
    if (!assigneeExists) {
      throw new ValidationError('Validation failed', {
        assignedToId: ['User does not exist'],
      });
    }
  }

  const data: Prisma.TicketUncheckedUpdateInput = {};
  if (input.title !== undefined) data.title = input.title;
  if (input.description !== undefined) data.description = input.description;
  if (input.priority !== undefined) data.priority = input.priority;
  if (input.assignedToId !== undefined) data.assignedToId = input.assignedToId; // may be null

  return ticketRepository.update(id, data);
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
