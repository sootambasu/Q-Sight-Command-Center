# Earthquake Ingestor Worker (workers/earthquake-ingestor)

A background service that polls the USGS Earthquake Hazards Program GeoJSON feed to detect and log real-time seismic events near critical industrial infrastructure.

## Technologies
- **Core**: Node.js + TypeScript

## Data Flow
1. Polls USGS summary feed (e.g., hourly updates of all day's seismic activities).
2. Parses GeoJSON point geometries.
3. Checks if events fall within proximity boundaries of registered industrial facilities.
4. Inserts new events into the `seismic_events` PostGIS table.
5. Fires automated alerts when seismic activity exceeding a configurable magnitude threshold is detected near assets.
