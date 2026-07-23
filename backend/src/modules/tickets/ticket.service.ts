import { Prisma } from '@prisma/client';
import { ConflictError, NotFoundError } from '../../errors/AppError';
import { assertUserExists } from '../users/user.guards';
import { ticketRepository, TicketWithDetails, TicketWithRefs } from './ticket.repository';
import { serializeTicketSummary, TicketSummaryDTO } from './ticket.mapper';
import { canTransition } from '../../services/statusMachine';
import {
  AssignTicketInput,
  ChangeStatusInput,
  CreateTicketInput,
  ListTicketsQuery,
  UpdateTicketInput,
} from './ticket.schema';

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
    await assertUserExists(input.assignedToId, 'assignedToId');
  }

  const data: Prisma.TicketUncheckedUpdateInput = {};
  if (input.title !== undefined) data.title = input.title;
  if (input.description !== undefined) data.description = input.description;
  if (input.priority !== undefined) data.priority = input.priority;
  if (input.assignedToId !== undefined) data.assignedToId = input.assignedToId; // may be null

  return ticketRepository.update(id, data);
}

/**
 * Assigns (or unassigns) a ticket.
 *  - the ticket must exist (else 404);
 *  - a non-null assignee must reference an existing user (else 400);
 *  - passing null unassigns the ticket.
 */
export async function assignTicket(
  id: string,
  input: AssignTicketInput,
): Promise<TicketWithDetails> {
  const exists = await ticketRepository.exists(id);
  if (!exists) {
    throw new NotFoundError('Ticket not found');
  }

  if (input.assignedToId) {
    await assertUserExists(input.assignedToId, 'assignedToId');
  }

  return ticketRepository.update(id, { assignedToId: input.assignedToId });
}

/**
 * Changes a ticket's status through the enforced state machine.
 *  - the ticket must exist (else 404);
 *  - the transition must be allowed (else 409 INVALID_TRANSITION).
 */
export async function changeStatus(
  id: string,
  input: ChangeStatusInput,
): Promise<TicketWithDetails> {
  const ticket = await ticketRepository.findById(id);
  if (!ticket) {
    throw new NotFoundError('Ticket not found');
  }

  const from = ticket.status;
  const to = input.status;

  if (!canTransition(from, to)) {
    throw new ConflictError(
      `Cannot change status from ${from} to ${to}.`,
      'INVALID_TRANSITION',
    );
  }

  return ticketRepository.updateStatus(id, to);
}

/** Lists tickets with keyword/status filtering and pagination. */
export async function listTickets(query: ListTicketsQuery): Promise<PaginatedTickets> {
  const { q, status, priority, assignedTo, sortBy, sortOrder, page, pageSize } = query;

  const { items, total } = await ticketRepository.list({
    q,
    status,
    priority,
    assignedTo,
    sortBy,
    sortOrder,
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
  await assertUserExists(input.createdById, 'createdById');

  if (input.assignedToId) {
    await assertUserExists(input.assignedToId, 'assignedToId');
  }

  return ticketRepository.create({
    title: input.title,
    description: input.description,
    priority: input.priority,
    createdById: input.createdById,
    assignedToId: input.assignedToId ?? null,
  });
}
