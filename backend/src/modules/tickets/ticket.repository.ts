import { Prisma, Priority, Status } from '@prisma/client';
import { prisma } from '../../lib/prisma';

/** Relations always loaded with a ticket so the API can return user references. */
export const ticketInclude = {
  assignedTo: { select: { id: true, name: true } },
  createdBy: { select: { id: true, name: true } },
} satisfies Prisma.TicketInclude;

export type TicketWithRefs = Prisma.TicketGetPayload<{ include: typeof ticketInclude }>;

/** Relations for a ticket detail view: user references plus ordered comments. */
export const ticketDetailInclude = {
  assignedTo: { select: { id: true, name: true } },
  createdBy: { select: { id: true, name: true } },
  comments: {
    include: { createdBy: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'asc' },
  },
} satisfies Prisma.TicketInclude;

export type TicketWithDetails = Prisma.TicketGetPayload<{ include: typeof ticketDetailInclude }>;

export interface ListTicketsParams {
  q?: string;
  status?: Status;
  priority?: Priority;
  assignedTo?: string;
  sortBy: 'createdAt' | 'updatedAt' | 'priority';
  sortOrder: 'asc' | 'desc';
  skip: number;
  take: number;
}

/** Data access for tickets. */
export const ticketRepository = {
  create(data: Prisma.TicketUncheckedCreateInput): Promise<TicketWithRefs> {
    return prisma.ticket.create({ data, include: ticketInclude });
  },

  /** Fetches a single ticket with its comments, or null if it does not exist. */
  findById(id: string): Promise<TicketWithDetails | null> {
    return prisma.ticket.findUnique({ where: { id }, include: ticketDetailInclude });
  },

  /** Returns whether a ticket with the given id exists. */
  async exists(id: string): Promise<boolean> {
    const ticket = await prisma.ticket.findUnique({ where: { id }, select: { id: true } });
    return ticket !== null;
  },

  /** Updates ticket fields and returns the ticket with its comments. */
  update(id: string, data: Prisma.TicketUncheckedUpdateInput): Promise<TicketWithDetails> {
    return prisma.ticket.update({ where: { id }, data, include: ticketDetailInclude });
  },

  /** Persists a status change and returns the ticket with its comments. */
  updateStatus(id: string, status: Status): Promise<TicketWithDetails> {
    return prisma.ticket.update({ where: { id }, data: { status }, include: ticketDetailInclude });
  },

  /**
   * Returns a page of tickets matching the optional filters (keyword, status,
   * priority, assignee), plus the total match count (for pagination). Keyword
   * search is case-insensitive across title and description. Sorting is
   * configurable; a stable secondary sort by id keeps paging deterministic.
   */
  async list(params: ListTicketsParams): Promise<{ items: TicketWithRefs[]; total: number }> {
    const where: Prisma.TicketWhereInput = {
      ...(params.status ? { status: params.status } : {}),
      ...(params.priority ? { priority: params.priority } : {}),
      ...(params.assignedTo ? { assignedToId: params.assignedTo } : {}),
      ...(params.q
        ? {
            OR: [
              { title: { contains: params.q, mode: 'insensitive' } },
              { description: { contains: params.q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const orderBy: Prisma.TicketOrderByWithRelationInput[] = [
      { [params.sortBy]: params.sortOrder },
      { id: 'asc' },
    ];

    const [items, total] = await prisma.$transaction([
      prisma.ticket.findMany({
        where,
        include: ticketInclude,
        orderBy,
        skip: params.skip,
        take: params.take,
      }),
      prisma.ticket.count({ where }),
    ]);

    return { items, total };
  },
};
