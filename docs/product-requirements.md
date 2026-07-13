# Product Requirements Document (PRD)

> [!WARNING]
> **Advisory-Only System**: Q-Sight provides advisory decision support only. It does NOT autonomously
> trigger emergency shutdowns, issue control commands to equipment, or guarantee real-time data accuracy.
> Operators must verify alerts independently before taking action.

> [!NOTE]
> **Document Status**: This document is updated as of 2026-07-13 to reflect accurate implementation state.
> Previous versions claiming 'enterprise-grade' or 'pilot-ready' are superseded by this revision.

## 1. Product Vision
Q-Sight Command Center is a **pre-production prototype** of an **Industrial Spatial Intelligence Command Center** designed for authorized asset tracking, logistics management, emergency response, infrastructure monitoring, environmental risk assessment, and industrial safety operations.

The application aggregates multiple telemetry layers (air, orbit, seismic) over a high-fidelity 3D geospatial layer, allowing control room operators and safety managers to maintain situational awareness of industrial assets (factories, pipelines, supply chains) without compromising privacy or ethical standards.

**This is an advisory decision-support tool. It does not issue control commands to industrial equipment.**

---

## 2. Target Users
1.  **Industrial Operations Control Room Operators**: Require advisory awareness of flight paths of transport aircraft, satellite orbits, and sensor metadata for physical assets.
2.  **Safety Managers**: Need advisory notifications of environmental hazards (such as earthquake proximity) relative to critical infrastructure. Operators must independently verify before taking action.
3.  **Logistics Coordinators**: Monitor supply chains, transport vessels, and site operations using geographic coordinate meshes.
4.  **Infrastructure Inspectors**: Review status, logs, and authorized sensor metadata of remote installations (e.g., wind farms, pipelines). Note: live video streaming is not implemented in this release.

---

## 3. MVP Scope
*   **3D Geospatial Engine**: Client-side visualization using CesiumJS layered with Google Photorealistic 3D Tiles.
*   **Aviation Ingestion (OpenSky)**: Ingest state vectors of authorized/commercial transport flights.
*   **Orbital footprint Ingestion (CelesTrak)**: Propagate satellite positions and ground tracking projections.
*   **Seismic Hazards (USGS)**: Read earthquake telemetry (subject to feed latency; not a real-time early-warning system) and surface advisory alerts near registered facilities.
*   **Sensor/Asset Registry**: Secure metadata storage and mapping of owner-approved asset sensor registrations. Note: video streaming is NOT implemented in this release.
*   **Audit Logging System**: Record access events for advisory accountability. Locally append-only via database trigger; external SIEM anchoring is planned.

---

## 4. Non-Goals & Core Safety Guardrails

### 🚫 Explicitly Forbidden (No-Go Guardrails)
*   **No Facial Recognition / Biometric Identification**: The product must never process, extract, or attempt to recognize human faces or biometric features.
*   **No Public CCTV Scraping**: The product will never connect to unauthenticated public camera indexers or networks (e.g., Shodan, Insecam).
*   **No Covert Recording**: Hidden recording is forbidden. All operations involving recording must display prominent, visible client-side status markers and enforce strict server-side retention limits.
*   **No Person Tracking**: Users cannot search for, isolate, track, or identify specific individuals or pedestrians.
*   **No Predictive Policing or Social Profiling**: Explicit ban on scoring, predicting, profiling, or analyzing human behavior.

### Legitimate Enterprise Use Cases
*   *Industrial Site Safety*: Monitoring machinery boundaries and identifying hazard clearances.
*   *Asset Logistics*: Confirming arrival and departure times of transport fleets.
*   *Disaster Mitigation*: Geofencing assets near seismic zones to surface **advisory alerts** for operator review. **Q-Sight does NOT trigger automated emergency shutdowns.** Operators must independently initiate any response.
*   *Infrastructure Inspection*: Reviewing sensor metadata and status logs for remote installations. Live video streaming is NOT implemented in this release.

---

## 5. Security & Access Requirements
*   **Role-Based Access Control (RBAC)**: Fine-grained permissions defining who can view which geospatial layers and sensor metadata. Currently simulated via dev request headers/params — production JWT/OIDC is PLANNED.
*   **Verification of Asset/Sensor Ownership**: Sensor registrations must prove ownership (via cryptographic keys or verified API tokens) prior to registry. Stream URLs are prohibited in the sensor registry.
*   **Audit Logging (Locally Append-Only)**: Append-only logs (PostgreSQL trigger) tracking access events. External SIEM anchoring is PLANNED. This is NOT yet enterprise-grade immutable audit logging.

---

## 6. Release Roadmap

### v0.1: Monorepo Boilerplate & Documentation (Current)
*   Define npm workspaces and TypeScript base configuration.
*   Establish directory layouts (`apps/`, `workers/`, `packages/`, `docs/`, `infra/`).
*   Establish foundational architecture, data schemas, and safety guidelines.

### v0.2: Core Database & Mock Ingestors
*   Launch Docker Compose PostGIS database.
*   Implement Knex migrations for telemetry databases and camera registry.
*   Write mock worker ingestors simulating plane, satellite, and seismic telemetry.

### v0.3: CesiumJS & Google 3D Tiles Visualization
*   Integrate CesiumJS in `apps/web`.
*   Connect Google Photorealistic 3D Tiles API layer.
*   Render static facility points and site boundaries on the 3D globe.

### v0.4: WebSocket Integration & Live Telemetry
*   Build Fastify WebSocket publisher endpoints.
*   Write active ingestors for OpenSky and CelesTrak.
*   Stream aircraft vectors and satellite footprints directly onto the frontend.

### v0.5: USGS Earthquakes & Geofenced Alerts
*   Implement the USGS worker ingestor.
*   Add Postgres triggers/listeners to check seismic proximity to assets.
*   Implement frontend toast notifications and flashing hazard zones.

### v0.6: Secure Camera Registry & Audit Logging
*   Implement camera feed registration endpoints with authentication and hash checking.
*   Configure the Fastify audit logging hooks.
*   Perform penetration testing and safety audits to confirm that no-go guardrails are technically enforced.
