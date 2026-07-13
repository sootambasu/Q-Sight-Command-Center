# Data Sources Integration Guide

This document describes the external data sources and APIs integrated into the **Q-Sight Command Center**, including integration caveats and safety guidelines.

---

## 1. Google Photorealistic 3D Tiles
*   **Purpose**: Provides high-resolution 3D meshes of terrain and urban environments.
*   **Integration**: Loaded dynamically into the CesiumJS viewer using the standard 3D Tiles format.
*   **URL**: `https://tile.googleapis.com/v1/3dtiles/datasets/google-photorealistic/`
*   **⚠️ Important Caveat**: Requires a Google Cloud Project with the Map Tiles API enabled. Billing must be configured; high volume queries can accumulate significant costs. Ensure the key is never exposed publicly by routing tiles through the API server if client-side restriction options are insufficient.

---

## 2. CesiumJS
*   **Purpose**: The primary 3D geospatial engine used to render the virtual globe, terrain, and map coordinates.
*   **Integration**: Client-side JavaScript library instantiated within `apps/web`.
*   **Auth**: Requires a Cesium Ion Access Token for default terrain datasets and imagery assets.

---

## 3. OpenSky Network
*   **Purpose**: Ingests real-time air traffic telemetry (commercial flights, transport logistics).
*   **Integration**: Handled by `workers/opensky-ingestor` which polls the State Vectors REST endpoint (`https://opensky-network.org/api/states/all`).
*   **v0.7 Update**: Ingests live data if `LIVE_INGESTION_ENABLED=true` and `AIRCRAFT_LIVE_ENABLED=true`. Fallback to mock data if disabled or unavailable. Configured via `AIRCRAFT_SOURCE_URL`, `AIRCRAFT_SOURCE_USERNAME`, and `AIRCRAFT_SOURCE_PASSWORD`.
*   **⚠️ Important Caveat**: Subject to strict rate limits. Anonymous requests are capped at 1 request per 10 seconds. Authenticated users are capped at 1 request per 5 seconds. Additionally, the service is a community-supported network; availability is not guaranteed. The ingestor must handle HTTP 429 rate-limiting responses gracefully and fall back to cache when OpenSky servers are overloaded or offline.

---

## 4. CelesTrak
*   **Purpose**: Provides Two-Line Element (TLE) datasets for predicting satellite orbits and footprint bounds.
*   **Integration**: Handled by `workers/satellite-ingestor` downloading orbital data sets (e.g., active satellites, weather, communications).
*   **v0.7 Update**: Ingests live TLE data if `LIVE_INGESTION_ENABLED=true` and `SATELLITE_LIVE_ENABLED=true`. Fallback to mock data if disabled or unavailable. Configured via `SATELLITE_TLE_SOURCE_URL`.
*   **⚠️ Important Caveat**: CelesTrak is a public open-data resource. TLE files represent estimated orbital elements and are updated every few hours. **This data must not be overstated as military-grade or tactical intelligence.** It is intended solely for general orbital path prediction and logistics coordination.

---

## 5. USGS Earthquake Hazards Program
*   **Purpose**: Feeds live seismic event warnings to protect physical industrial infrastructures.
*   **Integration**: Handled by `workers/earthquake-ingestor` polling the USGS GeoJSON Summary Feeds.
*   **v0.7 Update**: Ingests live data if `LIVE_INGESTION_ENABLED=true` and `SEISMIC_LIVE_ENABLED=true`. Fallback to mock data if disabled or unavailable. Configured via `SEISMIC_SOURCE_URL` and filtered by `SEISMIC_MIN_MAGNITUDE`.
*   **⚠️ Important Caveat**: This is an open-data geological feed, not a tactical early warning warning network. Feeds are subject to standard network latency (typically 1–5 minutes from event detection to API update).

---

## 6. Authorized Camera Registry
*   **Purpose**: Displays live operations video streams (CCTV, IP cameras) located at physical facility boundaries.
*   **Integration**: Feeds are registered through `/api/cameras` on the Fastify API.
*   **⚠️ Critical Safety Caveat**: All cameras must be privately owned, legally registered, and explicitly authorized by the asset owners. Connecting to unauthenticated public camera feeds or crawling indices (such as Shodan/Insecam) is strictly prohibited. The registry enforces cryptographic verification of stream ownership and fails to load unauthenticated sources. Camera streams are not fetched or processed by any background ingestion worker in this phase.

---

## 7. Live Open-Data Ingestion Hardening
*   **Purpose**: Protects systems and limits resource consumption when fetching from public REST endpoints.
*   **Configurations**:
    - `INGESTION_REQUEST_TIMEOUT_MS`: Hard ceiling on request duration (default `10000ms`).
    - `INGESTION_MAX_RECORDS_PER_RUN`: Limits records processed to prevent payload bloating (default `500`).
*   **Verification Script**: `scripts/verify_live_sources.js` provides a network-dependent, opt-in mechanism to validate all endpoints before writes are committed to the DB. If any external API fails or rate-limits, the prototype degrades gracefully and uses mock data fallbacks without failing system verification.

