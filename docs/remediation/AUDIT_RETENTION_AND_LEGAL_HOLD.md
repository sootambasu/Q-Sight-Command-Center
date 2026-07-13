# Audit Retention and Legal Hold

## Policy
- **Retention**: Local database audit records in `audit_outbox` and legacy `access_audit_log` are retained indefinitely during the prototype phase.
- **Pruning**: A future cleanup job will prune successfully exported logs from the outbox.
- **Legal Hold**: Must be enforced at the external SIEM level once configured. Local databases will not support legal hold flags.
