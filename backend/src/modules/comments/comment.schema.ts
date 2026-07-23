import { z } from 'zod';

/** Request schema for adding a comment to a ticket. */
export const createCommentSchema = z
  .object({
    message: z
      .string()
      .trim()
      .min(1, 'Message is required')
      .max(5000, 'Message is too long'),
    createdById: z.string().uuid('createdById must be a valid user id'),
  })
  .strict('Unknown field');

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
