import { apiRequest } from './client';
import type { Comment, Paginated, Priority, Status, Ticket, TicketSummary } from '../types';

export interface ListTicketsParams {
  q?: string;
  status?: Status | '';
  priority?: Priority | '';
  assignedTo?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'priority';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export function listTickets(params: ListTicketsParams): Promise<Paginated<TicketSummary>> {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && value !== null) {
      search.append(key, String(value));
    }
  });
  const query = search.toString();
  return apiRequest<Paginated<TicketSummary>>(`/tickets${query ? `?${query}` : ''}`);
}

export function getTicket(id: string): Promise<Ticket> {
  return apiRequest<Ticket>(`/tickets/${id}`);
}

export interface CreateTicketPayload {
  title: string;
  description: string;
  priority: Priority;
  createdById: string;
  assignedToId?: string | null;
}

export function createTicket(payload: CreateTicketPayload): Promise<Ticket> {
  return apiRequest<Ticket>('/tickets', { method: 'POST', body: JSON.stringify(payload) });
}

export interface UpdateTicketPayload {
  title?: string;
  description?: string;
  priority?: Priority;
  assignedToId?: string | null;
}

export function updateTicket(id: string, payload: UpdateTicketPayload): Promise<Ticket> {
  return apiRequest<Ticket>(`/tickets/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export function assignTicket(id: string, assignedToId: string | null): Promise<Ticket> {
  return apiRequest<Ticket>(`/tickets/${id}/assign`, {
    method: 'PATCH',
    body: JSON.stringify({ assignedToId }),
  });
}

export function changeStatus(id: string, status: Status): Promise<Ticket> {
  return apiRequest<Ticket>(`/tickets/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function addComment(id: string, message: string, createdById: string): Promise<Comment> {
  return apiRequest<Comment>(`/tickets/${id}/comments`, {
    method: 'POST',
    body: JSON.stringify({ message, createdById }),
  });
}
