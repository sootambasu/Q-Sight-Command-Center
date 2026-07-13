# Audit Retention and Legal Hold Policy

## Retention Policy
1. **Local Outbox (udit_outbox)**: Events are retained locally for a maximum of 7 days after successful export to the SIEM. A scheduled pruning job will periodically delete processed events.
2. **Dead-Letter Queue**: Events marked as dead_letter are retained indefinitely until manual intervention resolves the export issue.
3. **Primary Storage (SIEM)**: Long-term retention is governed by the SIEM policies, configured to retain audit logs for 1 year (or as required by compliance).

## Legal Hold
1. **Local DB**: The local udit_outbox table does NOT support legal hold flags natively, as it is ephemeral transit storage.
2. **Enforcement**: Any legal hold requirements MUST be applied at the SIEM destination, ensuring that data subject to litigation or investigation cannot be purged from long-term storage.

## Deletion
1. Routine deletion of processed logs from the local database occurs automatically to conserve disk space.
2. In the event of system decommissioning, a final sync must be verified prior to dropping the local database.
