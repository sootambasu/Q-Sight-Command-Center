# Sensor Metadata Registry — Scope Definition

**Document Version:** 1.0  
**Date:** 2026-07-13  
**Author:** Agent A6 — Camera Scope Removal (Q-Sight P0 Hardening)  
**Migration:** 005_sensor_registry  

---

## Purpose

This document defines the precise scope of data that the Q-Sight Sensor Metadata Registry is permitted to store and expose. It serves as a binding contract for all API routes, shared types, database schemas, mock data, and frontend components that interact with sensor/camera registration data.

---

## What is Permitted

The following fields are permitted in the `sensor_registry` table and `SensorRegistryEntry` type:

| Field | Description |
|-------|-------------|
| `id` | UUID primary key for the sensor record |
| `asset_id` | Reference to the associated industrial asset |
| `name` | Human-readable display name for the sensor |
| `sensor_category` | Sensor type: `camera`, `environmental`, `seismic`, `thermal`, etc. |
| `status` | Operational status: `online`, `offline`, `disabled` |
| `latitude` | Coarse/authorized location coordinate (read via PostGIS ST_Y) |
| `longitude` | Coarse/authorized location coordinate (read via PostGIS ST_X) |
| `owner_id` | Custodian organisation or operator identifier (not a personal identifier) |
| `authorization_status` | Authorization lifecycle: `pending`, `verified`, `revoked` |
| `registration_status` | Administrative lifecycle: `registered`, `suspended`, `decommissioned` |
| `authorized_at` | Timestamp of authorization decision |
| `created_at` | Record creation timestamp |
| `updated_at` | Record modification timestamp |

### RBAC Controls on Permitted Fields

Even permitted fields are subject to role-based access control:

- **Operator role** (`cameras:summary:read` only): receives `id`, `asset_id`, `name`, `sensor_category`, `status`, `authorization_status`, plus a `protected: true` flag with a restriction message.
- **Supervisor/Admin role** (`cameras:metadata:read`): receives all permitted fields above.

---

## What is Prohibited

> [!CAUTION]
> The following fields must NEVER appear in the `sensor_registry` table, `SensorRegistryEntry` type, any API response, mock data, or any intermediate DTO/VO in the Q-Sight codebase.

| Prohibited Field | Reason |
|-----------------|--------|
| `stream_url` | Secret access credential. Exposes stream endpoint to unauthorized parties. |
| `verification_hash` | Cryptographic secret. Was stored as `VARCHAR(64)` SHA-256 hash in `authorized_cameras`. Constitutes a proof-of-ownership secret. |
| `access_token` | Authentication credential — must live only in secrets management. |
| `api_key` | Authentication credential — must live only in secrets management. |
| `playback_config` | Stream configuration object. May embed URLs or tokens. |
| Any biometric field | Person tracking, facial recognition, gait analysis, crowd monitoring, etc. are prohibited by Q-Sight core scope policy. |
| Any person-tracking field | Predictive policing, social profiling, individual vehicle tracking are prohibited. |

---

## API Endpoints

### Current (Post-Migration 005)

```
GET /api/sensors/registry
```

- Queries `sensor_registry` table
- RBAC: requires `cameras:summary:read` (base); `cameras:metadata:read` for full metadata
- Never selects `stream_url` or `verification_hash` (columns do not exist)
- Audit action: `sensor_metadata_view_authorized` / `sensor_metadata_view_redacted`
- No mock fallback in production (`NODE_ENV=production` or `BUILD_PROFILE=live`)

### Deprecated (Returns 410 Gone)

```
GET /api/cameras/authorized  →  HTTP 410 Gone
```

- Returns structured 410 response with migration instructions
- Permanently removed as of 2026-07-13

---

## Database Table

| | Before (migration 001) | After (migration 005) |
|--|--|--|
| Table name | `authorized_cameras` | `sensor_registry` |
| `stream_url` column | `VARCHAR(500) NOT NULL` | **DROPPED** |
| `verification_hash` column | `VARCHAR(64) NOT NULL` | **DROPPED** |
| `sensor_category` column | absent | `VARCHAR(50) NOT NULL DEFAULT 'camera'` |
| `registration_status` column | absent | `VARCHAR(50) NOT NULL DEFAULT 'registered'` |
| Spatial index | `idx_cameras_location` | `idx_sensor_registry_location` |

---

## Shared Type

| | Before | After |
|--|--|--|
| Schema name | `AuthorizedCameraRegistryEntrySchema` | `SensorRegistryEntrySchema` |
| Type name | `AuthorizedCameraRegistryEntry` | `SensorRegistryEntry` |
| `stream_url` field | `z.string().url()` required | **REMOVED** |
| `verification_hash` field | `z.string().length(64)` required | **REMOVED** |
| Backward alias | — | `AuthorizedCameraRegistryEntrySchema` / `AuthorizedCameraRegistryEntry` (deprecated) |

---

## Migration

See [CAMERA_SCOPE_MIGRATION.md](./CAMERA_SCOPE_MIGRATION.md) for full migration details.

---

## Enforcement

1. `scripts/verify_safety_guardrails.js` — scans for `stream_url` and `verification_hash` patterns in frontend code
2. Zod schema validation — `SensorRegistryEntrySchema` enforces the permitted field set at runtime
3. SQL SELECT statements — never select prohibited columns (they no longer exist post-migration 005)
4. RBAC middleware — `requirePermission('cameras:summary:read')` gates all sensor registry access
