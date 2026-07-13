import { AuditLogEvent } from '@q-sight/shared';

export async function exportLocalDev(event: AuditLogEvent): Promise<void> {
  console.log('[LOCAL AUDIT LOG]', JSON.stringify(event));
}
