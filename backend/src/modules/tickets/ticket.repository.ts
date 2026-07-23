import { Prisma, Status } from '@prisma/client';
import { prisma } from '../../lib/prisma';

/** Relations always loaded with a ticket so the API can return user references. */
export const ticketInclude = {
  assignedTo: { select: { id: true, name: true } },
  createdBy: { select: { id: true, name: true } },
} satisfies Prisma.TicketInclude;

export type TicketWithRefs = Prisma.TicketGetPayload<{ include: typeof ticketInclude }>;

export interface ListTicketsParams {
  q?: string;
  status?: Status;
  skip: number;
  take: number;
}

/** Data access for tickets. */
export const ticketRepository = {
  create(data: Prisma.TicketUncheckedCreateInput): Promise<TicketWithRefs> {
    return prisma.ticket.create({ data, include: ticketInclude });
  },

  /**
   * Returns a page of tickets matching the optional keyword/status filters, plus
   * the total match count (for pagination). Keyword search is case-insensitive
   * across title and description. Newest-updated first.
   */
  async list(params: ListTicketsParams): Promise<{ items: TicketWithRefs[]; total: number }> {
    const where: Prisma.TicketWhereInput = {
      ...(params.status ? { status: params.status } : {}),
      ...(params.q
        ? {
            OR: [
              { title: { contains: params.q, mode: 'insensitive' } },
              { description: { contains: params.q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await prisma.$transaction([
      prisma.ticket.findMany({
        where,
        include: ticketInclude,
        orderBy: { updatedAt: 'desc' },
        skip: params.skip,
        take: params.take,
      }),
      prisma.ticket.count({ where }),
    ]);

    return { items, total };
  },
};
