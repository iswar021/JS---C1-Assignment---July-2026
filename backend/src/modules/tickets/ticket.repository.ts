import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';

/** Relations always loaded with a ticket so the API can return user references. */
export const ticketInclude = {
  assignedTo: { select: { id: true, name: true } },
  createdBy: { select: { id: true, name: true } },
} satisfies Prisma.TicketInclude;

export type TicketWithRefs = Prisma.TicketGetPayload<{ include: typeof ticketInclude }>;

/** Data access for tickets. */
export const ticketRepository = {
  create(data: Prisma.TicketUncheckedCreateInput): Promise<TicketWithRefs> {
    return prisma.ticket.create({ data, include: ticketInclude });
  },
};
