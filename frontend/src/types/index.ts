export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type Status = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'CANCELLED';

export interface UserRef {
  id: string;
  name: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface TicketSummary {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  assignedTo: UserRef | null;
  createdBy: UserRef;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  message: string;
  createdBy: UserRef;
  createdAt: string;
}

export interface Ticket extends TicketSummary {
  comments: Comment[];
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  data: T[];
  pagination: PaginationMeta;
}
