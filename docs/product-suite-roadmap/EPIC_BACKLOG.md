# Epic Backlog

This backlog lists the 66 epics required to build the Q-Sight Product Suite. Each epic is categorized and scoped with dependencies, efforts, and acceptance criteria.

---

## 1. Security Architecture (SEC)

| Epic ID | Epic Name | Phase | Priority | Build Readiness | Description | Business Value | Persona | Dependencies | Acceptance Criteria | Effort | Risk | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **SEC-01** | Azure AD SSO Integration | 1 | P0 | Needs Spike | Integrate Azure AD (Entra ID) authentication flows. | Enterprise SSO integration. | All Users | None | Login page redirects to Microsoft login; returns JWT on success. | M | High | Blocks all prod |
| **SEC-02** | Frontend Login Integration | 1 | P0 | Needs UX | Handle user sessions, token refresh, and login UI overlays. | User login tracking. | Operator | SEC-01 | Web UI maintains session states; logs out user on token expiration. | S | Low | |
| **SEC-03** | REST JWT Middleware | 1 | P0 | Ready | Fastify JWT verification middleware on all endpoints. | API protection. | Developer | SEC-01 | Returns 401 on invalid/missing authorization headers. | S | Low | |
| **SEC-04** | WebSocket Handshake ticket | 1 | P0 | Ready | Pre-auth ticket exchange pattern for WebSocket feeds. | Real-time security. | Developer | SEC-03 | WS connection rejected without a single-use token ticket. | M | Med | |
| **SEC-05** | RBAC Claim Mapping | 1 | P0 | Ready | Map token roles (auditor, admin) to database access scopes. | Access control. | Auditor | SEC-03 | Enforces role limits at the API router level. | S | Low | |
| **SEC-06** | Tenant/Org Isolation | 1 | P0 | Ready | Scoped data isolation using database tenant rules. | Multi-tenancy. | Admin | None | All SQL queries filter results using the session's tenant ID. | M | Med | Blocks pilot |
| **SEC-07** | Secrets Management | 1 | P0 | Ready | Migrate local secrets from env files to a vault service. | Secrets storage. | DevOps | PLAT-01 | DB passwords/API keys read from Key Vault during container start. | S | Low | |
| **SEC-08** | Production Security Headers | 1 | P0 | Ready | Configure strict Helmet CORS and security headers in Fastify. | Vulnerability defense. | DevOps | None | Security scanners report zero header configuration warnings. | S | Low | |
| **SEC-09** | API Rate Limiting | 1 | P0 | Ready | Enforce rate limiting per client IP on Fastify REST API. | DDoS mitigation. | DevOps | None | Client gets 429 after exceeding 100 requests per minute. | S | Low | |
| **SEC-10** | Audit Immutability | 1 | P0 | Ready | Set database privileges to ensure audit table is append-only. | Tamper protection. | Auditor | None | Direct DELETE or UPDATE commands on audit logs are rejected. | S | Med | Compliance |

---

## 2. Platform & Infrastructure (PLAT)

| Epic ID | Epic Name | Phase | Priority | Build Readiness | Description | Business Value | Persona | Dependencies | Acceptance Criteria | Effort | Risk | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **PLAT-01** | Git Branching & Release Rules | 0 | P0 | Ready | Setup branch locks on main/develop; write contribution rules. | Release stability. | DevOps | None | Restrict direct pushes to main; require validation checks. | S | Low | Phase 0 |
| **PLAT-02** | Local CI Verification Script | 0 | P0 | Ready | Shell script coordinating workspace checks, builds, and safety. | Code quality gates. | DevOps | PLAT-01 | Running script returns 0 only when all tests compile. | S | Low | Phase 0 |
| **PLAT-03** | Dependency Upgrade Sprint | 0 | P0 | Ready | Upgrade esbuild and workspace dependencies to clear warnings. | Supply chain security. | Developer | None | Zero vulnerability warnings returned on production package scans. | S | Low | Phase 0 |
| **PLAT-04** | Docker Image Versioning | 0 | P1 | Ready | Tag built Docker staging images using version tags. | Deployment tracking. | DevOps | PLAT-02 | Compose build tags images using the package.json version string. | S | Low | Phase 0 |
| **PLAT-05** | Env Profile Management | 0 | P1 | Ready | Align and document local/live env variable configurations. | Environment sync. | DevOps | None | Ingestors start in mock mode unless live values exist. | S | Low | Phase 0 |
| **PLAT-06** | Database Migration Strategy | 6 | P0 | Ready | Deploy automated migration scripts into the deployment pipe. | Safe deployments. | Developer | None | Schema upgrades run automatically during container startup. | S | Med | |
| **PLAT-07** | Backup & Restore Tooling | 2 | P1 | Ready | Shell backup scripts generating database dumps. | Disaster recovery. | DevOps | None | Executing backup generates a gzip SQL file; restore loads it. | S | Low | |
| **PLAT-08** | Staging Rollback Runbook | 6 | P1 | Ready | Write deployment rollback procedures for staging VMs. | Deployment safety. | DevOps | PLAT-06 | Rollback script reverts changes to the previous release tag. | S | Low | |
| **PLAT-09** | Staging Release Checklist | 6 | P1 | Ready | Compile exit gate checklists for staging release. | Release gates. | DevOps | PLAT-04 | Release checklist requires signed safety scans. | S | Low | |
| **PLAT-10** | Release Evidence Automation | 0 | P2 | Ready | Automate output summary of test runs and audits. | Compliance reports. | DevOps | PLAT-02 | CI builds output a verification file. | S | Low | Phase 0 |

---

## 3. Observability & Operations (OBS)

| Epic ID | Epic Name | Phase | Priority | Build Readiness | Description | Business Value | Persona | Dependencies | Acceptance Criteria | Effort | Risk | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **OBS-01** | Structured Logging Standard | 2 | P1 | Ready | Enforce JSON output structure on all API/Worker logs. | Log routing. | DevOps | None | Console logs output valid JSON strings in ECS format. | S | Low | |
| **OBS-02** | Centralized Log Sink | 2 | P2 | Ready | Configure log forwarding (Datadog/Elastic) for Fastify. | Centralized logs. | DevOps | OBS-01 | Container logs visible in the aggregation dashboard. | M | Med | |
| **OBS-03** | Operations Dashboard | 2 | P1 | Ready | Setup container metrics visualizer (Prometheus/Grafana). | Operations metrics. | Admin | None | API routes export metric counts; Grafana charts are active. | M | Med | |
| **OBS-04** | Ingestion Source Monitoring | 2 | P1 | Ready | Track background task run status, errors, and rates. | Ingestion health. | Admin | None | API endpoint `/health/ingestion` returns status of feed tasks. | S | Low | |
| **OBS-05** | WebSocket Connection Metrics | 2 | P2 | Ready | Monitor active connection counts and message latencies. | WebSocket health. | Developer | SEC-04 | Dashboards show active socket count and telemetry push lag. | S | Low | |
| **OBS-06** | Feeds Outage Alerting | 2 | P1 | Ready | Setup email/slack alarms for ingestion failures. | Incident notification. | Admin | OBS-04 | Failures trigger email alerts to the support team. | S | Low | |
| **OBS-07** | Support/L1 Runbook | 2 | P1 | Ready | Write triage guides for database locks and worker crashes. | Support runbook. | DevOps | None | Runbook details resolution steps for standard errors. | S | Low | |
| **OBS-08** | Operational Metrics API | 2 | P2 | Ready | Public REST endpoint exposing telemetry rates. | Metrics access. | Developer | SEC-03 | Returns records ingested, active connections, and alerts. | S | Low | |

---

## 4. Admin & Product Capabilities (PROD)

| Epic ID | Epic Name | Phase | Priority | Build Readiness | Description | Business Value | Persona | Dependencies | Acceptance Criteria | Effort | Risk | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **PROD-01** | Admin Console Framework | 3 | P1 | Needs UX | Setup UI container view for configurations. | Unified admin view. | Admin | SEC-02 | Admin sidebar link renders layout containing forms. | M | Med | |
| **PROD-02** | Site Registry UI | 3 | P1 | Ready | Develop CRUD pages for physical staging locations. | Location settings. | Admin | PROD-01 | Admin can add and delete physical staging locations. | S | Low | |
| **PROD-03** | Asset Registry UI | 3 | P1 | Ready | Develop CRUD pages for non-human asset types. | Asset settings. | Admin | PROD-01 | Admin can configure telemetry types for registered assets. | S | Low | |
| **PROD-04** | Camera Metadata Registry | 3 | P1 | Ready | CRUD pages for camera coordinates (metadata only). | Camera registry. | Admin | PROD-01 | Admin can add cameras without video streaming fields. | S | Low | Privacy bound |
| **PROD-05** | Ingestion Source Config | 3 | P1 | Ready | CRUD pages for adding API tokens and upstream URLs. | Feed settings. | Admin | PROD-01 | Admin can edit ingestor target keys in DB. | S | Low | |
| **PROD-06** | Ingestion Interval Config | 3 | P1 | Ready | CRUD page to change worker poll schedules. | Run controls. | Admin | PROD-05 | Changing interval updates database schedule limits. | S | Low | |
| **PROD-07** | Geofence Polygon Manager | 3 | P1 | Needs UX | Visual tools to draw boundaries on the 3D globe. | Boundary setup. | Supervisor | PROD-01 | Drawn boundaries save successfully to the geofence table. | M | Med | |
| **PROD-08** | Spatial Alert Rules Config | 3 | P1 | Ready | Set spatial triggers (e.g., alert on entry/exit). | Rules setup. | Supervisor | PROD-07 | Rule entries validate boundaries using SQL intersection. | S | Low | |
| **PROD-09** | Retention Policy Configuration | 3 | P2 | Ready | CRUD page to define data retention expiry. | Data lifecycle. | Admin | PROD-01 | System deletes records older than configured retention limits. | S | Low | |
| **PROD-10** | Audit Export Configuration | 3 | P2 | Ready | Interface to export system audit logs. | Compliance controls. | Auditor | PROD-01 | Auditor can request signed export of logs. | S | Low | |

---

## 5. Alerts & Evidence Operations (ALERT)

| Epic ID | Epic Name | Phase | Priority | Build Readiness | Description | Business Value | Persona | Dependencies | Acceptance Criteria | Effort | Risk | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **ALERT-01** | Persistent Alert Schema | 4 | P0 | Ready | Create PostgreSQL/PostGIS schemas for alert logs. | Data persistence. | Developer | None | Schema maps state, assets, times, and tenant keys. | S | Low | |
| **ALERT-02** | Alert Controller API | 4 | P0 | Ready | REST endpoints to fetch, count, and filter alerts. | Alerts access. | Operator | ALERT-01 | Endpoints return alert listings by status and severity. | S | Low | |
| **ALERT-03** | Alert Lifecycle Workflow | 4 | P1 | Ready | API state transitions (New -> Acknowledge -> Resolve). | Incidents workflow. | Operator | ALERT-02 | State updates write history logs and update statuses. | S | Low | |
| **ALERT-04** | Alert Operator Assignment | 4 | P1 | Ready | Assign alerts to specific operators. | Task assignment. | Supervisor | ALERT-02 | Operator assigns alert; DB registers user ID. | S | Low | |
| **ALERT-05** | Operator Activity Comments | 4 | P1 | Ready | Add text log notes to alert files. | Audit records. | Operator | ALERT-02 | Operators can submit text comments to alert logs. | S | Low | |
| **ALERT-06** | Alert Severity Configuration | 4 | P1 | Ready | Configure alert priority rules (Critical, Warn, Info). | Priority sorting. | Supervisor | ALERT-01 | Alerts render with custom colors based on severity rules. | S | Low | |
| **ALERT-07** | SLA Resolution Timers | 4 | P2 | Ready | Track alert times and trigger warnings on breach. | SLA controls. | Supervisor | ALERT-01 | System flags alerts that exceed 15-minute response windows. | S | Low | |
| **ALERT-08** | Incident Escalation Engine | 4 | P2 | Ready | Escalate unacknowledged alarms to supervisor roles. | Safety oversight. | Supervisor | ALERT-07 | System flags supervisors on unacknowledged critical alerts. | S | Low | |
| **ALERT-09** | Teams/Webhook Integration | 4 | P1 | Ready | Forward alerts to Teams webhooks. | Team alerts. | Supervisor | ALERT-01 | Alerts send structured payloads to configured endpoints. | S | Low | |
| **ALERT-10** | Evidence Bundle Generator | 4 | P1 | Ready | Compile telemetry, logs, and comments into signed ZIPs. | Evidence export. | Supervisor | ALERT-05 | Exports generate zip file containing signed records. | S | Low | |
| **ALERT-11** | False-Positive Tagging | 4 | P2 | Ready | Flag alerts as false alarms to optimize rules. | Rule tuning. | Operator | ALERT-02 | Operator flags alert; system logs tag for analytics. | S | Low | |

---

## 6. Frontend / UX Experience (UX)

| Epic ID | Epic Name | Phase | Priority | Build Readiness | Description | Business Value | Persona | Dependencies | Acceptance Criteria | Effort | Risk | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **UX-01** | Admin Console Layouts | 3 | P1 | Needs UX | Design admin workspace sidebar panels. | Operations settings. | Admin | PROD-01 | Side panel displays config tabs clearly. | S | Low | |
| **UX-02** | Interactive Alert Sidebar | 4 | P1 | Needs UX | Unified interface showing alert lists and actions. | Alerts management. | Operator | ALERT-03 | Sidebar updates on WebSocket updates. | S | Low | |
| **UX-03** | Evidence Audit Viewer | 4 | P1 | Needs UX | Interface for supervisors to review incident summaries. | Incident review. | Supervisor | ALERT-10 | Renders detailed alert timelines and comments. | S | Low | |
| **UX-04** | Operator Training Walkthrough | 3 | P1 | Needs UX | Interactive onboarding guide for first-time login. | Easy onboarding. | Operator | None | Onboarding guide displays setup steps. | S | Low | |
| **UX-05** | Keyboard Accessibility | 3 | P2 | Ready | Full keyboard navigation and screen reader tags. | Accessibility rules. | All Users | None | Operators can navigate menus using Tab and Enter keys. | S | Low | WCAG 2.1 |
| **UX-06** | Responsive Hardening | 3 | P2 | Ready | Hardening layout rendering on small screens. | Layout flexibility. | Operator | None | UI components fit standard 1366px screen sizes. | S | Low | |
| **UX-07** | Executive PDF Report Export | 4 | P2 | Ready | Standardized PDF layout builder for incident logs. | Incident briefs. | Supervisor | ALERT-10 | Generates formatted PDF of incident timelines. | S | Low | |
| **UX-08** | Degraded State Refinements | 3 | P1 | Ready | Standardized error UI states for missing maps/feeds. | User confidence. | Operator | None | UI renders friendly messages when feeds fail. | S | Low | |

---

## 7. Data Ingestion & Analysis (DATA)

| Epic ID | Epic Name | Phase | Priority | Build Readiness | Description | Business Value | Persona | Dependencies | Acceptance Criteria | Effort | Risk | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **DATA-01** | Ingestion Adapter Framework | 5 | P0 | Ready | Interface schemas for third-party telemetry providers. | Feed stability. | Developer | None | Ingestors extend a base class enforcing standard schemas. | M | Low | |
| **DATA-02** | Last-Known-Good Cache | 5 | P1 | Ready | Fetch fallback data from cache when APIs fail. | Resilience. | Operator | DATA-01 | Feed failures fall back to last cached telemetry records. | S | Low | |
| **DATA-03** | Source Freshness Tracking | 5 | P1 | Ready | Flag stale feeds on the dashboard health panel. | Live status. | Operator | None | Panel shows warnings if updates lag by 5+ minutes. | S | Low | |
| **DATA-04** | Telemetry Data Quality Scoring | 5 | P1 | Ready | Score feeds based on age and parsing integrity. | Data trust. | Supervisor | None | Data points score lower if coordinates are missing. | S | Low | |
| **DATA-05** | Ingestor Backoff Policies | 5 | P1 | Ready | Exponential backoff logic on API connection errors. | API protection. | Developer | DATA-01 | Retries scale intervals (e.g., 2s, 4s, 8s) up to a max. | S | Low | |
| **DATA-06** | API Rate Limit Trackers | 5 | P2 | Ready | Track requests sent against upstream limit quotas. | API safety. | DevOps | DATA-01 | System delays requests if quota reaches 90% utilization. | S | Low | |
| **DATA-07** | SGP4 Satellite Propagation | 5 | P3 | Needs Spike | Calculate satellite footprints using SGP4 library dynamics. | Path accuracy. | Operator | None | Orbit tracks map dynamically based on TLE values. | M | Med | Post-pilot |
| **DATA-08** | Timeline Scenario Replay | 5 | P2 | Ready | Replay historical alert events on the main map. | Incident training. | Operator | ALERT-01 | Operator can scrub timeline to view past assets. | M | Med | |
| **DATA-09** | Spatial Geo-Correlation Rules | 5 | P2 | Ready | Intersect asset coordinates to trigger nearby warnings. | Proximity alerts. | Supervisor | ALERT-01 | System flags warning if aircraft is near geofences. | M | Med | |

---

## 8. Commercial & Customer Readiness (COM)

| Epic ID | Epic Name | Phase | Priority | Build Readiness | Description | Business Value | Persona | Dependencies | Acceptance Criteria | Effort | Risk | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **COM-01** | Product One-Pager | 6 | P1 | Ready | Technical overview sheet for customer deployments. | Marketing files. | Customer | None | Signed-off product feature list. | S | Low | |
| **COM-02** | Security & Privacy Brief | 6 | P1 | Ready | Compliance doc detailing the metadata-only architecture. | Privacy brief. | Customer | None | Confirms zero biometric tracking or streaming logic exists. | S | Low | |
| **COM-03** | Target Architecture Deck | 6 | P1 | Ready | Architectural deck detailing integrations. | Tech reviews. | Customer | None | System block diagrams showing JWT and DB paths. | S | Low | |
| **COM-04** | Pilot SOW Proposal Template | 6 | P1 | Ready | Standard Statement of Work template for 30-day pilots. | Sales files. | Customer | None | SOW includes deliverables and staging specs. | S | Low | |
| **COM-05** | Onboarding Implementation Guide | 6 | P1 | Ready | Customer onboarding setup checklists. | Smooth delivery. | Customer | None | Onboarding guide details network prerequisites. | S | Low | |
| **COM-06** | Support & SLA Model | 6 | P1 | Ready | Standard helpdesk response guidelines. | Service levels. | Customer | None | Standard SLA definitions for L1/L2 requests. | S | Low | |
| **COM-07** | Operator Training Guide | 6 | P1 | Ready | Basic training deck for operators. | Operator training. | Operator | UX-04 | User guide documents alert and map workflows. | S | Low | |
| **COM-08** | Pilot Pricing Guide | 6 | P1 | Ready | Pricing models based on assets, sites, or feeds. | Sales pricing. | Customer | None | Defines subscription costs and staging support rates. | S | Low | |
| **COM-09** | Technical FAQ Package | 6 | P1 | Ready | FAQ sheets answering common integration questions. | Tech sales. | Customer | None | FAQ covers air-gapped run capabilities. | S | Low | |
| **COM-10** | Pilot Success Checksheets | 6 | P1 | Ready | Target checklist to verify pilot acceptance. | Pilot exit gates. | Customer | None | Success sheet lists critical verification checkmarks. | S | Low | |
