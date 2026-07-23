import { z } from 'zod';
import { Priority } from '@prisma/client';

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
