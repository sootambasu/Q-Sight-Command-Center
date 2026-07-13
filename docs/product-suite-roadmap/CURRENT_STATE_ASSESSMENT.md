# Current State Assessment

This assessment evaluates the maturity of the **Q-Sight Command Center** as of the Pilot Freeze (v1.0) and lists current capabilities, limitations, and future roadmap classifications.

---

## 1. Categorization of Capabilities

To support planning accuracy, all features and services are categorized into four distinct groups.

### A. Verified Pilot Capabilities (Built, tested, and operational)
*   **3D Globe Visualizer**: Renders point-telemetries and spatial boundary polygons using CesiumJS in a React container.
*   **REST API Layer**: Structured Fastify router with health checks (`/health`, `/ready`, `/version`).
*   **Spatial Database**: PostgreSQL with PostGIS extension. Migrations run sequentially via a transactional runner.
*   **Modular Ingestion Workers**: Background tasks configured for OpenSky (Aviation), USGS (Seismic), and CelesTrak (Satellite) feeds.
*   **WebSocket Delta Feed**: Push-updates for live coordinates with automatic client-side reconnection.
*   **Audit Logger**: Database-driven tracking of sensitive queries and denied operations.
*   **Compliance Scanner**: Static script checking the codebase for biometric, streaming, or video player violations.

### B. Pilot-Only Capabilities (Development/Demo context; not ready for production)
*   **Local Staging Orchestration**: Basic multi-container deployment via Docker Compose.
*   **Simulated RBAC**: User identity and roles (Operator, Supervisor, Auditor, Admin) simulated via HTTP headers (`x-q-sight-role`).
*   **Demo Scenario Replay**: Client-side walkthrough controls that trigger mock events locally.
*   **Client-Side Alert Inbox**: Storing active alarms in browser `localStorage` only.
*   **Static Assets Copying**: Assets copied to dist on build (requires absolute/relative Vite configurations).

### C. Production Blockers (Must be resolved before public enterprise deployment)
*   **Lack of Production Auth**: No JWT token verification or OIDC integration. System depends on simulated headers.
*   **WebSocket Security**: Telemetry feeds accept connections without validating a session token or auth ticket.
*   **No Centralized Observability**: Logs sit in console stdout or local DB tables. No external SIEM/APM collection.
*   **Database Tenancy**: Database schemas do not implement logical tenant separation rules.
*   **Upstream Rate Limits**: Workers lack request throttling policies, exposing the host IP to API blocks.

### D. Future Roadmap Items (Out-of-scope for immediate sprints)
*   **SGP4 Orbit Calculations**: Satellite tracks use static points. Real orbital propagation is deferred.
*   **Live Video Feeds**: Strictly prohibited under safety rules. Only metadata registries allowed.
*   **Kubernetes Orchestration**: Deployment is restricted to single-node Compose containers.
*   **AI Copilot/Chatbot**: Chat features are deferred to post-v2.0.

---

## 2. Unsupported Claims (Requires Verification)

The following claims have been raised in previous drafts but lack codebase evidence. They are classified as **"Requires verification"**:
*   *Scale Performance*: Claims that the WebSocket server can support 10,000+ simultaneous connections. (Requires load-test verification).
*   *Air-Gapped Map Tiles*: Claims that map basemaps load offline without a Cesium Ion token. (Requires offline-rehearsal verification; currently falls back to OSM tiles).
*   *Audit Trail Immutability*: Claims that the audit table is tamper-proof. (Requires verification; currently normal DB privileges allow edits unless WORM replication is deployed).

---

## 3. Maturity Matrix

| Area | Current Status | Evidence / File Path | Gap | Production Readiness |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend UI/UX** | Polished | [UI_UX_OVERHAUL_VALIDATION.md](file:///d:/Q-Sight%20Command%20Center/docs/audit/UI_UX_OVERHAUL_VALIDATION.md) | Minor layout adjustments on small viewports. | High |
| **Docker Deployment**| Staging Compose | [PILOT_FREEZE_NOTE.md](file:///d:/Q-Sight%20Command%20Center/docs/audit/PILOT_FREEZE_NOTE.md) | Mutable tagging, lack of CI runner deployment. | Medium |
| **REST API** | Fastify Router | [PRE_PRODUCT_SUITE_HARDENING_EVIDENCE.md](file:///d:/Q-Sight%20Command%20Center/docs/audit/PRE_PRODUCT_SUITE_HARDENING_EVIDENCE.md) | Lacks rate-limiting and security headers. | Medium |
| **WebSocket / RBAC** | Mock/Simulated | `ws_verify.js` (scripts) | Handshake authentication missing. | Low |
| **Live Telemetry** | Active Ingestion | `verify_live_sources.js` (scripts) | Cache fallbacks and reliability adapters missing. | Medium |
| **Audit Logging** | Append-Only DB | PostGIS database schema | External syslog/SIEM forwarding missing. | Medium |
| **Safety Scanner** | Static Regex Check| `verify_safety_guardrails.js` (scripts) | Not integrated into local workspace Git hooks or CI. | High |
| **Alert Inbox** | localStorage | `App.tsx` (web app) | Lacks backend sync, persistence, or SLA. | Low |
| **Authentication** | Simulated headers| `App.tsx` / API routers | Azure AD / Entra ID SSO missing. | None |
| **Observability** | console.log | Fastify logger config | Prometheus/OpenTelemetry metrics missing. | Low |
| **Database Tier** | PostgreSQL/PostGIS| Migration scripts | Auto-backups and transactional recovery missing. | Medium |
