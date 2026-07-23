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
  status: z
    .nativeEnum(Status, { errorMap: () => ({ message: 'Invalid status filter' }) })
    .optional(),
  priority: z
    .nativeEnum(Priority, { errorMap: () => ({ message: 'Invalid priority filter' }) })
    .optional(),
  assignedTo: z.string().uuid('assignedTo must be a valid user id').optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'priority']).default('updatedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type ListTicketsQuery = z.infer<typeof listTicketsQuerySchema>;

/** Request schema for the status-change endpoint (state machine). */
export const changeStatusSchema = z
  .object({
    status: z.nativeEnum(Status, {
      errorMap: () => ({ message: 'Invalid status value' }),
    }),
  })
  .strict('Unknown field');

export type ChangeStatusInput = z.infer<typeof changeStatusSchema>;

/**
 * Request schema for the assign endpoint. `assignedToId` is required but may be
 * `null` to explicitly unassign a ticket.
 */
export const assignTicketSchema = z
  .object({
    assignedToId: z.string().uuid('assignedToId must be a valid user id').nullable(),
  })
  .strict('Unknown field');

export type AssignTicketInput = z.infer<typeof assignTicketSchema>;

/**
 * Request schema for updating ticket fields. All fields optional, but at least
 * one must be provided. `.strict()` rejects unknown keys — notably `status`,
 * which must be changed via the dedicated state-machine endpoint. `assignedToId`
 * may be `null` to unassign.
 */
export const updateTicketSchema = z
  .object({
    title: z.string().trim().min(1, 'Title is required').max(200, 'Title is too long').optional(),
    description: z
      .string()
      .trim()
      .min(1, 'Description is required')
      .max(5000, 'Description is too long')
      .optional(),
    priority: z
      .nativeEnum(Priority, {
        errorMap: () => ({ message: 'Priority must be one of LOW, MEDIUM, HIGH, URGENT' }),
      })
      .optional(),
    assignedToId: z.string().uuid('assignedToId must be a valid user id').nullable().optional(),
  })
  .strict('Unknown field. Note: status is changed via PATCH /tickets/:id/status')
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;

/** Route param schema for endpoints addressing a single ticket by id. */
export const ticketIdParamSchema = z.object({
  id: z.string().uuid('Invalid ticket id'),
});

export type TicketIdParam = z.infer<typeof ticketIdParamSchema>;
