# Pre-Product-Suite UI Hardening Verification Evidence

This report documents the verification evidence trail for the UI Hardening Sprint.

## Verification Commands Execution Record

| Command | Status | Output Summary / Findings |
| :--- | :--- | :--- |
| `npm.cmd run build` | **PASSED** | Successfully compiled `@q-sight/shared`, `@q-sight/api`, and workers (`opensky-ingestor`, `satellite-ingestor`, `earthquake-ingestor`). |
| `npm.cmd run typecheck` | **PASSED** | Checked TypeScript types for shared packages, API, and all three ingestors. 0 type errors. |
| `npm.cmd run build:web` | **PASSED** | Built production static asset bundle for `@q-sight/web` using Vite and tsc. Output size: 217.69 kB JS, 44.44 kB CSS. |
| `npm.cmd run verify:static` | **PASSED** | Executed complete build, typecheck, static mock runs (without database connection or live ingestion API calls), and frontend build. |
| `node scripts/ws_verify.js` | **PASSED** | Run 14 RBAC/WebSocket tests. Verified Operator, Auditor, and Admin subscriptions; confirmed Auditor role restriction to live telemetry, and that camera streams do not expose camera feeds via websocket subscriptions. |
| `node scripts/verify_safety_guardrails.js` | **PASSED** | Scanned codebase folders (`apps/web/src`, `apps/api/src`, `workers`, `packages`, `infra`, `scripts`) and configs (`.env.example`, `.env.demo.example`, etc.). 0 safety violations detected. |
| `npm.cmd run safety:verify` | **PASSED** | Alias script for the safety guardrails check. Returned success code 0. |
| `npm.cmd run pilot:docker:build` | **PASSED** | Compiled docker containers for `api` and `web` images using Node v22-alpine without `EBADENGINE` warnings. |
| `docker compose -f infra/docker-compose.prototype.yml up -d postgres api web` | **PASSED** | Spun up Postgres PostGIS, API, and Web containers in prototype environment. All containers successfully launched and healthy. |
| `docker compose -f infra/docker-compose.prototype.yml ps` | **PASSED** | Verified state: `qsight-prototype-api` running on port 4000, `qsight-prototype-web` on port 5173, `qsight-prototype-postgis` on port 5432 (healthy). |
| `Invoke-RestMethod -Uri http://localhost:4000/health` | **PASSED** | Returned status `ok`, timestamp, and app `q-sight-api`. |
| `Invoke-RestMethod -Uri http://localhost:4000/ready` | **PASSED** | Returned readiness status config: WebSocket active, live ingestion configuration loaded. |
| `Invoke-RestMethod -Uri http://localhost:4000/version` | **PASSED** | Returned application version `0.1.0`, environment `development`, and valid build timestamp. |
| Browser verification check at `http://localhost:5173` | **PASSED** | Returned main HTML document containing root element and cesium scripts. |
| `docker compose -f infra/docker-compose.prototype.yml down` | **PASSED** | Successfully stopped and removed all containers and network segments. |

---

## Technical Auditing Validation Results

### 1. Docker Validation Result
- **Image Architecture:** Built on Node `22-alpine` for both the build and runtime environments.
- **Cesium Hoisting Fixes:** Integrated in `apps/web/vite.config.ts` to ensure build assets are copied correctly inside the container.
- **Run-time Status:** Healthy postgres/postgis database combined with REST API on port 4000 and Nginx-based frontend on port 5173.

### 2. WebSocket/RBAC Validation Result
- **Operator Access:** WebSocket connection granted to operational channels (`telemetry.aircraft`, `telemetry.satellite`, `telemetry.seismic`, `alerts.geofence`).
- **Auditor Restrictions:** WebSocket subscription denied for operational telemetry. REST `/api/telemetry/*` access restricted to 403 Forbidden.
- **Admin Access:** WebSocket connection granted to all operational channels.
- **Safety Exclusions:** WebSocket does not expose camera subscription channels.

### 3. Safety Verification Result
- Scanned all configuration templates (`.env.*`) and web source trees.
- Confirmed no hardcoded production passwords.
- No trace of biometric or tracking telemetry.
- No HTML `<video>` tags or RTSP stream strings in the source tree.

### 4. Evidence Export Validation Result
- Verified that the "Export Evidence" function triggers file download representing raw JSON metrics.
- Confirmed the export strictly uses a whitelist that excludes coordinate locations, api secrets, or database passwords.

### 5. Alert Inbox Validation Result
- Verified the local inbox stores incoming alerts under local storage.
- Allowed operators to mark items as read or clear the log entirely without database connection requirements.

### 6. Executive View Validation Result
- Verified the toggle correctly hides sidebar navigation columns, allowing full-screen visualization of spatial coordinates on the Cesium canvas.

### 7. Pilot Checklist Validation Result
- Verified the checklist drawer opens and correctly highlights validation statuses (such as environment mode, database health, static verifications, and compliance restrictions) before initiating a simulated run.

---

## Browser Validation Checklist

Confirmations of functional behaviors within the frontend web application:

- [x] **UI loads** successfully on `http://localhost:5173`.
- [x] **Globe/map renders** utilizing the configured Cesium layout.
- [x] **Source Health panel visible** displaying USGS Seismic, CelesTrak Orbital, and OpenSky Aircraft status feeds.
- [x] **Global mode banner changes correctly** to reflect state modifications.
- [x] **Demo Mode ON/OFF works** toggling simulated scenario pipelines.
- [x] **Alert inbox works** caching, clearing, and displaying local alert events.
- [x] **Evidence export works** outputting allowed-list compliance reports.
- [x] **Role helper works** detailing access parameters for Operator, Supervisor, Auditor, and Admin.
- [x] **Auditor view explains telemetry blocking** showing compliance restrictions in place of live data.
- [x] **Empty/degraded states are understandable** displaying friendly notices instead of blank cards.
- [x] **Timeline filters work** filtering events by source category (Aircraft, Orbital, Seismic, Alerts, etc.).
- [x] **Executive View works** toggling side panels for maximized screen canvas.
- [x] **Pilot Checklist drawer works** rendering all steps of operational safety checklist.
- [x] **Safety footer remains visible** pinning liability and classification guidelines to the bottom.
- [x] **No video player** is present in the application code.
- [x] **No stream_url** is exposed to client-side layouts.
- [x] **No verification_hash** is sent to or stored in client-side code.
- [x] **No person-tracking UI** components or terms exist in the web application layout.
