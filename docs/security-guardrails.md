# Security & Privacy Guardrails

This document establishes the binding security controls, privacy guardrails, and auditing mechanisms implemented in the **Q-Sight Command Center**.

---

## 🚫 Core Safety & Ethics Bans (No-Go Guardrails)

To prevent misuse, the system implements strict functional exclusions. The following capabilities are explicitly banned and must not be introduced into any codebase within this monorepo:

### 1. No Facial Recognition / Biometric Identification
*   **Definition**: The extraction, processing, or comparison of human facial geometry, gait patterns, or any biometric signifiers.
*   **Control**: Both frontend views (`apps/web`) and backend services (`apps/api`) are technically prohibited from loading face-detection models (e.g., TensorFlow FaceMesh, OpenCV cascades) or parsing face geometries. Camera streams are not implemented and video playback is intentionally excluded in this release.

### 2. No Public CCTV Scraping & Stream Discovery
*   **Definition**: The indexing, fetching, or parsing of unsecured public video feeds from tools like Shodan, Insecam, or public camera directories.
*   **Control**: All camera endpoints in the database registry require owner credentials. The backend rejects attempts to register standard public CCTV directory URLs or unauthenticated streaming endpoints.

### 3. No Covert / Hidden Recording
*   **Definition**: Saving video feeds, stream snapshots, or telemetry logs without operator-facing visual confirmation or without explicit retention expiry policies.
*   **Control**: Recording is not supported in this release. Camera metadata remains metadata-only. Any future camera/video capability (including recording or streaming) would require separate architecture review, authorization workflow, audit controls, and explicit approval.

### 4. No Person Tracking
*   **Definition**: Geolocation tracking, filtering, or targeting of individual human beings, pedestrians, or crowds.
*   **Control**: The UI and database schemas do not contain fields for names, descriptions, or tracking tags of individuals. Telemetry is restricted to mechanical assets (aircraft, satellite orbital paths, stationary industrial structures).

### 5. No Predictive Policing or Social Profiling
*   **Definition**: Using machine learning or mathematical scoring to predict human behavior, profile groups, or alert on human movements.
*   **Control**: No intelligence algorithms for human behavioral scoring are permitted. Spatial alerts are triggered purely by inanimate, physical metrics (e.g., seismic activity magnitude, structural sensor failures).

---

## 🔒 Mandatory Ingestion Safeguards

### 1. Explicit Camera Feed Authorization
*   Every camera registered on the dashboard must be verified via the sensor metadata registry.
*   During registration, the owner must sign a challenge string with their private asset key, or provide OAuth2 credentials verifying their ownership of the asset registry data.
*   Because camera streams are not implemented and video playback is intentionally excluded, camera data remains metadata-only. Any future streaming implementation would require a complete security review, authorization protocol, and explicit approval.

### 2. Audit Logging — Locally Append-Only (External Anchoring Planned)

> [!WARNING]
> Audit logs are **locally append-only** via a PostgreSQL trigger that blocks UPDATE and DELETE.
> **External anchoring (SIEM/outbox) is PLANNED but not yet implemented.**
> Database-level append-only control exists locally; enterprise-grade immutability requires external append-only replication.

*   All high-sensitivity actions must write to the `audit_logs` table.
*   **Sensitive Actions Include**:
    *   Accessing authorized sensor/camera metadata (logged for supervisor/admin; redacted summary logged for operator).
    *   Retrieving sensitive geofences and asset boundaries.
    *   Viewing compliance audit records (logged as `audit_logs_viewed` or `audit_summary_viewed`).
    *   Failed access attempts blocked by RBAC (logged as `access_denied` with rate-limiting).
*   The audit log table is structurally append-only at the database level; there are no UPDATE or DELETE API endpoints.
*   **Production requirement**: This table must be replicated to an external append-only logging service (e.g., AWS CloudWatch Logs, Splunk, or equivalent SIEM) before this can be considered audit-grade. External anchoring is **PLANNED** and not yet implemented.

### 3. Role-Based Access Control (RBAC)
*   **operator**: Permitted to view basic asset metrics and safe camera status summaries (name and status only). Omitted from exact spatial coordinates, stream connections, and audit records.
*   **supervisor**: Permitted to view full asset geofences and authorized camera metadata. Excluded from viewing audit records.
*   **auditor**: Permitted to view compliance logs and summaries. Excluded from viewing operational telemetry.
*   **admin**: Superuser role inheriting all permissions.
*   **Development Simulation**: Current user roles are simulated via `x-q-sight-role` and `x-q-sight-user-id` request headers. This is strictly a development environment mechanism and these headers are rejected/ignored in the production profile. Production auth must use OIDC/JWKS or equivalent verified identity.

---

## V0.6 WebSocket Safety Controls

### Permitted WebSocket Channels (Exhaustive List)
The allowed channel list is defined in `WsChannelSchema` (shared package):
```
telemetry.aircraft   — aircraft position deltas only
telemetry.satellite  — satellite footprint centroid deltas only
telemetry.seismic    — seismic event status only
alerts.geofence      — industrial asset boundary crossing alerts
```

### Explicitly Prohibited WebSocket Channels
- `cameras.*` — No camera stream channels exist in the schema
- `video.*` — No video channels exist
- `biometric.*` — No biometric channels exist
- `persons.*` — No person-tracking channels exist

### Geofence Alert Safety Contract
Geofence alerts implement the following safety restrictions (enforced via `WsGeofenceAlertSchema`):
- `source_type` enum: `['aircraft', 'satellite', 'seismic']` — persons, crowds, or vehicles tied to individuals are not and cannot be alerting sources without a breaking schema change
- `alert_type` enum: `['asset_boundary_enter', 'asset_boundary_exit', 'seismic_near_asset']` — no "person entered zone" type exists
- All messages use industrial operations language only

### WebSocket Authentication
- **Development**: Role resolved from `?role=` query parameter — documented as DEV-ONLY with explicit warnings in code and docs
- **Production path**: Must replace with JWT Bearer token in WebSocket handshake headers or a pre-auth REST handshake that returns a single-use WS ticket
- Browser WebSockets cannot reliably set custom headers — production auth should use a pre-auth ticket approach

### Audit Controls for WebSocket
- `ws_connection_opened` — logged on first connection per user (2-minute cooldown)
- `ws_subscription_accepted` — logged when channels are granted (throttled)
- `ws_subscription_denied` — logged when auditor or insufficient-role channels are denied
- `geofence_alert_emitted` — logged when a geofence alert is sent (2-minute per asset/source pair)
- `ws_connection_closed` — logged on disconnect (throttled)
- Heartbeat events are NOT logged to prevent audit log flooding

---

## V0.7 Ingestion Safety Controls

### 1. Opt-in Architecture
*   All live ingestion adapters are disabled by default.
*   The system operates using local mock data unless explicitly configured via opt-in environment variables: `LIVE_INGESTION_ENABLED=true`, `AIRCRAFT_LIVE_ENABLED=true`, etc.

### 2. Isolation of Camera Assets
*   Ingestion workers only fetch public, inanimate mechanical/geophysical telemetry: aircraft transponder locations, satellite orbital TLE elements, and USGS seismic data.
*   **No camera data, video files, biometric metrics, or human location records are ever fetched, queried, parsed, or processed by background workers.**

### 3. Rate Limits & Database Flood Protection
*   All ingestors are configured with explicit request timeouts (`INGESTION_REQUEST_TIMEOUT_MS`) to prevent hung worker tasks.
*   Database writes are separately guarded by `LIVE_INGESTOR_WRITE_TO_DB`. If disabled, data is processed in-memory or skipped without DB insertion, preventing database exhaustion.
*   Ingestors restrict the maximum records parsed per run (`INGESTION_MAX_RECORDS_PER_RUN=500`).

### 4. Structured JSON Logging Only
*   Worker lifecycle logging uses stdout JSON console logs (`ingestion_run_started`, `ingestion_run_completed`, `ingestion_run_failed`, `ingestion_records_skipped`).
*   No credentials, passwords, usernames, or raw external payloads are printed to the logs.
*   Workers do not write directly to the `audit_logs` database table. The `audit_logs` table remains reserved exclusively for user access compliance logs.

---

## 🛡️ Automated Safety Verification Scanner

To prevent regression and enforce compliance, a static code analyzer is deployed at `scripts/verify_safety_guardrails.js`. 

### Checked Patterns
- **Frontend leaks**: Scans `apps/web/src` for exposure of sensitive sensor properties.
- **Feature bans**: Verifies no direct `<video>` tags or WebRTC APIs (`getUserMedia`, `RTCPeerConnection`) are invoked.
- **WebSocket privacy**: Blocks subscriptions to camera-related channels (`camera.*`, `feed.*`).
- **Biometric vocabulary**: Flags usage of biometric, facial recognition, or person tracking terminology in database schemas, models, or backend route files.
- **Credential leaks**: Ensures env templates do not contain hardcoded sensitive production credentials.

### Integration
The scanner runs locally or in CI pipelines:
```bash
node scripts/verify_safety_guardrails.js
```
Any violation exits with code `1` and aborts build/deployment stages.


