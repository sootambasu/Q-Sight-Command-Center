# Audit External Anchoring

## Overview
While Q-Sight relies on PostgreSQL for local durability of audit logs, enterprise standards require tamper-evident external anchoring.

## Implementation Plan (Blocked)
An HTTPS exporter (`httpsExporter.ts`) will forward the `audit_outbox` entries to an external SIEM. This is currently blocked pending Identity Provider (IdP) and SIEM configuration.

Until unblocked, logs remain authoritative only within the local PostgreSQL instance.
