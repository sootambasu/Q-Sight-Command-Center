# OpenSky Ingestor Worker (workers/opensky-ingestor)

A standalone background service that pulls aviation telemetry data from the OpenSky Network REST API and streams it to the PostGIS database.

## Technologies
- **Core**: Node.js + TypeScript
- **HTTP Client**: axios / undici

## Data Flow
1. Periodic polling (every 10–30 seconds, honoring OpenSky's API rate limits).
2. Parses active aircraft state vectors.
3. Performs geographic bounding filter (retaining only tracks within configured operational boundaries).
4. Inserts/updates records in the `aircraft_positions` PostGIS table.
5. Emits update trigger to the API broker.

## Strict Limits
- Anonymous API limits: 10 seconds request interval.
- Authenticated user limits: 5 seconds request interval.
- The worker strictly monitors rate limit headers and dynamically throttles requests to avoid bans.
- Person-related metadata is stripped; only flight ID, state vector, and altitude are ingested.
