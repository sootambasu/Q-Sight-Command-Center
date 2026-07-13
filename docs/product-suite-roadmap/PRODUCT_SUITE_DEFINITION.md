# Product Suite Definition

The Q-Sight Product Suite is a secure, enterprise-grade Industrial Spatial Intelligence Command Center designed to process real-time mechanical and environmental telemetry onto a high-contrast 3D map viewport.

---

## 1. Command Center Console (Console & Core Map)
*   **MVP Scope**: CesiumJS globe rendering, aircraft point tracking, seismic marker clusters, static satellite footprints, geofence border visualization, and entity detail panels.
*   **Production Scope**: Fully authenticated WebSocket telemetry push, custom styling, high-resolution imagery integrations, custom coordinate grids, and timezone overrides.
*   **Excluded Capabilities**: Video streaming windows, direct camera panning controls (RTSP/WebRTC), and street-level pedestrian tracks.
*   **Acceptance Criteria**: Renders 500 telemetry points at 60 FPS without layout overflow on 1366px screen width.
*   **Dependencies**: SEC-02, SEC-04, UX-08.

## 2. Ingestion & Source Management
*   **MVP Scope**: Command line configuration of OpenSky, CelesTrak, and USGS APIs using `.env` variables.
*   **Production Scope**: Source Health UI dashboard showing latency and records ingested, live interval adjustments via API, adapter pattern to register internal telemetry databases.
*   **Excluded Capabilities**: Public CCTV stream discovery, scraping, or automatic video indexing.
*   **Acceptance Criteria**: Health panel reports sync times and connection status for 5 concurrent feeds; API supports PATCH updates on ingestion intervals.
*   **Dependencies**: PROD-05, PROD-06, OBS-04.

## 3. Asset & Site Administration
*   **MVP Scope**: Seeded database tables with site coordinate boundaries and non-human asset registry entries.
*   **Production Scope**: CRUD user interface for administrators to add, modify, or archive sites and industrial assets.
*   **Excluded Capabilities**: Tracking human names, employee ID badges, or social profiles.
*   **Acceptance Criteria**: Admin console supports full CRUD forms for Sites and Assets; inputs validate coordinates using Zod schemas.
*   **Dependencies**: PROD-02, PROD-03, SEC-06.

## 4. Geofence & Rules Management
*   **MVP Scope**: Static geofence coordinates parsed from config files or database seed files.
*   **Production Scope**: Interactive polygon drawing tool on the 3D globe, geofence threshold rules configurator (e.g., alert on exit/enter).
*   **Excluded Capabilities**: Person boundary violation triggers (tracking human movement).
*   **Acceptance Criteria**: Users can draw a 4-point polygon on the globe; saving writes coordinates to the `geofences` PostGIS table.
*   **Dependencies**: PROD-07, PROD-08, UX-01.

## 5. Alert Operations Workflow
*   **MVP Scope**: Client-side localStorage log showing basic alerts with a clear button.
*   **Production Scope**: Server-persisted alert database, assignment routes, severity levels, SLA expiration flags, and escalation notification channels (Webhooks/Teams).
*   **Excluded Capabilities**: Auto-dispatch of emergency services or police.
*   **Acceptance Criteria**: Alerts persist on refresh; state changes (New -> Acknowledged -> Resolved) write to compliance audit logs.
*   **Dependencies**: ALERT-01, ALERT-02, ALERT-03.

## 6. Audit & Compliance Center
*   **MVP Scope**: Fastify-driven append-only SQL tables tracking sensitive API routes and denied authorization attempts.
*   **Production Scope**: Audit search page for compliance supervisors, cryptographically signed JSON log exports, and automatic syslog forwarding.
*   **Excluded Capabilities**: Modifying, deleting, or truncating the audit database logs via any REST route.
*   **Acceptance Criteria**: Auditor user can search logs by user, action, and date range; export generates a signed hash package.
*   **Dependencies**: SEC-10, PROD-10, UX-03.

## 7. Evidence Export & Reporting
*   **MVP Scope**: Simple JSON download of telemetry metrics.
*   **Production Scope**: Formatted PDF reports, signed zip bundles containing telemetry parameters and audit histories for incident investigations.
*   **Excluded Capabilities**: Packing video streams, image capture files, or human identity records.
*   **Acceptance Criteria**: Supervisor can export an incident evidence package containing signed JSON and a print-ready PDF layout.
*   **Dependencies**: ALERT-10, UX-07.

## 8. Tenant/User/Role Administration
*   **MVP Scope**: Hardcoded simulator selector in the UI header passing client-side roles.
*   **Production Scope**: Azure AD (Entra ID) integration, OIDC token processing, JWT-based tenant boundaries.
*   **Excluded Capabilities**: Local database password storage or custom registration pages.
*   **Acceptance Criteria**: Unauthenticated users are redirected to Azure SSO; JWT claims are successfully mapped to internal database permissions.
*   **Dependencies**: SEC-01, SEC-05, SEC-06.

## 9. Observability & Operations Console
*   **MVP Scope**: `/health` API endpoint check.
*   **Production Scope**: Prometheus metrics collector (`/metrics`), structured JSON logger with trace propagation, Grafana dashboard setups.
*   **Excluded Capabilities**: Monitoring local client-side browser user behavior or screen recording operators.
*   **Acceptance Criteria**: API exports metrics in standard Prometheus text format; errors automatically trigger alerts to support teams.
*   **Dependencies**: OBS-01, OBS-03, OBS-08.

## 10. Deployment & Environment Management
*   **MVP Scope**: Docker Compose file with standard environment configurations.
*   **Production Scope**: Standardized CI script, automated staging tests, semantic container tags, and database backup/restore shell files.
*   **Excluded Capabilities**: Continuous deployment directly to production clusters without manual authorization gates.
*   **Acceptance Criteria**: Backups generate compressed SQL dumps; restore scripts recover databases on empty staging instances.
*   **Dependencies**: PLAT-02, PLAT-04, PLAT-07.
