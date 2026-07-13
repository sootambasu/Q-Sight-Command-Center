# P0 Design Contracts
Version: 1.0
Date: 2026-07-13
Owner: Lead Orchestrator (A0)

## Purpose
These contracts define shared types and invariants that all implementation agents must use. They prevent incompatible models from being built independently.

## Contract 1: BuildProfile

```typescript
export type BuildProfile = 'demo' | 'production';
```

**Rules:**
- `production`: No mock data, no synthetic telemetry, no dev auth headers, no role simulation via query params.
- `demo`: Mock/synthetic data allowed; role simulation via headers/params allowed; clearly labeled synthetic.
- Source: `BUILD_PROFILE` environment variable.
- Default: `'demo'` (fail-open for development; production requires explicit opt-in).

## Contract 2: DataOrigin

```typescript
export type DataOrigin = 'live' | 'synthetic';
```

**Rules:**
- `live`: Data came from a real external source (OpenSky, USGS, CelesTrak).
- `synthetic`: Data is mock/generated for demo or testing.
- In production (`BUILD_PROFILE=production`): Only `live` is accepted in telemetry tables.
- The database enforces this via triggers (migration 002).

## Contract 3: QualityState

```typescript
export type QualityState = 
  | 'fresh'          // Within freshness threshold
  | 'stale'          // Past freshness threshold but within display threshold
  | 'expired'        // Past display threshold — MUST NOT render as current
  | 'degraded'       // Source known to be failing
  | 'no_trusted_data' // No data available (production with empty DB)
  | 'synthetic';     // Demo/test data
```

**Freshness thresholds (per source):**
- Aircraft (OpenSky): fresh < 5 min, stale < 15 min, expired ≥ 15 min
- Satellite TLE (CelesTrak): fresh < 24 h, stale < 72 h, expired ≥ 72 h
- Seismic (USGS): events are historical; age displayed but no expiry threshold

## Contract 4: TelemetryProvenance

Every telemetry API response and relevant WebSocket message MUST carry:

```typescript
interface TelemetryProvenance {
  data_origin: DataOrigin;
  source_provider: 'opensky' | 'celestrak' | 'usgs' | 'synthetic';
  observed_at?: string;        // ISO: when the source observed the event
  ingested_at?: string;        // ISO: when our worker ingested it
  source_last_success?: string; // ISO: last successful sync from this source
  record_age_seconds?: number; // Current age of the record
  quality_state: QualityState;
  quality_reason?: string;     // Human-readable reason for quality state
  source_limitations?: string; // Advisory note about source limitations
}
```

## Contract 5: VerifiedPrincipal

Server-side identity context. The client may NEVER set their own identity in production.

```typescript
interface VerifiedPrincipal {
  subject: string;           // JWT sub (server-verified) or dev-sim in demo
  issuer?: string;           // JWT iss (server-verified)
  sessionId?: string;        // JWT sid/jti
  organizationId?: string;
  siteId?: string;
  role: UserRole;            // Mapped server-side only
  permissions: Permission[];
  issuedAt?: number;
  expiresAt?: number;
  isDemoSim?: boolean;       // TRUE only in demo/dev mode
}
```

**Production rules:**
- `x-q-sight-role` header → REJECTED (401)
- `?role=` query param → REJECTED (401)
- `x-q-sight-user-id` header → REJECTED (401)
- Only `Authorization: Bearer <jwt>` is accepted

## Contract 6: ServerRequestId

Every API request and WebSocket connection gets a server-generated UUID as the authoritative request ID.

```typescript
const serverRequestId = randomUUID(); // crypto.randomUUID()
```

The client MAY submit a `x-client-correlation-id` for tracing. It is:
- Logged separately as `client_correlation_id`
- Never used as the authoritative request ID
- Validated: length ≤ 128, alphanumeric + hyphens only

## Contract 7: AlertStateMachine

```
open → acknowledged | suppressed
acknowledged → assigned | investigating | resolved
assigned → investigating | acknowledged | resolved  
investigating → resolved
resolved → open (reopen only)
suppressed → open (unsuppress only)
```

All transitions:
- Recorded as immutable `alert_events` rows
- Protected from modification by DB trigger
- Require actor identity (verified in production)
- Use optimistic concurrency (state_version check)
- Invalid transition returns HTTP 409 Conflict

## Contract 8: AuditEventV2 Fields (required)

Every authoritative audit event must include:
- `event_id` (server-generated UUID)
- `effective_role` (server-mapped, not client-supplied)
- `action` (from allowlist)
- `outcome` (success | denied | error | warning)
- `server_request_id` (server-generated UUID)
- `service_name` (constant per service)
- `event_time` (server DB time, CURRENT_TIMESTAMP)

Optional but required when available:
- `verified_subject` (JWT sub)
- `verified_issuer` (JWT iss)
- `session_id`
- `source_ip` (trusted proxy only)

## Contract 9: Sensor Metadata Registry (no stream fields)

The `sensor_registry` table (migrated from `authorized_cameras` via migration 005) MUST NOT contain:
- `stream_url`
- `verification_hash`
- Any streaming credential or access token
- Any playback configuration

Permitted fields: id, asset_id, name, sensor_category, status, registration_status, location (PostGIS point), custodian_id, authorization_status, authorized_at, created_at, updated_at.

## Contract 10: Migration Allocation

| Migration | Allocated To | Purpose | Status |
|-----------|-------------|---------|--------|
| 001 | EXISTING | Initial schema | DO NOT MODIFY |
| 002 | A3 | data_origin provenance on telemetry tables | PLANNED |
| 003 | A4 | Audit v2 + outbox | PLANNED |
| 004 | A5 | Alert platform | PLANNED |
| 005 | A6 | Sensor registry (rename + drop prohibited columns) | PLANNED |

**Rules:**
- Never edit a lower-numbered migration that may already be applied.
- Only A0 (Lead Orchestrator) allocates migration numbers.
- If a new migration is needed, request A0 approval before creating.

## Contract 11: No Overclaims

Until objectively verified by A8 (Independent Verification), these terms MUST NOT appear in authoritative docs:
- enterprise-grade
- immutable (for audit)
- pilot-ready
- production-ready
- enterprise-ready
- complete (for P0 work)

Use instead:
- "pre-production prototype"
- "locally append-only"
- "tamper-evident when externally anchored"
- "advisory-only decision support"
- "PARTIAL" for incomplete capabilities
