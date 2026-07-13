import { AuditLogEvent } from '@q-sight/shared';

export async function exportHttps(event: AuditLogEvent): Promise<void> {
  const siemUrl = process.env.SIEM_WEBHOOK_URL;
  if (!siemUrl) {
    throw new Error('SIEM_WEBHOOK_URL is not configured for HTTPS export');
  }

  const response = await fetch(siemUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \Bearer \\
    },
    body: JSON.stringify(event)
  });

  if (!response.ok) {
    throw new Error(\SIEM export failed with status: \\);
  }
}
