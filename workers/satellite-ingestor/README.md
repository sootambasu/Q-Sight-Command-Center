# Satellite Ingestor Worker (workers/satellite-ingestor)

A background service that downloads satellite Two-Line Element (TLE) datasets from CelesTrak, calculates orbital trajectories, and updates satellite state profiles.

## Technologies
- **Core**: Node.js + TypeScript
- **Orbital Mechanics**: satellite.js (for SGP4 propagation logic)

## Data Flow
1. Runs once a day to download TLE catalogs from CelesTrak.
2. Caches TLE catalog files locally or in the database.
3. Propagates orbital models to calculate latitude, longitude, and footprint ranges for the next 24 hours.
4. Updates spatial footprints in the `satellite_orbits` PostGIS table.
5. Emits update trigger to the API broker.

## Open Data Disclaimer
- This service relies entirely on public orbital TLE configurations from CelesTrak. It does not ingest military-grade or classified satellite assets.
