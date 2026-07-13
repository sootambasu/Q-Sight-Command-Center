# Q-Sight Command Center — Live Data Ingestion & Prototype Hardening Runbook

This runbook outlines the steps to configure, verify, execute, and rollback the live open-data ingestion adapters for the Q-Sight Command Center working prototype.

## Safety Guardrails & Compliance Enforcements

The live-data activation phase maintains strict compliance with the project's non-surveillance and privacy mandates:
- **Excluded Features**: Do NOT implement live camera streams, WebRTC, video rendering/playback, public CCTV discovery, facial recognition, biometric identification, person tracking, covert recording, or predictive policing.
- **Metadata Protection**: Cameras remain metadata-only. No streaming URLs, security credentials, or verification hashes must ever be exposed in the frontend or broadcast over WebSocket channels.
- **Strict Separation**: The live telemetry ingestion is limited strictly to open-data feeds for **Seismic (USGS)**, **Satellite/TLE (CelesTrak)**, and **Aviation (OpenSky)** transponder states.

---

## 1. Live Ingestion Configuration (`.env`)

Default `.env.example` configurations are pre-packaged to be 100% offline-safe with all live adapters disabled. For local prototype testing, configure the `.env` settings.

### Default Safe Configuration (`.env.example`)
```env
LIVE_INGESTION_ENABLED=false
AIRCRAFT_LIVE_ENABLED=false
SATELLITE_LIVE_ENABLED=false
SEISMIC_LIVE_ENABLED=false
LIVE_INGESTOR_WRITE_TO_DB=false
```

### Staged Activation Environment Settings
To avoid overwhelming public APIs and to safely test parsing logic, the local environment MUST be activated in the following stages:

#### Stage 1: Seismic Ingestion Only
```env
LIVE_INGESTION_ENABLED=true
SEISMIC_LIVE_ENABLED=true
SATELLITE_LIVE_ENABLED=false
AIRCRAFT_LIVE_ENABLED=false
LIVE_INGESTOR_WRITE_TO_DB=false
SEISMIC_SOURCE_URL="https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson"
SEISMIC_MIN_MAGNITUDE=2.5
```

#### Stage 2: Satellite/TLE Ingestion
```env
SATELLITE_LIVE_ENABLED=true
SATELLITE_TLE_SOURCE_URL="https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=tle"
SATELLITE_GROUPS="stations"
```

#### Stage 3: Aircraft/OpenSky Ingestion
```env
AIRCRAFT_LIVE_ENABLED=true
AIRCRAFT_SOURCE_URL="https://opensky-network.org/api/states/all"
# Credentials can be supplied if available, or left blank for anonymous rate-limited access
AIRCRAFT_SOURCE_USERNAME=""
AIRCRAFT_SOURCE_PASSWORD=""
```

---

## 2. Dry-Run Verification

Before enabling database writes, run the network-dependent live validation script to verify connectivity and schema compliance:

```bash
# Execute the live open-data verification script
node scripts/verify_live_sources.js
```

### Dry-Run One-Shot Worker Ingestion
Verify that workers run cleanly in dry-run mode (`LIVE_INGESTOR_WRITE_TO_DB=false`):

```bash
# Seismic dry-run
npm run ingest:seismic:once

# Satellite dry-run
npm run ingest:satellite:once

# Aircraft dry-run
npm run ingest:aircraft:once
```
*Expected Output*: Workers log `database_write_skipped` and output a summary of parsed records with zero errors.

---

## 3. Controlled Database Write Activation

Once dry-run validation succeeds, enable database writes source-by-source:

1. Update `.env` to set:
   ```env
   LIVE_INGESTOR_WRITE_TO_DB=true
   ```

2. Run ingestion sequentially:
   ```bash
   # Ingest Seismic First
   npm run ingest:seismic:once

   # Ingest Satellite Second
   npm run ingest:satellite:once

   # Ingest Aircraft Last
   npm run ingest:aircraft:once
   ```

3. Verify Database rows exist in Postgres:
   ```sql
   SELECT COUNT(*) FROM seismic_events;
   SELECT COUNT(*) FROM satellite_orbits;
   SELECT COUNT(*) FROM aircraft_positions;
   ```

---

## 4. REST API & WebSocket Verification

Start the backend API server:
```bash
npm run dev:api
```

### REST Contract Verification
Verify the REST endpoints return valid, structured telemetry contracts:
- `GET http://localhost:4000/api/telemetry/seismic`
- `GET http://localhost:4000/api/telemetry/satellites`
- `GET http://localhost:4000/api/telemetry/aircraft`

Check that `source` equals `database` or `live`, and that `ingestion_status` has `enabled: true`.

### WebSocket Regression
Run the WebSocket validation test suite to verify channels and RBAC bounds:
```bash
node scripts/ws_verify.js
```
*Expected*: All 14 tests pass. Confirm zero camera channels are listed in WebSocket subscription bounds.

---

## 5. Frontend Prototype Validation

Start the web application:
```bash
npm run dev:web
```

Open `http://localhost:5173` and complete manual validation:
1. **Demo Mode OFF**: Verify the 3D globe displays live/database records correctly. Live source badges (green) must display status properly.
2. **Demo Mode ON**: Verify the guided scenario control panel launches and remains deterministic.
3. **RBAC Selector**: Switch to the `auditor` role and confirm that the spatial globe view is blocked, and the Audit Viewer displays access logs cleanly.
4. **Data Protection**: Inspect the camera metadata panel. Confirm that zero streaming URLs (`stream_url`), credentials, or verification hashes are exposed.

---

## 6. Failure Modes & Degradation Handlers

OpenSky aircraft state vector APIs are subject to heavy public rate-limiting and temporary IP blocks.
- **Degraded Behavior**: If OpenSky returns `401 Unauthorized`, `403 Forbidden`, `429 Too Many Requests`, timeout, or malformed data:
  - The worker logs the error level clearly using JSON structured stdout.
  - The worker does NOT crash the process. It completes with a mock fallback.
  - The backend WebSocket broadcaster serves mock drift telemetry so the cockpit map remains functional.
  - The REST endpoint `/api/telemetry/aircraft` returns the records with `source: mock` or indicates a stale database status.

---

## 7. Rollback to Mock/Demo Mode

To return the project to its v0.9 release candidate baseline (clean, offline-safe mock state):
1. Update `.env` to disable live settings:
   ```env
   LIVE_INGESTION_ENABLED=false
   AIRCRAFT_LIVE_ENABLED=false
   SATELLITE_LIVE_ENABLED=false
   SEISMIC_LIVE_ENABLED=false
   LIVE_INGESTOR_WRITE_TO_DB=false
   ```
2. Restart the API server and frontend server.
