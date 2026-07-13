# Pilot & Operations Runbook (v1.0)

## 1. Purpose
This runbook details the controlled startup, operation, and verification of the Q-Sight Command Center v1.0. It provides safe procedures for operating in mocked demo, local live, and staging/pilot environments.

## 2. Architecture Summary
*   **Database**: PostGIS (Stores telemetry, assets, audit logs)
*   **API**: Fastify (REST endpoints + WebSocket real-time channels)
*   **Web**: React / Vite / CesiumJS / Nginx (in Docker)
*   **Workers**: Independent Node scripts for fetching external feeds managed by a scheduling coordinator

## 3. Native Local Startup
To run the environment natively using `npm`:
```bash
# 1. Start the database
npm.cmd run db:up

# 2. Start the API server (Port 4000)
npm.cmd run dev:api

# 3. Start the Web frontend (Port 5173)
npm.cmd run dev:web
```

## 4. Docker Startup
To run the full environment using Docker Compose:
```bash
# 1. Build the images
docker compose -f infra/docker-compose.prototype.yml build

# 2. Start Database, API, and Web services
docker compose -f infra/docker-compose.prototype.yml up -d postgres api web
```

## 5. Environment Separation & Profiles

### A. Demo/Mock Mode Profile (Local Demo)
Use this mode for reliable, predictable executive demonstrations.
1. Copy `.env.demo.example` to `.env`.
2. Ensure `LIVE_INGESTION_ENABLED=false` and `MOCK_INGESTOR_WRITE_TO_DB=false`.
3. Restart the API. On the frontend, enable the "Demo Mode" toggle in the header.

### B. Local Live Prototype Profile
Use this mode to validate live integration with public feeds.
1. Copy `.env.live.example` to `.env`.
2. Restart the API. On the frontend, turn OFF "Demo Mode" to see real database records.

### C. Staging/Pilot Profile (Hardened)
Use this mode for controlled staging and pilot deployment environments.
1. Copy `.env.staging.example` to `.env`.
2. **CRITICAL**: Do not hardcode credentials. Inject staging variables (e.g., `DATABASE_URL`, `JWT_SECRET`, `OPENSKY_PASSWORD`) dynamically via your staging container/secrets manager.

## 6. Database Schema and Migrations
Database migrations are applied sequentially at API server startup using a versioned migration runner:
- Managed via `schema_migrations` table.
- Versioned `.sql` migration files located under `apps/api/src/db/migrations/` are executed transactionally and exactly once.
- Triggers strictly enforce that `audit_logs` are immutable and append-only.

## 7. Ingestion Scheduler Hardening
To run the automated polling scheduler (natively):
```bash
npm.cmd run ingest:scheduled
```
Hardened Scheduler Controls:
- **No Overlaps**: Lock prevents overlapping runs for the same source.
- **Safe Intervals**: Seismic defaults to 5 minutes, Satellite to 24 hours. OpenSky enforces a 120s minimum interval (warns if overridden).
- **Graceful Signals**: SIGINT/SIGTERM gracefully shuts down active worker child processes before exiting.
- **Isolate Failures**: Downstream parsing/network failures do not crash the scheduler.

## 8. Health & Readiness Verification
Verify endpoints are responsive:
*   `GET http://localhost:4000/health` (API basic availability)
*   `GET http://localhost:4000/ready` (Checks database connection, PostGIS extension presence, configuration shape, and live status. Returns `200` only when ready)
*   `GET http://localhost:4000/version` (Returns app version metadata, environment name, and git commit details safely without secrets exposure)

## 9. Safety Guardrails Scan
Before any release or staging deployment, run the static safety check script:
```bash
node scripts/verify_safety_guardrails.js
```
This scanner scans code, templates, and configurations for forbidden features (WebRTC, camera stream URLs, biometric words in schemas, hardcoded secrets).

## 10. Automated Verification Suite
To run the full suite of native check scripts:
```bash
npm.cmd run pilot:verify
```
To run the live open-data feed validation:
```bash
npm.cmd run pilot:live-check
```

## 11. Rollback to Demo/Mock Mode
1. Stop the scheduler (`Ctrl+C`).
2. Replace `.env` with `.env.demo.example`.
3. Restart the API server.
4. Enable "Demo Mode" on the frontend.
