# Phased Productization Roadmap

This document defines the phases, scope, entry/exit criteria, and release gates required to mature Q-Sight into an enterprise product.

---

## Phase 0 — Baseline Stabilization
*   **Objective**: Secure the codebase, resolve warnings, clean up settings, and establish a local CI-ready script before coding.
*   **Version**: v1.1
*   **Duration**: 1–2 Weeks
*   **Recommended Owner**: DevOps & Platform Engineering Team
*   **Dependencies**: None (Starts from Pilot Freeze)
*   **Entry Criteria**: Codebase frozen, static checks pass locally, audit logs exist.
*   **Exit Criteria**: 100% compilation on all workspaces, no esbuild vulnerabilities, script checks pass.
*   **Out-of-Scope**: Implementing Azure AD, writing database endpoints, updating UI elements.
*   **Release Gate Summary**:
    *   [ ] Local CI script runs cleanly.
    *   [ ] Zero compiler warnings or lint errors.
    *   [ ] Safety verification scanner exits with code 0.

## Phase 1 — Production Security Foundation
*   **Objective**: Secure user sessions, APIs, and WebSockets using enterprise SSO.
*   **Version**: v1.2
*   **Duration**: 3–6 Weeks
*   **Recommended Owner**: Security Architect & Backend Engineering Team
*   **Dependencies**: Phase 0 Complete
*   **Entry Criteria**: Successful Phase 0 build, Azure Portal tenant configurations ready.
*   **Exit Criteria**: Simulated roles removed, all routes validated using JWT, WebSocket token ticketing implemented.
*   **Out-of-Scope**: Creating UI pages for managing users or database roles.
*   **Release Gate Summary**:
    *   [ ] JWT token signature verification passes JWKS validation.
    *   [ ] REST routes return 401 on missing/expired tokens.
    *   [ ] WebSockets require ticket authentication.
    *   [ ] Audit logs capture authentication blocks.

## Phase 2 — Operations & Observability
*   **Objective**: Monitor pipeline health and feed status.
*   **Version**: v1.3
*   **Duration**: 2–3 Weeks
*   **Recommended Owner**: DevOps Team
*   **Dependencies**: Phase 1 Complete
*   **Entry Criteria**: Secure APIs deployed on staging, centralized logging sink available.
*   **Exit Criteria**: Standard JSON logs forwarding to external aggregators, Prometheus exporter working.
*   **Out-of-Scope**: User tracking, screen recording integrations.
*   **Release Gate Summary**:
    *   [ ] Metrics endpoint `/metrics` parses cleanly.
    *   [ ] Ingestion failures trigger immediate system notifications.
    *   [ ] Backup/restore scripts successfully recover database staging targets.

## Phase 3 — Admin & Configuration Suite
*   **Objective**: Implement administrator UI pages for sites, assets, and rules.
*   **Version**: v1.4
*   **Duration**: 4–6 Weeks
*   **Recommended Owner**: Frontend & Backend Engineering Team
*   **Dependencies**: Phase 1 Complete (Requires JWT SSO and tenant controls)
*   **Entry Criteria**: Staging UI supports user profile contexts.
*   **Exit Criteria**: Admin pages added to side navigation rail, CRUD REST APIs for sites/assets operational.
*   **Out-of-Scope**: Live camera streaming video elements, person tracking.
*   **Release Gate Summary**:
    *   [ ] Sites database CRUD validated with PostGIS boundaries.
    *   [ ] Supervisor and Operator roles restrict access to Admin Console.
    *   [ ] Input forms validate values using Zod constraints.

## Phase 4 — Alert Workflow & Evidence Operations
*   **Objective**: Move alerts from browser storage to a server database and manage incident lifecycle.
*   **Version**: v1.5
*   **Duration**: 3–5 Weeks
*   **Recommended Owner**: Backend + Product UI Team
*   **Dependencies**: Phase 1 and Phase 3 Complete
*   **Entry Criteria**: Persistent alert database schemas seeded, Teams webhook integrations configured.
*   **Exit Criteria**: Persistent alert status workflows, SLA timer triggers, evidence PDF export formats.
*   **Out-of-Scope**: Automatic emergency service dispatch integrations.
*   **Release Gate Summary**:
    *   [ ] Alerts write successfully to database.
    *   [ ] Operators can assign, acknowledge, and resolve alerts.
    *   [ ] Evidence packages generate signed ZIP/PDF outputs.

## Phase 5 — Advanced Intelligence Layer
*   **Objective**: Enhance visualization calculations without compromising privacy boundaries.
*   **Version**: v2.0-alpha
*   **Duration**: 2–4 Weeks
*   **Recommended Owner**: Data Science & Frontend Team
*   **Dependencies**: Phase 4 Complete
*   **Entry Criteria**: Historical alert datasets populated.
*   **Exit Criteria**: Last-known-good cache logic in ingestors, satellite footprint paths calculated.
*   **Out-of-Scope**: SGP4 integration prior to this phase, facial recognition, predictive policing engines.
*   **Release Gate Summary**:
    *   [ ] Feed failures gracefully degrade to last-known-good databases.
    *   [ ] Satellite paths propagate without blocking main browser rendering threads.

## Phase 6 — Enterprise Deployment & Commercial Packaging
*   **Objective**: Package the platform for deployment and marketing.
*   **Version**: v2.0
*   **Duration**: 3–4 Weeks
*   **Recommended Owner**: Commercial & Product Management Team
*   **Dependencies**: Phase 5 Complete
*   **Entry Criteria**: Verified staging environment builds.
*   **Exit Criteria**: Commercial collateral completed, support runbooks signed off.
*   **Out-of-Scope**: Direct automated production deployments.
*   **Release Gate Summary**:
    *   [ ] Architecture briefs, security decks, and onboarding guides completed.
    *   [ ] Release packages verified on fresh staging VMs.
