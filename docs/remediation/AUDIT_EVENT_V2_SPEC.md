# Audit Event V2 Specification

## Overview
The Q-Sight Command Center enforces strict auditing. Migration 003 introduces the Transactional Audit Outbox pattern for V2 audit events.

## Structure
All audit events follow the `AuditLogEvent` interface from `@q-sight/shared`.
Events are written to the `audit_outbox` table in PostgreSQL as a JSONB payload.

## Guarantee
The outbox pattern guarantees that audit events are durably recorded in the local database within the same network boundary before they are optionally forwarded to a SIEM.
