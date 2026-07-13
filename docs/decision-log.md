# Architectural Decision Log (ADR)

This document tracks major architectural decisions, their context, and the rationale behind choosing them.

---

## ADR 001: Backend Core Framework - Fastify
*   **Status**: Accepted
*   **Date**: 2026-06-29
*   **Context**: The Q-Sight Command Center API requires high-performance REST routing, robust WebSocket integration for live data updates, and native validation capabilities.
*   **Decision**: Lock backend API stack to **Fastify** instead of Express.
*   **Rationale**:
    *   **Performance**: Fastify is significantly faster than Express and has lower overhead.
    *   **Native Schema Validation**: Out-of-the-box support for JSON Schema (via Ajv) ensures input schemas are validated before executing handler logic.
    *   **First-class TypeScript Support**: Integrates cleanly with compiler declarations.
    *   **WebSocket Plugin**: Native plugin `fastify-websocket` simplifies stream routing.

---

## ADR 002: Programming Language - TypeScript (Base Config)
*   **Status**: Accepted
*   **Date**: 2026-06-29
*   **Context**: Monorepos with multiple services (web client, API, ingestor workers) often suffer from type drift and payload mismatch.
*   **Decision**: Enforce **TypeScript** across all packages, applications, and workers using a shared `tsconfig.base.json`.
*   **Rationale**:
    *   Ensures compile-time type safety.
    *   Allows `packages/shared` to export validation schemas and types that both workers and APIs import, guaranteeing single source of truth for telemetry interfaces.

---

## ADR 003: Spatial Database - PostgreSQL + PostGIS
*   **Status**: Accepted
*   **Date**: 2026-06-29
*   **Context**: Telemetry sources (planes, satellites, earthquakes, assets) are fundamentally spatial and require geographic queries (e.g., proximity checks, geofencing).
*   **Decision**: Use **PostgreSQL** with the **PostGIS** extension.
*   **Rationale**:
    *   PostGIS is the industry-standard database extension for geographic spatial data.
    *   Supports coordinate transforms, distance calculations (e.g., `ST_DWithin`), and polygon geofences directly in SQL queries.
    *   GIST indexing provides optimal performance for real-time bounding box queries.

---

## ADR 004: 3D Globe Visualization - CesiumJS with Google 3D Tiles
*   **Status**: Accepted
*   **Date**: 2026-06-29
*   **Context**: Operators require realistic terrain details to assess hazard impacts on assets in true 3D space.
*   **Decision**: Use **CesiumJS** coupled with **Google Photorealistic 3D Tiles**.
*   **Rationale**:
    *   CesiumJS provides robust support for space-grade coordinates, satellite orbits, and aviation paths.
    *   Google Photorealistic 3D Tiles offer unparalleled 3D mesh detail for urban and industrial locations, rendering building shapes and mountain heights in high fidelity.

---

## ADR 005: Strict Privacy Guardrails & Safety Auditing
*   **Status**: Accepted
*   **Date**: 2026-06-29
*   **Context**: Geospatial tracking interfaces run the risk of becoming surveillance systems or violating personal privacy.
*   **Decision**: Implement strict programmatic restrictions (e.g., ban facial recognition, ban public CCTV scraping, force audit logs for camera views).
*   **Rationale**:
    *   Ensures the system remains focused strictly on industrial operations, safety, and logistics.
    *   Guarantees corporate compliance with global privacy regulations (such as GDPR and HIPAA).

---

## ADR 006: Core Data Foundation, API Skeleton, and Mock Ingestors (v0.2)
*   **Status**: Accepted
*   **Date**: 2026-06-29
*   **Context**: Establishing a reliable data boundary, backend routing skeleton, and simulated telemetry input for planes, satellites, and earthquakes.
*   **Decision**:
    *   Expose types and validation schemas in a shared library `@q-sight/shared` loaded as an npm workspace.
    *   Initialize PostgreSQL/PostGIS tables using a native `/docker-entrypoint-initdb.d` initialization script.
    *   Leverage Fastify with raw `pg` pools for low-overhead routing and database connectivity tests.
    *   Implement mock workers that validate telemetry via shared schemas and conditionally insert them via upsert SQL commands when enabled.
*   **Rationale**:
    *   **Shared Types/Schemas**: Protects the monorepo from data drift and ensures data satisfies constraint bounds before database entry.
    *   **Mock Verification**: Separating static syntax checks and execution tests from active database writes makes local development and CI testing fast and dependable.
    *   **Upsert Idempotency**: Using `ON CONFLICT DO UPDATE` ensures telemetry workers can safely run repeatedly without duplicating or corrupting coordinate logs.
    *   **Audit Safety**: Adding database triggers to audit log tables blocks row updates and deletes directly inside PostGIS, providing a firm safety line.

---

## ADR 007: CesiumJS Frontend Shell and Read-Only API Integration (v0.3)
*   **Status**: Accepted
*   **Date**: 2026-06-29
*   **Context**: Building the frontend foundation and integrating telemetry visualization in a robust, high-contrast, security-compliant user interface.
*   **Decision**:
    *   Initialize `apps/web` as a React Vite SPA.
    *   Integrate CesiumJS with a no-key OpenStreetMap imagery provider fallback, avoiding crash vectors if Ion keys are missing.
    *   Deploy standard read-only telemetry routing payloads matching the `{ source, count, items }` shape.
    *   Enforce a zero-exposure boundary on `/api/cameras/authorized` by omitting `stream_url` and `verification_hash` at the route handler level, displaying a protected warning shield on the client.
    *   Link the monorepo workspaces via Windows directory junctions to resolve dependency hoisting conflicts cleanly.
*   **Rationale**:
    *   **Keyless Independence**: Ensuring the application runs without external api credentials reduces development friction and establishes visual safety hooks out-of-the-box.
    *   **Metadata Protection**: Sanitizing camera streams at the route database queries prevents credential or endpoint leaks down to the client.
    *   **Standardized Serialization**: Consistent REST payloads simplify frontend API wrappers and ensure predictable parsing.

---

## ADR 008: State Hardening, Configurable Polling, and Map Rendering Stability (v0.4)
*   **Status**: Accepted
*   **Date**: 2026-06-29
*   **Context**: As data scales and networks experience latency or failures, the client dashboard needs robust polling, stale data caching, timeline summarization, and stable map entity tracking without performance degradation.
*   **Decision**:
    *   Refactor state management into standard React Hooks: `useDashboardData` (telemetry, connectivity, timeline compilation) and `usePolling` (timer ticks, manual sync, play/pause).
    *   Enforce cache resiliency: if REST endpoints fail, preserve previously loaded data elements, flag the data source status indicator as stale/offline, and show the last successful sync time.
    *   Implement client timeout handling: wrap all fetch calls in `AbortController` hooks configured with an 8-second timeout threshold.
    *   Stabilize map rendering: assign persistent stable IDs (`type_id`) to Cesium primitives and update coordinates in place. Remove outdated entities from the map.
    *   Add an Operational timeline footer feed displaying deterministic aviation, orbit, seismic, and camera status changes without personal identification data.
*   **Rationale**:
    *   **Operator Focus**: Keeping stale data visible during network blips prevents empty screens or broken dashboards, which is critical in an industrial environment.
    *   **Cesium Performance**: Modifying existing primitives in-place avoids endless recreation overhead, prevents memory leaks, and maintains map selection highlight outlines.
    *   **Ethical Control**: Filtering and formatting timeline logs locally ensures the operational room displays pure mechanical and geographic updates without surveillance wording.

## Decision 5: Cesium Geometry Validation & Satellite Footprint Hardening

*   **Status**: Accepted
*   **Date**: 2026-06-29
*   **Context**: Runtime manual testing showed a fatal error overlay (`positions is required`) inside the Cesium canvas when updating polygon coordinate properties. Additionally, invalid/empty coordinates or malformed API responses could crash the rendering thread.
*   **Decision**:
    *   Implement defensive validation helpers checking coordinate values against finite number WGS84 ranges before sending them to Cesium.
    *   Explicitly create `Cesium.PolygonHierarchy` objects for boundary rendering instead of passing raw arrays to polygon hierarchy properties, resolving the root cause of the `positions is required` crash.
    *   Disable satellite footprint/orbit polygon rendering in the v0.4 console to ensure visual stability, rendering satellites as point-markers at their computed center points only.
    *   Harden the entity update cycle: check if an existing entity's graphics matches the target graphic type. If mutated to an incompatible type, remove and recreate the entity. Skip bad geometry records without crashing the viewer and show a non-blocking skipped count banner.
*   **Rationale**:
    *   **Stabilization**: Ensures the dashboard stays up and the Cesium globe continues rendering even if upstream telemetry or cache pipelines feed invalid geometries.
    *   **Strict Scope**: Postpones orbit path drawing and footprint polygon overlays to v0.5/v0.6, prioritizing console load stability in v0.4.

## Decision 6: Governance Compliance, Simulated RBAC, and Audit Logging (v0.5)

*   **Status**: Accepted
*   **Date**: 2026-06-29
*   **Context**: Q-Sight requires corporate governance, audit logs, and access management to comply with security guidelines.
*   **Decision**:
    *   Implement Simulated RBAC: User context is parsed via headers (`x-q-sight-role` and `x-q-sight-user-id`) for development-only testing.
    *   Define Roles & Permissions: `operator` gets safe camera summaries; `supervisor` gets full assets & cameras; `auditor` gets compliance log panels only; `admin` gets all capabilities.
    *   Implement Role-Based Filtering: Assets boundary coordinates are filtered out for operators and auditors. Camera coordinates and owner IDs are filtered out for operators.
    *   Write safe, append-only logs: Audit entries are written to PostgreSQL `audit_logs` table (expanded via startup dev migrations). Trigger protection blocks UPDATE or DELETE commands.
    *   Establish Audit Viewer: Auditors and Admins view compliance reports with statistics in a dedicated dashboard overlay.
*   **Rationale**:
    *   Ensures that only authorized operations personnel can view geofences or sensitive coordinates.
    *   Ensures immutable log trailing for security investigations.
    *   Protects network bandwidth and prevents database denial-log spamming via role-aware polling exclusions and rate-limited log buffers.

---

## ADR 010: V0.6 WebSocket Architecture — Non-Camera Telemetry Pipeline
*   **Status**: Accepted
*   **Date**: 2026-06-29
*   **Context**: V0.6 required adding real-time capability while maintaining strict privacy and safety constraints. Multiple approaches were considered.
*   **Decision**:
    *   Use `@fastify/websocket@^8` (Fastify v4 compatible) to add a single `/ws/realtime` WebSocket endpoint.
    *   Implement a channel-based subscription model (operator subscribes to named channels after connecting).
    *   Mock broadcaster generates aircraft/satellite/seismic deltas at configurable intervals without touching the database.
    *   Geofence alerts are generated server-side for mechanical/asset-boundary crossings only — never persons or crowds.
    *   Role is resolved from query params in development mode; documented for production JWT replacement.
*   **Rationale — Why channel-based subscriptions?**:
    *   Allows future horizontal scaling — a broker (e.g., Redis pub/sub) can distribute to multiple WS server instances without changing the client protocol.
    *   Provides RBAC enforcement at the subscription layer, independent of broadcast logic.
    *   Makes it easy to audit what each connection subscribed to.
*   **Rationale — Why complementary with REST polling?**:
    *   WebSocket provides sub-10s position delta freshness; REST provides reliable full-state sync on reconnect.
    *   If WS connection drops, the frontend falls back to REST polling automatically — no data gap.
    *   Auditors continue using REST audit endpoints; they never receive WS telemetry streams.
*   **Safety decisions**:
    *   Camera-related channels (`cameras.*`) are absent from `WsChannelSchema` by design — they cannot be subscribed to even with a code error.
    *   Geofence alert `source_type` enum contains only `['aircraft', 'satellite', 'seismic']` — persons are not in this enum and cannot be added without a schema change.
    *   Audit throttle (2-minute cooldown per event key) prevents WS heartbeat and geofence events from flooding the audit log.
    *   All WS message types that would expose camera URLs, verification hashes, or owner identifiers are explicitly absent from the message type enum.

---

## ADR 011: v0.7 Live Ingestion Architecture — Cautious Open-Data Adapters
*   **Status**: Accepted
*   **Date**: 2026-06-29
*   **Context**: Implementing live open-data ingestion for non-camera telemetry (Aircraft, Satellites, Seismic) while ensuring zero camera/video/biometric access.
*   **Decision**:
    *   Implement isolated, cautious live adapters inside each worker workspace, fully controlled by opt-in flags: `LIVE_INGESTION_ENABLED`, `AIRCRAFT_LIVE_ENABLED`, etc.
    *   Introduce a common `IngestionResult` validation envelope inside `@q-sight/shared`.
    *   Use a shared robust HTTP client with timeouts (`INGESTION_REQUEST_TIMEOUT_MS`) to prevent hung ingestion workers.
    *   Implement complete offline-safe fallback: if live is disabled or fails, workers automatically fall back to mock data.
    *   Isolate DB writes behind `LIVE_INGESTOR_WRITE_TO_DB`.
    *   For Satellite data, store only parsed TLE metadata defensively and keep footprint/rendering restricted to point-marker safe fallbacks.
    *   WebSocket broadcasters dynamically query database records for live updates if fresh data exists, falling back to mock drift simulation if empty.
    *   Worker lifecycle logging uses structured JSON console output without direct DB audit writes.
*   **Rationale**:
    *   **Opt-in Safety**: Default-off live configurations ensure the dashboard operates offline-safe without credential dependency or accidental network access.
    *   **Database Preservation**: Separate DB write flags prevent runaway database table exhaustion.
    *   **Defensive Parsing**: Defensively validating responses with Zod schema guards against malformed third-party payloads crashing ingestor processes.
    *   **Telemetry Separation**: Telemetry data streams and access audit records are kept strictly distinct; workers write lifecycle events to stdout rather than inserting directly into `audit_logs`.


---

## ADR 012: V0.9 Demo Release Candidate Polish
*   **Status**: Accepted
*   **Date**: 2026-06-29
*   **Context**: Preparing the project for executive demonstration, creating final handover assets, and validating all documentation and functionality without introducing new scope creep.
*   **Decision**:
    *   No new features (including video playback, webRTC, or live camera streaming) are allowed.
    *   The docs/final-handover.md is generated as the ultimate reference for starting and evaluating the demo.
    *   UI spacing and grid layout are double-checked for multiple viewports.
*   **Rationale**:
    *   Prevents scope creep before demo day.
    *   Reaffirms the strict ethical constraints on video and surveillance tech before executive presentation.

---

## ADR 013: Pilot/Staging Readiness Hardening (v1.0 Release Candidate)
*   **Status**: Accepted
*   **Date**: 2026-06-30
*   **Context**: Preparing Q-Sight for controlled staging/pilot deployment requires governance, hardening of operational components, and thorough security checking.
*   **Decision**:
    *   **Health and Readiness Endpoints**: Add `/ready` and `/version` API endpoints to allow orchestrators (e.g., Kubernetes) to verify database connectivity, PostGIS availability, configuration shape, and app version metrics dynamically.
    *   **Safer Migrations**: Maintain applied schema versions in a `schema_migrations` table and run versioned `.sql` migrations transactionally and sequentially during startup, deprecating temporary ad-hoc `ALTER` scripts.
    *   **Scheduler Hardening**: Prevent overlapping jobs by enforcing locks, enforce minimum OpenSky intervals (120s) with override warnings, handle SIGINT/SIGTERM signals gracefully, and ensure robust error boundaries so that failure of one worker does not crash the scheduler.
    *   **Structured Logging**: Integrate structured completion logging for all HTTP requests and WebSocket lifecycle actions.
    *   **Static Safety Verification**: Deploy a conservative script `scripts/verify_safety_guardrails.js` to scan codebase for forbidden facial-recognition, person-tracking, WebRTC, or camera-streaming properties.
*   **Rationale**:
    *   Prevents configuration errors or db mismatches from causing silent application failures in staging.
    *   Ensures immutable log trails and strict compliance verification prior to pilot deployment.
    *   Maintains the strict ethical constraints by adding automated build-time scanner validation.

