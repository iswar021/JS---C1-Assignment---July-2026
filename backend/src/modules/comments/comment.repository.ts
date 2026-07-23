import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';

const commentInclude = {
  createdBy: { select: { id: true, name: true } },
} satisfies Prisma.CommentInclude;

export type CommentWithAuthor = Prisma.CommentGetPayload<{ include: typeof commentInclude }>;

/** Data access for comments. */
export const commentRepository = {
  create(data: Prisma.CommentUncheckedCreateInput): Promise<CommentWithAuthor> {
    return prisma.comment.create({ data, include: commentInclude });
  },
};
