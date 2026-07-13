# Migration Number Allocation
Owner: Lead Orchestrator (A0)
Date: 2026-07-13

## Allocation Table

| Migration Number | Allocated Agent | Purpose | Files to Create | Status |
|-----------------|----------------|---------|-----------------|--------|
| 001 | EXISTING | Initial schema: industrial_assets, aircraft_positions, satellite_orbits, seismic_events, authorized_cameras, audit_logs | `infra/postgres/init/001_init.sql` | APPLIED (do not modify) |
| 002 | A3 | Add data_origin, provenance fields, and production-enforcement trigger to all telemetry tables | `infra/postgres/init/002_data_origin_constraint.sql` | ALLOCATED |
| 003 | A4 | Audit event v2 schema + audit outbox table | `infra/postgres/init/003_audit_v2.sql` | ALLOCATED |
| 004 | A5 | Alert platform: alerts, alert_events, alert_assignments, alert_comments, notification_deliveries, maintenance_windows, alert_rule_versions | `infra/postgres/init/004_alerts.sql` | ALLOCATED |
| 005 | A6 | Sensor registry: rename authorized_cameras to sensor_registry, drop stream_url and verification_hash | `infra/postgres/init/005_sensor_registry.sql` | ALLOCATED |

## Rules

1. Only the Lead Orchestrator (A0) allocates migration numbers.
2. Agents must use their allocated number exactly.
3. Never edit a migration that may already be applied.
4. Use transactional migrations (BEGIN; ... COMMIT;) where possible.
5. All migrations must be idempotent where practical (use IF EXISTS / IF NOT EXISTS).
6. Test migration from:
   - Fresh database
   - Current prototype schema (after 001 is applied)
   - Partially populated representative data

## Rollback Policy

These migrations are additive (new tables and columns). Rollback is a forward-fix:
- New columns can be dropped in a future migration
- New tables can be dropped in a future migration
- The `stream_url`/`verification_hash` drop (005) requires a backup snapshot first

## Next Available Migration Number

006 (request A0 approval before using)
