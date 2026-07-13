# Release Plan

This release plan defines the phased release lifecycle of the Q-Sight Command Center, detailing version gates, regression requirements, UAT criteria, and rollback instructions.

---

## 1. Release Dependency Chain

```
v1.0 (Pilot Freeze) -> v1.1 (Stabilization) -> v1.2 (Security) -> v1.3 (Operations) -> v1.4 (Admin) -> v1.5 (Alerts) -> v2.0 (Enterprise)
```

---

## 2. Version Release Specifications

### v1.0 — Pilot Frozen (Current State)
*   **Release Scope**: Renders spatial coordinates and telemetry points. Local Compose staging environment. Simulated authentication.
*   **Verification Gate**: Successful execution of `npm run pilot:verify`.
*   **Status**: Complete.

### v1.1 — Stabilization Release
*   **Target Objective**: Lock staging baseline, address hoisted dependency warnings, standardize local CI script, and establish code protections.
*   **Key Epics**: PLAT-01, PLAT-02, PLAT-03, PLAT-04, PLAT-05, PLAT-10.
*   **Release Version Gate**:
    *   [ ] Local CI verification script `npm run verify:ci` completes successfully.
    *   [ ] Upgraded `esbuild` package resolves security warnings.
    *   [ ] Docker builds tag built images using package version strings.
*   **Regression Requirement**: Mock workers run in isolation without writing to the active database.
*   **Rollout / Rollback**: Roll back via package-lock checkouts.
*   **Risk Rating**: Low.

### v1.2 — Security Foundation Release
*   **Target Objective**: Integrate Azure AD SSO, enable JWT middleware protection, and secure WebSocket handshakes.
*   **Key Epics**: SEC-01 to SEC-10.
*   **Release Version Gate**:
    *   [ ] APIs block requests returning 401 when tokens are missing/expired.
    *   [ ] WebSockets require ticket authentication.
    *   [ ] Database queries enforce tenant-scoped isolation rules.
*   **Regression Requirement**: WebSocket subscriptions reject unauthorized roles (Auditor) on sensitive topics.
*   **UAT / Demo Criteria**: Validate login redirection flows on staging VMs; verify rate limiting flags active IPs.
*   **Rollout / Rollback**: Roll back VM configurations to v1.1 if token verification timeouts exceed 2 seconds.
*   **Risk Rating**: High.

### v1.3 — Operations & Observability Release
*   **Target Objective**: Set up Prometheus exporters, structure logs in JSON, and implement backup scripts.
*   **Key Epics**: OBS-01 to OBS-08, PLAT-07.
*   **Release Version Gate**:
    *   [ ] The Fastify endpoint `/metrics` outputs standard Prometheus metrics.
    *   [ ] Sync failures send alarms.
    *   [ ] Database backup script generates restorable SQL archives.
*   **Regression Requirement**: Logs must output structured JSON strings.
*   **Rollout / Rollback**: Downgrade Prometheus agents to prevent memory consumption on hosts.
*   **Risk Rating**: Low.

### v1.4 — Admin Suite Release
*   **Target Objective**: Develop CRUD UI panels for sites, assets, rules, and cameras.
*   **Key Epics**: PROD-01 to PROD-06, UX-01, UX-04, UX-08.
*   **Release Version Gate**:
    *   [ ] CRUD actions on sites/assets validate inputs using Zod.
    *   [ ] Admins can adjust ingestion intervals dynamically.
    *   [ ] Supervisor and Operator roles restrict access to Admin Console.
*   **Regression Requirement**: Safety scanners must verify zero video players or biometric elements are present in the frontend views.
*   **UAT / Demo Criteria**: Perform full site creation workflow; verify that assets register correctly.
*   **Rollout / Rollback**: Revert to the v1.3 staging container set if DB locks occur during CRUD operations.
*   **Risk Rating**: Medium.

### v1.5 — Alert Workflow & Evidence Release
*   **Target Objective**: Move alerts to a database, enable assignment rules, and create evidence bundles.
*   **Key Epics**: ALERT-01 to ALERT-11, UX-02, UX-03, UX-07.
*   **Release Version Gate**:
    *   [ ] Incidents write successfully to PostgreSQL.
    *   [ ] Teams webhooks trigger on critical warnings.
    *   [ ] Exporter generates a signed ZIP package.
*   **Regression Requirement**: Redacted locations are omitted from Operator evidence exports.
*   **UAT / Demo Criteria**: Resolve alert on the map view and confirm state updates reflect in audit logs.
*   **Rollout / Rollback**: Revert Fastify alert router endpoints to prevent connection timeouts if database pool limits are reached.
*   **Risk Rating**: Medium.

### v2.0 — Enterprise Product Release
*   **Target Objective**: Package the system with marketing materials, onboarding checklists, and deployment profiles.
*   **Key Epics**: DATA-01 to DATA-09, COM-01 to COM-10.
*   **Release Version Gate**:
    *   [ ] Support documentation, training decks, and price books are signed off.
    *   [ ] Release packages deploy cleanly on fresh staging instances.
*   **Regression Requirement**: Safety scanners return zero violations across all workspace layers.
*   **Rollout / Rollback**: Revert deployment tags using standard release management controls.
*   **Risk Rating**: Low.
