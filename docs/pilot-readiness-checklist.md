# Q-Sight Pilot/Staging Readiness Checklist

> [!NOTE]
> **Current Status**: Pilot hardening completed; this checklist is retained as the reusable Go/No-Go validation checklist for future staging/pilot runs.

This checklist defines the validation criteria for preparing the Q-Sight Command Center for a controlled staging and pilot deployment.

---

## 1. Environment Readiness
- [ ] Staging environment configuration template (`.env.staging.example`) exists.
- [ ] No raw credentials, secrets, or certificates are stored in `.env` templates.
- [ ] Environment variables (e.g., `DATABASE_URL`, `JWT_SECRET`, `OPENSKY_PASSWORD`) are configured to be injected by the environment manager at launch.
- [ ] Logging level is configured properly (e.g., `LOG_LEVEL=info` for staging/production).

## 2. Docker Readiness
- [ ] `docker compose -f infra/docker-compose.prototype.yml config` passes validation without syntax/schema errors.
- [ ] Docker images build successfully (`docker compose -f infra/docker-compose.prototype.yml build`).
- [ ] Containers (`postgres`, `api`, `web`) spin up cleanly (`docker compose up -d`).
- [ ] Health checks for PostGIS container report `healthy`.
- [ ] Containers terminate gracefully upon receiving shutdown signals (`docker compose down`).

## 3. Database Readiness
- [ ] Initial database schema (`infra/postgres/init/001_init.sql`) runs without errors on fresh startup.
- [ ] Versioned database migrations are managed via `schema_migrations` table.
- [ ] Each migration SQL file in `apps/api/src/db/migrations/` is applied exactly once.
- [ ] Database trigger `trg_protect_audit_logs` is verified to block `UPDATE` and `DELETE` on `audit_logs`.
- [ ] No schema migrations attempt to drop tables or erase live operational data.

## 4. Live Source Readiness
- [ ] OpenSky API username/password can be configured dynamically via env variables.
- [ ] Ingestor scheduler (`scripts/scheduled_ingestion.js`) runs continuously without crashing.
- [ ] Ingestor scheduler prevents overlapping execution of the same source ingestor.
- [ ] Safe minimum polling intervals are respected (OpenSky: 120s, Seismic: 5m, Satellite: 24h).
- [ ] Source parsing errors or network failures degrade gracefully and are handled without crashing the scheduler process.

## 5. WebSocket Readiness
- [ ] WebSocket server endpoint (`/ws/realtime`) accepts client connections.
- [ ] Server enforces query param credentials mapping or token checking at subscription time.
- [ ] Clients can subscribe to `telemetry.aircraft`, `telemetry.satellite`, `telemetry.seismic`, and `alerts.geofence`.
- [ ] Subscription requests block non-permitted roles (e.g., `auditor` blocked from operational telemetry).
- [ ] Heartbeat ticks (`system.websocket.heartbeat`) are emitted at the configured interval.

## 6. RBAC Verification
- [ ] Simulating roles (`operator`, `supervisor`, `auditor`, `admin`) filters coordinate data appropriately:
  - `operator`: Coordinates and owner IDs for authorized cameras are sanitized/withheld. Asset geofence boundary coordinates are withheld.
  - `supervisor`: Access to assets, camera metadata, and geofence coordinates is granted.
  - `auditor`: Telemetry coordinates are withheld; access restricted to audit logs.
  - `admin`: All assets, logs, and cameras accessible.

## 7. Audit Log Verification
- [ ] Actions like `camera_view`, `data_export`, `boundary_zoom`, and `ws_subscription` write append-only records to the `audit_logs` table.
- [ ] Logs capture request IDs, operator roles, target resource IDs, and timestamps.
- [ ] Attempting to delete or update any record in `audit_logs` throws a database permission error.

## 8. Safety Guardrail Verification
- [ ] Static safety scanner (`node scripts/verify_safety_guardrails.js`) runs successfully.
- [ ] Zero camera stream URLs (`stream_url`) are exposed to the client.
- [ ] Zero camera cryptographic verification hashes (`verification_hash`) are exposed to the client.
- [ ] No WebRTC, raw `<video>` tags, or biometric/facial/person-tracking features are present in the frontend console.

## 9. Demo Fallback Verification
- [ ] Set `LIVE_INGESTION_ENABLED=false` to verify the application falls back safely to offline mock data.
- [ ] Ingestors, API endpoints, and WebSocket delta emitters operate correctly with mock data when live sources are unreachable.

## 10. Rollback Plan
- [ ] In case of a staging deployment failure, check out the previous stable release tag.
- [ ] Database rollback: Since tables are not dropped, if any migration fails, roll back to the database snapshot before applying the migration.
- [ ] Run the native npm developer workflow as a backup verification system.

## 11. Known Limitations
- Developer role assignment is currently simulated via request headers (`x-q-sight-role`) or query parameters (`?role=...`). Staging/production must integrate session cookies or JWT tokens.
- Map visualizations utilize keyless OpenStreetMap tiles in offline environments. For full 3D photorealistic tiles, a Google Maps API key must be dynamically injected.

## 12. Go / No-Go Criteria
- [ ] **Go**: All safety guardrails pass, database migrations complete successfully, health endpoints return `status: ready`, and client loads in staging without exposing sensitive camera metrics.
- [ ] **No-Go**: Any camera stream URL is exposed to the frontend, safety scanner fails, database migrations crash startup, or websocket auth is bypassed.
