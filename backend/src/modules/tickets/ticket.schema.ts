import { z } from 'zod';
import { Priority, Status } from '@prisma/client';

/**
 * Request schema for creating a ticket.
 * Status is intentionally NOT accepted here — new tickets always start OPEN and
 * status changes go through the dedicated state-machine endpoint.
 */
export const createTicketSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z
    .string()
    .trim()
    .min(1, 'Description is required')
    .max(5000, 'Description is too long'),
  priority: z.nativeEnum(Priority, {
    errorMap: () => ({ message: 'Priority must be one of LOW, MEDIUM, HIGH, URGENT' }),
  }),
  createdById: z.string().uuid('createdById must be a valid user id'),
  assignedToId: z.string().uuid('assignedToId must be a valid user id').optional().nullable(),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;

/**
 * Query schema for listing tickets: optional keyword search + status filter,
 * with pagination (1-based page, bounded page size). Values are coerced from
 * their string query-param form and defaulted.
 */
export const listTicketsQuerySchema = z.object({
  q: z.string().trim().min(1).optional(),
  status: z.nativeEnum(Status, {
    errorMap: () => ({ message: 'Invalid status filter' }),
  }).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type ListTicketsQuery = z.infer<typeof listTicketsQuerySchema>;

/** Route param schema for endpoints addressing a single ticket by id. */
export const ticketIdParamSchema = z.object({
  id: z.string().uuid('Invalid ticket id'),
});

export type TicketIdParam = z.infer<typeof ticketIdParamSchema>;
