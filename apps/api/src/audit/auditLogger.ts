import { pool } from '../db';
import { AuditLogEvent } from '@q-sight/shared';

/**
 * Log an audit event.
 * Writes to the append-only audit_logs table.
 * Fails gracefully if DB is offline, logging to console/logs.
 * Never logs sensitive credentials, tokens, or personal identifiers.
 */
export async function logAuditEvent(event: {
  operator_id: string;
  role: string;
  action: string;
  target_type?: string | null;
  target_id?: string | null;
  request_id: string;
  route?: string | null;
  metadata?: Record<string, any> | null;
  zoom_level?: number | null;
  view_bounds?: any | null;
}): Promise<boolean> {
  const sanitizedMeta = { ...event.metadata };

  // Strict Sanitization: Strip secrets and credentials
  const keysToFilter = ['stream_url', 'verification_hash', 'credentials', 'password', 'token', 'secret', 'biometric', 'face'];
  for (const key of Object.keys(sanitizedMeta)) {
    if (keysToFilter.some(filter => key.toLowerCase().includes(filter))) {
      delete sanitizedMeta[key];
    }
  }

  if (!pool) {
    console.warn(`⚠️ [Audit Logger (Console Fallback)]: Database unavailable. Audit Event skipped. Detail:`, {
      ...event,
      metadata: sanitizedMeta,
    });
    return false;
  }

  try {
    const query = `
      INSERT INTO audit_logs (
        operator_id, 
        role, 
        action, 
        target_type, 
        target_id, 
        request_id, 
        route, 
        metadata,
        zoom_level,
        view_bounds
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id;
    `;

    const values = [
      event.operator_id,
      event.role,
      event.action,
      event.target_type || null,
      event.target_id || null,
      event.request_id,
      event.route || null,
      sanitizedMeta ? JSON.stringify(sanitizedMeta) : null,
      event.zoom_level || null,
      event.view_bounds || null,
    ];

    await pool.query(query, values);
    return true;
  } catch (error: any) {
    console.error(`❌ [Audit Logger]: Failed to write audit event to DB:`, error.message || error);
    // Return false instead of throwing to prevent crashing normal operational routes
    return false;
  }
}
