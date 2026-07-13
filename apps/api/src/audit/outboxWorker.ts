import { pool } from '../db';
import { exportHttps } from './exporters/httpsExporter';
import { exportLocalDev } from './exporters/localDevExporter';
import { config } from '../config';
import { AuditLogEvent } from '@q-sight/shared';

const MAX_RETRIES = 3;
const BATCH_SIZE = 50;
const POLL_INTERVAL_MS = 5000;
let isPolling = false;
let timeoutId: NodeJS.Timeout | null = null;

export async function processOutboxBatch() {
  if (!pool) return;
  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      `SELECT id, event_payload, retry_count
      FROM audit_outbox
      WHERE status IN ('pending', 'failed') AND retry_count < $1
      ORDER BY created_at ASC
      FOR UPDATE SKIP LOCKED
      LIMIT $2`, [MAX_RETRIES, BATCH_SIZE]);

    if (rows.length === 0) return;

    for (const row of rows) {
      const event = row.event_payload;
      try {
        if (config.buildProfile === 'production') {
          await exportHttps(event);
        } else {
          await exportLocalDev(event);
        }
        await client.query(`UPDATE audit_outbox SET status = 'processed', processed_at = CURRENT_TIMESTAMP WHERE id = $1`, [row.id]);
      } catch (err: any) {
        const newRetryCount = row.retry_count + 1;
        const newStatus = newRetryCount >= MAX_RETRIES ? 'dead_letter' : 'failed';
        await client.query(`UPDATE audit_outbox SET status = $1, retry_count = $2, error_message = $3 WHERE id = $4`, [newStatus, newRetryCount, err.message || 'Unknown error', row.id]);
      }
    }
  } finally {
    client.release();
  }
}

export function startAuditOutboxWorker() {
  if (isPolling) return;
  isPolling = true;
  const poll = async () => {
    if (!isPolling) return;
    await processOutboxBatch();
    timeoutId = setTimeout(poll, POLL_INTERVAL_MS);
  };
  poll();
}

export function stopAuditOutboxWorker() {
  isPolling = false;
  if (timeoutId) clearTimeout(timeoutId);
}
