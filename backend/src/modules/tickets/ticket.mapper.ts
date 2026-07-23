import { Comment, Priority, Status } from '@prisma/client';
import { TicketWithRefs } from './ticket.repository';

type UserRef = { id: string; name: string };

export interface TicketDTO {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  assignedTo: UserRef | null;
  createdBy: UserRef;
  createdAt: Date;
  updatedAt: Date;
  comments: Array<{ id: string; message: string; createdBy: UserRef; createdAt: Date }>;
}

type CommentWithAuthor = Comment & { createdBy: UserRef };

/** Maps a Prisma ticket (with relations) to the public API shape. */
export function serializeTicket(
  ticket: TicketWithRefs & { comments?: CommentWithAuthor[] },
): TicketDTO {
  return {
    id: ticket.id,
    title: ticket.title,
    description: ticket.description,
    priority: ticket.priority,
    status: ticket.status,
    assignedTo: ticket.assignedTo,
    createdBy: ticket.createdBy,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
    comments: (ticket.comments ?? []).map((c) => ({
      id: c.id,
      message: c.message,
      createdBy: c.createdBy,
      createdAt: c.createdAt,
    })),
  };
}
