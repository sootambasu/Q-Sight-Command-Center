Historical note: This document predates Phase 0 acceptance. Where this document conflicts with docs/audit/PHASE_0_ACCEPTANCE_NOTE.md, docs/phase1/PHASE_1_PLANNING_BRIEF.md, or docs/phase1/PHASE_1_DOCUMENTATION_CONSISTENCY_PREFLIGHT.md, the newer Phase 0/Phase 1 governance documents take precedence.

# Live Prototype Evidence - V1.0 Working Prototype Checkpoint

## Validation Date/Time
- Date: 2026-06-30
- Time: 13:00+05:30

## Live Source URLs Used
- **Seismic**: `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson`
- **Satellite/TLE**: `https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=tle`
- **Aircraft**: `https://opensky-network.org/api/states/all`

## Fetch / Accept / Skip Counts (Recent Run)
- **USGS Seismic feed**: 31 fetched, 31 accepted, 0 skipped
- **CelesTrak Satellite/TLE feed**: 24 analyzed, 23 accepted, 1 skipped
- **OpenSky Aircraft feed**: 500 analyzed, 492 accepted, 8 skipped

## DB Row Counts
- `seismic_events`: 32
- `satellite_orbits`: 24
- `aircraft_positions`: 491

## REST Endpoint Validation
- Response contracts remained stable and correctly displayed live parameters:
  - `GET /api/telemetry/seismic` -> `source: live`, `ingestion_status.enabled: true`.
  - `GET /api/telemetry/satellites` -> `source: live`, `ingestion_status.enabled: true`.
  - `GET /api/telemetry/aircraft` -> `source: live`, `ingestion_status.enabled: true`.

## WebSocket Validation
- `node scripts/ws_verify.js` executed.
- Result: 14/14 tests passed.
- Broadcaster cleanly consumes fresh DB records without direct external API requests.
- RBAC correctly maintained.
- Camera channels verified absent.

## Frontend Validation
- Globe visualizes live aircraft and seismic data.
- Demo Mode remains deterministic.
- UI elements (role selectors, audit views) functional.
- Camera streams disabled, protected, and not rendered. No video playback.

## Safety Confirmation
- No camera streams, WebRTC, or video playback implemented or active.
- No public CCTV discovery, facial recognition, or person tracking.
- Camera data strictly metadata-only.
- All credentials omitted from configurations and version control.

## Known Degraded Behavior
- **OpenSky Rate Limits**: OpenSky APIs frequently return 429 under heavy usage or anonymous access. Ingestors fall back gracefully to mock telemetry drift when rate-limited.

## Exact Commands Used for Verification
- `node scripts/verify_ingestion.js`
- `node scripts/verify_live_sources.js`
- `node scripts/ws_verify.js`
- `npm run dev:api`
- `npm run dev:web`

