# PHASE 1 PLANNING BRIEF
## Q-Sight Command Center

**Document ID:** PHASE_1_PLANNING_BRIEF  
**Status:** DRAFT — PENDING SIGN-OFF  
**Date:** 2026-07-13  
**Baseline Commit:** `4e31ee5ac031db1459364ec893d77e58889904f7`  
**Acceptance Tag:** `v0.1.0-phase0-accepted`  
**Document Owner:** Engineering Lead / Platform Architect  

---

## 1. Objective

Phase 1 transforms the accepted Phase 0 prototype into a **controlled, enterprise-ready staging deployment** of the Q-Sight Command Center. The mandate is structural hardening — not feature expansion. Every work item in Phase 1 must be traceable to a concrete gap identified in the Phase 0 closure audit.

The three primary engineering objectives are:

1. **Scalability**: Introduce a durable message queue layer to decouple telemetry ingestion from persistence, protecting the Node.js event loop under real operational load.
2. **Identity Assurance**: Replace symmetric HS256 token verification with production OIDC/JWKS asymmetric validation and formally validate it end-to-end.
3. **Platform Reliability**: Achieve PostgreSQL high availability, externalize the audit sink to a production SIEM-compatible target, and formalize deployment promotion from staging to production.

---

## 2. Scope

Phase 1 is explicitly bounded to the following nine domains:

| Domain | Description |
| :--- | :--- |
| **Telemetry Queue** | Introduce a persistent message broker between ingestors and DB writes |
| **OIDC/JWKS Integration** | Replace HS256 mock issuer with production-verified asymmetric IDP |
| **Database HA** | Configure PostgreSQL streaming replication or managed cloud HA |
| **CI/CD Enforcement** | Automated quality gates on every PR: build, typecheck, test, audit, safety scan |
| **Integration & Load Tests** | End-to-end test suite covering WebSocket auth, telemetry ingestion, and failure modes |
| **Observability** | OpenTelemetry traces and structured log export to a central sink |
| **Disaster Recovery** | Documented and tested DR runbook: RTO/RPO targets, failover procedure, backup validation |
| **Deployment Hardening** | Environment promotion model (dev → staging → production), secret management, container signing |
| **Security Exception Governance** | Formal lifecycle process for `security-exceptions.yaml` entries with expiry enforcement |

---

## 3. Non-Goals

The following are **explicitly out of scope** for Phase 1 and must not be introduced without a separate planning brief and sign-off:

- New product features (SGP4 orbit rendering, CCTV streaming, new alert types)
- UI/UX redesigns or component library changes
- Migration to a different frontend framework
- AI/ML anomaly detection or predictive alerting
- Additional external data source integrations (new APIs, satellite constellations)
- Mobile or native client development
- RBAC model expansion beyond the four existing roles (`operator`, `supervisor`, `auditor`, `admin`)
- Public API surface or third-party webhook integrations
- Any capability that requires relaxing the advisory-only safety positioning

---

## 4. Entry Criteria

Phase 1 planning and execution may not begin until **all** of the following conditions are satisfied:

| # | Criterion | Evidence Required |
| :-- | :--- | :--- |
| 4.1 | Phase 0 acceptance tag `v0.1.0-phase0-accepted` is present on the remote | `git tag -l v0.1.0-phase0-accepted` (remote verified) |
| 4.2 | `npm ci && npm run build && npm test` pass cleanly from a clean clone of `4e31ee5` | PHASE_0_ACCEPTANCE_NOTE.md |
| 4.3 | Branch protection on `main` is active and enforced | POST_MERGE_GITHUB_GOVERNANCE_AUDIT.md |
| 4.4 | All Phase 1 planning documents (this brief + 6 companion docs) reviewed and signed off | Sign-off record in release register |
| 4.5 | ADR candidates reviewed and at least one option selected per ADR | PHASE_1_ARCHITECTURE_DECISION_RECORDS.md |
| 4.6 | Phase 1 risk register reviewed and acceptance status recorded for all HIGH risks | PHASE_1_RISK_REGISTER.md |

---

## 5. Exit Criteria

Phase 1 is complete when **all** of the following are verified by independent review:

| # | Criterion | Verification Method |
| :-- | :--- | :--- |
| 5.1 | Telemetry ingestion under simulated load (≥ 500 msgs/sec) does not exhaust Node event loop | Load test report |
| 5.2 | OIDC/JWKS asymmetric JWT validation passes with a real external IDP (Auth0/Keycloak/Okta) | Integration test suite, IDP audit log |
| 5.3 | PostgreSQL failover to replica completes with RTO ≤ 30 seconds | DR drill report |
| 5.4 | All PRs blocked on: build failure, typecheck error, failing tests, safety scanner violation | CI enforcement verified on a deliberate test failure |
| 5.5 | Full integration test suite (WebSocket auth, telemetry, alerts, audit) passes in CI | CI run evidence |
| 5.6 | Audit events routed to external sink (SIEM/HTTPS target) with confirmed delivery | Sink delivery log |
| 5.7 | Disaster recovery runbook executed successfully in staging | DR drill report |
| 5.8 | Container images are signed and pull verification is enforced | Image signing evidence |
| 5.9 | All `security-exceptions.yaml` entries have recorded expiry dates and owners | Governance audit |
| 5.10 | No new enterprise-readiness gaps introduced | Independent architecture review sign-off |

---

## 6. Constraints

| Constraint | Detail |
| :--- | :--- |
| **No product code changes before ADR sign-off** | ADRs for queue, IDP, and database HA must be decided before implementation begins |
| **Advisory-only positioning preserved** | Phase 1 must not introduce any control actuation or life-safety automation capability |
| **No regression of Phase 0 safety controls** | Safety guardrails scanner must pass on every PR; biometric/streaming bans remain non-negotiable |
| **No direct push to `main`** | All changes via PR with at least one approval from an authorized reviewer |
| **Backward compatibility** | Demo mode (`BUILD_PROFILE=demo`) must remain fully functional throughout Phase 1 |
| **No secret rotation without documented process** | JWT secrets, DB passwords, and IDP credentials rotated only via documented procedures |
| **Node.js 22** | All environments, Dockerfiles, and CI must stay on Node 22 throughout Phase 1 |

---

## 7. Dependencies

| Dependency | Type | Risk if Missing | Owner |
| :--- | :--- | :--- | :--- |
| External OIDC/IDP access (Auth0, Keycloak, Okta, or equivalent) | External service | OIDC ADR decision blocked | Platform/Security team |
| Managed PostgreSQL with HA support (AWS RDS, CloudSQL, or Patroni) | Infrastructure | DB HA ADR decision blocked | Infrastructure team |
| Message broker infrastructure (RabbitMQ, Kafka, or Redis Streams) | Infrastructure | Queue ADR decision blocked | Infrastructure team |
| SIEM or audit sink target (Splunk, Datadog, AWS CloudWatch) | External service | Audit pipeline completion blocked | SecOps team |
| GitHub Actions secrets configuration | CI/CD | Pipeline enforcement blocked | DevOps team |
| Container registry with signing support (GHCR, ECR, or equivalent) | Infrastructure | Image signing exit criterion blocked | DevOps team |
| Load testing infrastructure (k6, Locust, or equivalent) | Testing | Load test exit criterion blocked | QA/Engineering team |

---

## 8. Related Planning Documents

| Document | Path |
| :--- | :--- |
| Enterprise Gap Backlog | docs/phase1/PHASE_1_ENTERPRISE_GAP_BACKLOG.md |
| Architecture Decision Records | docs/phase1/PHASE_1_ARCHITECTURE_DECISION_RECORDS.md |
| Test Strategy | docs/phase1/PHASE_1_TEST_STRATEGY.md |
| Release Plan | docs/phase1/PHASE_1_RELEASE_PLAN.md |
| Risk Register | docs/phase1/PHASE_1_RISK_REGISTER.md |
| Execution Prompt | docs/phase1/PHASE_1_EXECUTION_PROMPT.md |

---

> [!IMPORTANT]
> This document must be reviewed and countersigned by the Engineering Lead and Security Lead before Phase 1 work is authorized to begin. Do not modify product code, create feature branches, or execute implementation tasks until formal sign-off is recorded in the release register.
