# PHASE 1 RISK REGISTER
## Q-Sight Command Center

**Document ID:** PHASE_1_RISK_REGISTER  
**Status:** ACTIVE — REVIEW AT EACH MILESTONE GATE  
**Date:** 2026-07-13  
**Baseline:** `v0.1.0-phase0-accepted` (`4e31ee5ac031db1459364ec893d77e58889904f7`)  
**Register Owner:** Engineering Lead  

---

## Probability Scale

| Code | Label | Definition |
| :--- | :--- | :--- |
| P1 | Very Low | < 10% chance of occurring |
| P2 | Low | 10–25% |
| P3 | Medium | 25–50% |
| P4 | High | 50–75% |
| P5 | Very High | > 75% |

## Impact Scale

| Code | Label | Definition |
| :--- | :--- | :--- |
| I1 | Negligible | Minor schedule slip (< 1 day) |
| I2 | Minor | 1–3 day delay; no milestone slip |
| I3 | Moderate | Milestone slip by 1 week |
| I4 | Major | Phase 1 exit delayed by ≥ 2 weeks |
| I5 | Critical | Phase 1 exit blocked; production safety risk |

## Risk Score = Probability × Impact (1–25)

| Score Range | Rating |
| :--- | :--- |
| 1–4 | LOW |
| 5–9 | MEDIUM |
| 10–16 | HIGH |
| 17–25 | CRITICAL |

---

## Risk Register

### RISK-001 — ADR Decisions Delayed by Infrastructure Procurement

| Attribute | Detail |
| :--- | :--- |
| **Risk ID** | RISK-001 |
| **Category** | Planning / Dependencies |
| **Description** | Cloud infrastructure for the message broker, PostgreSQL HA, and staging IDP requires procurement and provisioning. If budget approval, vendor selection, or cloud account setup takes longer than expected, ADR sign-off will be delayed, blocking all implementation milestones. |
| **Probability** | P3 — Medium (infrastructure procurement delays are common in enterprise contexts) |
| **Impact** | I4 — Major (blocks all three P0-CRITICAL gaps until resolved) |
| **Risk Score** | 12 — HIGH |
| **Owner** | Engineering Lead + Infrastructure Lead |
| **Mitigation** | 1. Identify free-tier / trial options for initial staging (CloudAMQP free, Auth0 free, RDS free tier) to unblock testing without procurement. 2. Start procurement in parallel with ADR drafting. 3. Define fallback: local Docker Compose can be used for integration test development while staging is provisioned. |
| **Contingency** | If staging is unavailable at Milestone 1.0 gate, allow Milestone 1.1/1.2 development against Docker Compose with explicit caveat; staging must be ready before Milestone 1.1/1.2 acceptance gates. |
| **Acceptance Status** | OPEN — must be resolved before Milestone 1.0 gate |

---

### RISK-002 — OIDC/IDP Integration Complexity Underestimated

| Attribute | Detail |
| :--- | :--- |
| **Risk ID** | RISK-002 |
| **Category** | Technical |
| **Description** | The OIDC integration requires: IDP realm/tenant setup, claim mapping to Q-Sight roles, JWKS endpoint validation with `jose`, WebSocket ticket flow adaptation, and integration test harness against a real IDP. Any one of these sub-steps can surface unexpected complexity (claim format mismatches, CORS on JWKS, token audience mismatch, WS ticket edge cases). |
| **Probability** | P3 — Medium |
| **Impact** | I3 — Moderate (Milestone 1.1 slip by 1 week) |
| **Risk Score** | 9 — MEDIUM |
| **Owner** | Backend Engineer + Security Lead |
| **Mitigation** | 1. Spike integration with the chosen IDP in isolation (single route, single token verification) before the full implementation. 2. Use IDP's own SDK or well-documented Node.js quickstart. 3. Integration tests use a real IDP test tenant; avoid mocking JWKS in integration tests. |
| **Contingency** | If IDP integration is blocked past the Milestone 1.1 target date, escalate to Engineering Lead; consider alternative IDP (Option A vs B vs C in ADR-002). |
| **Acceptance Status** | OPEN |

---

### RISK-003 — Message Queue Architecture Regression in Existing Telemetry Flow

| Attribute | Detail |
| :--- | :--- |
| **Risk ID** | RISK-003 |
| **Category** | Technical |
| **Description** | Refactoring ingestor workers from direct DB writers to broker producers changes the fundamental data flow architecture. Bugs in the consumer service (missed acks, incorrect batch sizing, connection pooling issues) could cause telemetry data loss or duplicated records in production. The PostgreSQL `LISTEN/NOTIFY` flow for real-time WebSocket updates may also be disrupted. |
| **Probability** | P3 — Medium |
| **Impact** | I4 — Major (data integrity regression in telemetry pipeline) |
| **Risk Score** | 12 — HIGH |
| **Owner** | Backend Engineer |
| **Mitigation** | 1. Consumer service must implement idempotent DB writes (unique constraint on `(source_provider, observed_at, external_id)`). 2. The existing `LISTEN/NOTIFY` path is triggered by the DB write — it must still fire after the consumer writes; no change to the NOTIFY trigger. 3. Integration tests INF-001 to INF-007 must pass before Milestone 1.2 gate. 4. Load test confirms zero message drop at nominal load. |
| **Contingency** | If consumer causes data duplication: immediate revert to direct-write path until idempotency fix is merged and tested. |
| **Acceptance Status** | OPEN |

---

### RISK-004 — PostgreSQL HA Failover Disrupts Active WebSocket Sessions

| Attribute | Detail |
| :--- | :--- |
| **Risk ID** | RISK-004 |
| **Category** | Technical |
| **Description** | During a PostgreSQL failover event, active WebSocket clients may experience a connection disruption if the API loses its `LISTEN/NOTIFY` channel. Depending on Knex pool behavior, reconnection to the replica may take several seconds, during which no telemetry updates are pushed to clients. |
| **Probability** | P4 — High (failover always disrupts in-flight DB connections) |
| **Impact** | I3 — Moderate (WebSocket clients see stale data for ≤ 30 seconds) |
| **Risk Score** | 12 — HIGH |
| **Owner** | Backend Engineer + Infrastructure Lead |
| **Mitigation** | 1. Knex pool configured with `acquireConnectionTimeout` and reconnect logic. 2. API implements graceful `LISTEN` re-establishment after reconnect. 3. Frontend degrades gracefully — existing stale-data handling (`quality_state: 'stale'`) already covers this scenario. 4. DR drill explicitly tests WebSocket client behavior during failover. |
| **Contingency** | If reconnect loop fails: API restart procedure documented in DR runbook recovers WebSocket state within defined RTO. |
| **Acceptance Status** | OPEN |

---

### RISK-005 — CI/CD Quality Gate Causes Excessive PR Friction

| Attribute | Detail |
| :--- | :--- |
| **Risk ID** | RISK-005 |
| **Category** | Process |
| **Description** | The 9-step CI/CD quality gate (ADR-006) adds significant run time to every PR. If container build steps or integration tests run for > 15 minutes per PR, developers may bypass quality checks or circumvent via admin merge. This undermines the governance model. |
| **Probability** | P2 — Low (container build can be cached; integration tests scoped carefully) |
| **Impact** | I2 — Minor (CI run time manageable; build cache optimization is routine) |
| **Risk Score** | 4 — LOW |
| **Owner** | DevOps Lead |
| **Mitigation** | 1. Docker layer caching enabled in GitHub Actions. 2. Integration tests use Testcontainers with auto-cleanup; parallelized where possible. 3. Load tests run only on PRs to `main`, not every PR. 4. Target CI run time ≤ 10 minutes for unit + integration. |
| **Contingency** | Split CI into fast path (unit + type + scan) and slow path (integration + container) if run time exceeds 15 minutes. |
| **Acceptance Status** | OPEN |

---

### RISK-006 — Security Exception Expiry Creates Production Blocker

| Attribute | Detail |
| :--- | :--- |
| **Risk ID** | RISK-006 |
| **Category** | Security / Compliance |
| **Description** | Development dependency vulnerabilities (npm audit findings) are documented in `security-exceptions.yaml`. If expiry dates are set too aggressively or a review cycle is missed, expired exceptions will block CI and prevent merges from landing — potentially at a critical moment. |
| **Probability** | P2 — Low |
| **Impact** | I3 — Moderate (CI blocked; PR queue backs up) |
| **Risk Score** | 6 — MEDIUM |
| **Owner** | Security Lead |
| **Mitigation** | 1. Expiry dates set to quarterly review cycle (90 days minimum). 2. Security Lead receives automated reminder 14 days before any exception expires. 3. Exception review is a standing agenda item at monthly engineering review. |
| **Contingency** | Emergency exception renewal procedure: Security Lead can extend expiry with documented justification without a full PR cycle; must be ratified within 5 business days. |
| **Acceptance Status** | OPEN |

---

### RISK-007 — Demo/Production Boundary Accidentally Removed During Refactoring

| Attribute | Detail |
| :--- | :--- |
| **Risk ID** | RISK-007 |
| **Category** | Safety / Compliance |
| **Description** | Phase 1 involves significant architectural refactoring (queue, IDP, DB). A refactoring error could accidentally remove or bypass the `BUILD_PROFILE` guard, allowing synthetic/demo data into a production database or allowing header-based role spoofing in a production environment. This is a safety-critical regression. |
| **Probability** | P2 — Low (safety scanner in CI provides automated detection) |
| **Impact** | I5 — Critical (production safety compromise; mandatory incident response) |
| **Risk Score** | 10 — HIGH |
| **Owner** | Engineering Lead |
| **Mitigation** | 1. Safety guardrails scanner (`verify_safety_guardrails.js`) is a blocking CI check on every PR. 2. `BUILD_PROFILE` guard unit tests (UT-008) added to catch this in unit test suite. 3. Integration tests run with `BUILD_PROFILE=production` in staging environment. 4. No PR that touches `context.ts`, `roles.ts`, or build configuration can be merged without Security Lead review. |
| **Contingency** | If regression reaches staging: immediate service shutdown, rollback to prior image, mandatory post-mortem within 48 hours. |
| **Acceptance Status** | OPEN — MUST remain on register throughout Phase 1 |

---

### RISK-008 — Load Test Infrastructure Not Available Before Milestone 1.2 Gate

| Attribute | Detail |
| :--- | :--- |
| **Risk ID** | RISK-008 |
| **Category** | Testing / Dependencies |
| **Description** | The load test acceptance criterion (500 msgs/sec for 5 minutes) requires a staging environment with the full broker and DB stack. If the staging environment is not provisioned or the load test tool (k6/Locust) is not configured by Milestone 1.2, the acceptance gate cannot be passed. |
| **Probability** | P3 — Medium |
| **Impact** | I3 — Moderate (Milestone 1.2 slip) |
| **Risk Score** | 9 — MEDIUM |
| **Owner** | QA / Engineering Lead |
| **Mitigation** | 1. Load test scripts authored and reviewed in parallel with broker implementation. 2. k6 selected (zero dependency — single binary) to minimize setup friction. 3. Load test can be run against a Docker Compose environment as a development proof-of-concept before staging is ready. |
| **Contingency** | If load test cannot run against staging by Milestone 1.2 gate date, gate is deferred by up to 1 week with explicit Engineering Lead approval. |
| **Acceptance Status** | OPEN |

---

### RISK-009 — Node.js Event Loop Saturation Not Resolved by Queue Introduction

| Attribute | Detail |
| :--- | :--- |
| **Risk ID** | RISK-009 |
| **Category** | Technical |
| **Description** | The queue introduction moves DB writes out of the ingestor event loop, but if the consumer service is also Node.js-based and the event loop saturation moves to the consumer, the problem is not solved. Additionally, Fastify's `LISTEN/NOTIFY` handler runs on the same event loop as API route handlers. |
| **Probability** | P2 — Low (consumer can be independently scaled; LISTEN is async) |
| **Impact** | I4 — Major (load test fails; GAP-001 not closed) |
| **Risk Score** | 8 — MEDIUM |
| **Owner** | Backend Engineer |
| **Mitigation** | 1. Consumer service is a separate Node.js process with its own event loop. 2. Consumer batch size configurable to control throughput. 3. API Fastify event loop monitored via OTel `process.eventLoopLag` metric. 4. If consumer is a bottleneck, consider worker threads or multiple consumer process instances. |
| **Contingency** | If event loop lag exceeds threshold in load test: scale consumer horizontally (multiple consumer instances against same broker queue). |
| **Acceptance Status** | OPEN |

---

### RISK-010 — Audit Sink Connectivity Issues Block Milestone 1.2/1.3 Exit

| Attribute | Detail |
| :--- | :--- |
| **Risk ID** | RISK-010 |
| **Category** | Dependencies |
| **Description** | The audit sink (CloudWatch / Splunk / Datadog) requires network access from the staging environment. Firewall rules, VPC configuration, or IAM permissions may block connectivity and delay the audit sink acceptance criterion. |
| **Probability** | P3 — Medium |
| **Impact** | I3 — Moderate (Milestone 1.2/1.3 slip) |
| **Risk Score** | 9 — MEDIUM |
| **Owner** | Infrastructure Lead + SecOps |
| **Mitigation** | 1. Network connectivity tested in Milestone 1.0 (staging environment bring-up). 2. Fallback: use a simple HTTPS webhook receiver (RequestBin / equivalent) as a temporary audit sink for development; replace with production sink before Milestone 1.2 gate. |
| **Contingency** | If production sink is unavailable at Milestone 1.2 gate: gateway is deferred by up to 1 week; temporary sink evidence accepted with written waiver from Security Lead. |
| **Acceptance Status** | OPEN |

---

### RISK-011 — RTO Target Incompatible with Selected Managed DB Service

| Attribute | Detail |
| :--- | :--- |
| **Risk ID** | RISK-011 |
| **Category** | Architecture / Planning |
| **Description** | A documented conflict exists between the ≤ 30-second RTO specified in GAP-003 and the release plan, and the 60–120 second failover time of managed PostgreSQL services (AWS RDS Multi-AZ, CloudSQL). If ADR-003 selects a managed service without formally revising the RTO target, the DR drill will fail the Milestone 1.3 acceptance gate. This conflict is unresolvable without an explicit ADR-003 PATH decision. |
| **Probability** | P3 — Medium (managed DB is the most likely selection given operational complexity of Patroni) |
| **Impact** | I4 — Major (Milestone 1.3 gate blocked; DR drill cannot pass against an undefined RTO target) |
| **Risk Score** | 12 — HIGH |
| **Owner** | Infrastructure Lead |
| **Mitigation** | 1. ADR-003 sign-off is **blocked** until PATH 1 or PATH 2 is explicitly selected and recorded. 2. If PATH 2 is selected, Engineering Lead must update GAP-003, Milestone 1.3 deliverable 4.2, and PHASE_1_PLANNING_BRIEF.md §5.3 before Milestone 1.3 begins. 3. The DR drill acceptance criterion must cite the ADR-003-accepted RTO target — not the original 30-second target — if PATH 2 was chosen. |
| **Contingency** | If PATH decision is not made by end of Milestone 1.0: Engineering Lead escalates to project sponsor; Milestone 1.3 planning is suspended until resolved. |
| **Acceptance Status** | OPEN — MUST be CLOSED by recording the ADR-003 PATH decision before Milestone 1.3 begins |

---

## Risk Summary Matrix

| Risk ID | Description | Probability | Impact | Score | Rating | Owner | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| RISK-001 | ADR delay due to infrastructure procurement | P3 | I4 | 12 | HIGH | Eng. Lead | OPEN |
| RISK-002 | OIDC integration complexity underestimated | P3 | I3 | 9 | MEDIUM | Backend Eng. | OPEN |
| RISK-003 | Queue refactor causes telemetry data regression | P3 | I4 | 12 | HIGH | Backend Eng. | OPEN |
| RISK-004 | DB failover disrupts WebSocket sessions | P4 | I3 | 12 | HIGH | Backend Eng. | OPEN |
| RISK-005 | CI gate causes excessive PR friction | P2 | I2 | 4 | LOW | DevOps Lead | OPEN |
| RISK-006 | Security exception expiry blocks CI | P2 | I3 | 6 | MEDIUM | Sec. Lead | OPEN |
| RISK-007 | Demo/prod boundary accidentally removed | P2 | I5 | 10 | HIGH | Eng. Lead | OPEN |
| RISK-008 | Load test infra unavailable | P3 | I3 | 9 | MEDIUM | QA Lead | OPEN |
| RISK-009 | Queue moves bottleneck not solves it | P2 | I4 | 8 | MEDIUM | Backend Eng. | OPEN |
| RISK-010 | Audit sink connectivity blocked | P3 | I3 | 9 | MEDIUM | Infra. Lead | OPEN |
| RISK-011 | RTO target incompatible with managed DB service | P3 | I4 | 12 | HIGH | Infra. Lead | OPEN |

---

## Review Cadence

| Milestone Gate | Required Action |
| :--- | :--- |
| Milestone 1.0 | Review all OPEN risks; update probability/impact if changed; **RISK-011 must be CLOSED by ADR-003 PATH decision before Milestone 1.3 begins** |
| Milestone 1.1 | Review RISK-002; close if OIDC integration complete |
| Milestone 1.2 | Review RISK-003, RISK-008, RISK-009, RISK-010 |
| Milestone 1.3 | Review RISK-004; close if DR drill complete; review RISK-006; **confirm RISK-011 is CLOSED** |
| Phase 1 Exit | All HIGH/CRITICAL risks must be CLOSED or formally ACCEPTED with named owner |

> [!WARNING]
> RISK-007 (demo/production boundary) must remain on the register and be reviewed at every milestone gate throughout Phase 1, regardless of status. This risk is never auto-closed by milestone completion.
