import * as crypto from 'crypto';
import { UserRole, Permission } from './roles';

// In-memory ticket store (in production, use Redis or DB)
const ticketStore = new Map();
const TICKET_TTL_MS = 60000; // 60 seconds

export async function generateWsTicket(userId: string, role: UserRole, permissions: Permission[]): Promise<string> {
  const ticket = crypto.randomUUID();
  ticketStore.set(ticket, {
    userId,
    role,
    permissions,
    expiresAt: Date.now() + TICKET_TTL_MS
  });
  return ticket;
}

export async function validateWsTicket(ticket: string): Promise<{userId: string, role: UserRole, permissions: Permission[]}> {
  const data = ticketStore.get(ticket);
  if (!data) {
    throw new Error('Invalid or expired WebSocket ticket.');
  }
  
  if (Date.now() > data.expiresAt) {
    ticketStore.delete(ticket);
    throw new Error('WebSocket ticket expired.');
  }

  // Single-use: delete immediately after validation
  ticketStore.delete(ticket);
  
  return data;
}
