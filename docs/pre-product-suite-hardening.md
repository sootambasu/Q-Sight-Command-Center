Historical note: This document predates Phase 0 acceptance. Where this document conflicts with docs/audit/PHASE_0_ACCEPTANCE_NOTE.md, docs/phase1/PHASE_1_PLANNING_BRIEF.md, or docs/phase1/PHASE_1_DOCUMENTATION_CONSISTENCY_PREFLIGHT.md, the newer Phase 0/Phase 1 governance documents take precedence.

# Pre-Product-Suite UI Hardening sprint

## Scope
This sprint focused on hardening the operator UI, improving stakeholder clarity, and enhancing resilience before starting the full product-suite roadmap. No new backend routes or data sources were added.

## Features Implemented
1. **Source Health Panel**: Shows USGS Seismic, CelesTrak Orbital, OpenSky Aircraft, Database, and WebSocket status modes and status. If not available, shows "Not reported".
2. **Global Operating Mode Banner**: Persistent banner indicating state (DEMO MODE, LIVE DATABASE MODE, POLLING FALLBACK, AUDITOR COMPLIANCE MODE, etc.).
3. **Persistent Alert Inbox**: Frontend/localStorage-only inbox storing alerts, permitting clearing, marking viewed, and JSON exports.
4. **Evidence Export**: Safe summary telemetry data export utilizing a strict allowlist. Omits secrets and coordinates.
5. **Role-mode Explanation**: Selector tooltips detailing Operator, Supervisor, Auditor, and Admin capabilities.
6. **Empty & Degraded States**: Safe UI messages when collections are empty, avoiding raw JSON or blank elements.
7. **Map Loading Hardening**: Clear loading and OSM keyless fallback indicator messages.
8. **Timeline Filters**: Filters to select Aircraft, Orbital, Seismic, Alerts, and Audit timeline logs.
9. **Executive View**: Mode toggling off sidebar layouts to focus visual context on spatial telemetries.
10. **Pilot Checklist**: Integrated checklist outlining verified parameters (Docker status, WebSocket, restrictions).

## Safety Exclusions
The following were strictly excluded and not implemented:
- Production authentication / JWT / Azure AD.
- Kubernetes / Helm deployment configurations.
- SGP4 orbit propagation algorithms.
- RTSP, WebRTC, or camera streaming endpoints.
- Person tracking or facial recognition capabilities.

## Verification Record

The following commands were run and verified as part of the hardening sprint. All checks passed:

* `npm.cmd run build` — Passed. Verified build of shared packages, API, and ingestor workers.
* `npm.cmd run typecheck` — Passed. Verified static type checking.
* `npm.cmd run build:web` — Passed. Built static frontend production bundle.
* `npm.cmd run verify:static` — Passed. Fully verified the build and ran mock workers in dry run mode.
* `node scripts/ws_verify.js` — Passed. 14 RBAC/WebSocket tests successfully executed.
* `node scripts/verify_safety_guardrails.js` — Passed. 0 violations found.
* `npm.cmd run safety:verify` — Passed. Verified security guardrails.
* `npm.cmd run pilot:docker:build` — Passed. Built Docker container images cleanly.
* `docker compose -f infra/docker-compose.prototype.yml up -d postgres api web` — Passed. Staged all prototype containers cleanly.
* `docker compose -f infra/docker-compose.prototype.yml ps` — Passed. Verified API (port 4000) and Web (port 5173) are running.
* `Invoke-RestMethod -Uri http://localhost:4000/health` — Passed. Returned status "ok".
* `Invoke-RestMethod -Uri http://localhost:4000/ready` — Passed. Returned status "ready".
* `Invoke-RestMethod -Uri http://localhost:4000/version` — Passed. Returned app version information.
* Browser check at `http://localhost:5173` — Passed. Web dashboard successfully loaded.
* `docker compose -f infra/docker-compose.prototype.yml down` — Passed. Clean container teardown.

Full verification evidence and checklist records are preserved in [PRE_PRODUCT_SUITE_HARDENING_EVIDENCE.md](file:///d:/Q-Sight%20Command%20Center/docs/audit/PRE_PRODUCT_SUITE_HARDENING_EVIDENCE.md).


## Known Limitations
- Alert inbox is client-side only (stored in browser `localStorage`). No server database synchronization or SLA escalation.
- Cesium Ion tokens are omitted; basemaps fall back to OpenStreetMap by design.

