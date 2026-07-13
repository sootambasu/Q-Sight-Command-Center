# Q-Sight Command Center — Final Handover Document (v1.0 Pilot/Staging Release)

## Project Overview
Q-Sight Command Center is an  Industrial Spatial Intelligence dashboard designed for monitoring non-human assets, logistics, environmental risks, and industrial safety operations. It visualizes data from aviation, orbital, seismic, and asset registries on a 3D high-contrast CesiumJS globe.

## Architecture Summary
The system is built as an npm workspaces monorepo:
*   **Frontend**: React + Vite + Vanilla CSS, utilizing CesiumJS for 3D webGL rendering. Nginx serves built assets when run in Docker.
*   **Backend API**: Fastify API (TypeScript) handling REST and WebSocket connections, outputting structured logs.
*   **Data Tier**: PostGIS (PostgreSQL) for spatial queries. Schema migrations are applied sequentially at startup via a transactional, versioned SQL migration runner.
*   **Ingestion Workers**: Modular adapters for OpenSky (Aviation), USGS (Seismic), and CelesTrak (Orbital), with robust mock fallbacks and a signal-aware, non-overlapping scheduler.
*   **Shared Library**: Zod validation schemas and TypeScript types shared across the stack.

## Current Capabilities
*   **Spatial Visualization**: Renders complex polygons (geofences) and telemetry point data on a 3D globe.
*   **Real-Time Data**: WebSocket telemetry feeds with automatic reconnection and fallback to safe HTTP polling.
*   **RBAC (Role-Based Access Control)**: Enforces access restrictions (Operator, Supervisor, Auditor, Admin) seamlessly.
*   **Demo Mode**: Guided scenarios with step-by-step walkthroughs to demonstrate system logic without relying on live APIs.
*   **Audit Logging**: Append-only tracking of sensitive queries, WebSocket subscriptions, and denied access attempts.
*   **Health & Readiness Monitoring**: `/ready` and `/version` endpoints facilitate orchestration integration (e.g., Kubernetes probes).
*   **Static Safety Auditing**: Static check script scans codebase for privacy and feature bans.

## Safety Guardrails (Strictly Enforced)
*   **No Live Camera Streams**: Strictly metadata-only. Video playback, WebRTC, and stream proxies are intentionally un-implemented.
*   **Redaction at Source**: Sensitive operational parameters (e.g., exact camera coordinates, boundary polygons) are redacted server-side for unauthorized roles.
*   **Audit Trail**: Any attempt to access restricted fields by an operator is intercepted and logged into the compliance database.
*   **No Human Tracking**: The system tracks industrial assets (planes, satellites, earthquakes) and explicitly bans facial recognition, biometrics, or social profiling.

## How to Start the System

### Native Local Workflow:
```bash
# 1. Start the PostGIS database
npm.cmd run db:up

# 2. Start the Backend API (Port 4000)
npm.cmd run dev:api

# 3. Start the Web Dashboard (Port 5173)
npm.cmd run dev:web
```

### Docker Staging Workflow:
```bash
# 1. Build staging images
docker compose -f infra/docker-compose.prototype.yml build

# 2. Spin up containers
docker compose -f infra/docker-compose.prototype.yml up -d postgres api web
```

## How to Run the Demo
1. Open `http://localhost:5173` (Native) or `http://localhost:8080` (Docker).
2. Locate the **📺 DEMO MODE** toggle in the top status bar and click to activate.
3. Use the left sidebar to select one of the three guided scenarios.
4. Click **Start Scenario** and use the **Next Step** button to advance the timeline and trigger deterministic events.

## Role Model Summary
Use the **Simulator** dropdown in the header to impersonate different roles:
*   **Operator**: Default operations view. Sensitive coordinates and polygons are redacted.
*   **Supervisor**: Unlocked view of geofence polygons and full asset metadata.
*   **Auditor**: Map rendering is disabled. Restricted solely to the Compliance Audit Ledger to review system logs.
*   **Admin**: Full access to both the operational map and the audit logs.

## Verification Commands
To validate system integrity, test live sources, and verify safety guardrails:
```bash
# Full native verification
npm.cmd run pilot:verify

# Live open-data feed validation
npm.cmd run pilot:live-check

# Safety guardrail verification scanner
node scripts/verify_safety_guardrails.js

# Docker compose verification
docker compose -f infra/docker-compose.prototype.yml config
docker compose -f infra/docker-compose.prototype.yml build
```

## Known Limitations
*   Auth is currently simulated via development headers or query parameters; staging must replace this with JWT token integration.
*   Map relies on OpenStreetMap tiles if Cesium Ion token is omitted.

## Recommended Future Roadmap
1.  **Production Authentication**: Integrating Azure AD / Entra ID for real JWT-based RBAC.
2.  **Kubernetes Probe Integration**: Leverage the new `/ready` and `/version` endpoints for service discovery and deployment checks.
3.  **Observability Integration**: Adding Prometheus metrics and OpenTelemetry tracing to the Fastify API.
