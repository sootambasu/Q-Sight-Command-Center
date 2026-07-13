import { pool } from '../db';
import { AuditLogEvent } from '@q-sight/shared';

import { PoolClient } from 'pg';

export async function writeToAuditOutbox(event: AuditLogEvent, client?: PoolClient): Promise<void> {
  if (!pool) return;
  const query = `INSERT INTO audit_outbox (event_payload) VALUES ($1)`;
  try {
    await pool.query(query, [event]);
  } catch (err: any) {
    console.error('Failed to write to audit outbox:', err.message || err);
  }
}
