# PHASE 1 KICKOFF CHECKLIST
## Q-Sight Command Center

**Document ID:** PHASE_1_KICKOFF_CHECKLIST  
**Status:** DRAFT — FOR USE AT IMPLEMENTATION AUTHORIZATION  
**Date Created:** 2026-07-13  
**Baseline:** `v0.1.0-phase0-accepted` (`4e31ee5ac031db1459364ec893d77e58889904f7`)  

---

> [!IMPORTANT]
> This checklist must be completed in full **before** submitting PHASE_1_EXECUTION_PROMPT.md to the
> implementation team or agent. Every item must be checked. Any unchecked item is a kickoff blocker.
> The Engineering Lead is responsible for verifying each item and signing the checklist at the bottom.

---

## 1. ADR Decisions

All six Architecture Decision Records must be decided before implementation begins. An ADR is "decided" when the Decision field in PHASE_1_ARCHITECTURE_DECISION_RECORDS.md contains a selected option, a decision date, and a sign-off name.

| # | ADR | Decision Required By | Decided | Notes |
| :-- | :--- | :--- | :--- | :--- |
| 1.1 | **ADR-001** — Message Queue (RabbitMQ / Kafka / Redis Streams) | Milestone 1.0 start | ☐ | Record selected option in PHASE_1_SIGN_OFF_RECORD.md |
| 1.2 | **ADR-002** — Production IDP (Auth0 / Keycloak / Okta) | Milestone 1.0 start | ☐ | Record IDP tenant URL and claim mapping approach |
| 1.3 | **ADR-003** — PostgreSQL HA **including explicit PATH selection** (PATH 1: Patroni ≤30s OR PATH 2: Managed ≤120s — not both, not neither) | Milestone 1.0 start | ☐ | PATH decision resolves RISK-011 and BLOCKER-001 |
| 1.4 | **ADR-004** — Audit Sink / SIEM target | Milestone 1.2 start | ☐ | May be deferred to start of Milestone 1.2; must not be deferred past it |
| 1.5 | **ADR-005** — Environment Promotion Model | Milestone 1.0 start | ☐ | Confirms three-environment or GitOps model |
| 1.6 | **ADR-006** — CI/CD Quality Gates (9-step gate, blocking/warning classification) | Milestone 1.0 start | ☐ | Confirms all 9 steps and their pass/fail behavior |

> [!CAUTION]
> ADR-003 PATH must be a binary choice. "TBD" or "either" is not an acceptable state at kickoff.

---

## 2. Staging Infrastructure

All staging infrastructure must be provisioned and accessible before implementation work dependent on it begins.

| # | Item | Required By | Confirmed | Evidence / URL / Ticket |
| :-- | :--- | :--- | :--- | :--- |
| 2.1 | Cloud DB instance (per ADR-003 decision) provisioned and accessible | Milestone 1.0 complete | ☐ | _[URL or ticket reference]_ |
| 2.2 | PostgreSQL replica (or HA standby) provisioned alongside primary | Milestone 1.3 start | ☐ | _[URL or ticket reference]_ |
| 2.3 | PostGIS extension enabled on staging DB | Milestone 1.0 complete | ☐ | Confirm via `SELECT PostGIS_Version()` |
| 2.4 | Staging DB connection string added to secret manager | Milestone 1.0 complete | ☐ | _[Secret manager path reference]_ |
| 2.5 | Message broker (per ADR-001 decision) provisioned and accessible | Milestone 1.0 complete | ☐ | _[Broker URL or ticket reference]_ |
| 2.6 | Broker connection credentials added to secret manager | Milestone 1.0 complete | ☐ | _[Secret manager path reference]_ |
| 2.7 | Observability backend provisioned (OTel collector endpoint) | Milestone 1.2 start | ☐ | _[Endpoint URL]_ |
| 2.8 | Audit sink target provisioned (per ADR-004 decision) | Milestone 1.2 start | ☐ | _[Sink URL or ticket reference]_ |

---

## 3. IDP Test Tenant

The OIDC/IDP test tenant must be provisioned before Milestone 1.1 integration testing can begin.

| # | Item | Required By | Confirmed | Evidence |
| :-- | :--- | :--- | :--- | :--- |
| 3.1 | IDP test tenant / realm created (per ADR-002 decision) | Milestone 1.1 start | ☐ | _[IDP tenant URL / admin console URL]_ |
| 3.2 | JWKS endpoint URL confirmed and accessible | Milestone 1.1 start | ☐ | `OIDC_JWKS_URL` value recorded |
| 3.3 | Issuer URL and Audience confirmed | Milestone 1.1 start | ☐ | `OIDC_ISSUER_URL` and `OIDC_AUDIENCE` values recorded |
| 3.4 | Q-Sight role claim mapping configured in IDP | Milestone 1.1 start | ☐ | Operator / supervisor / auditor / admin claims confirmed |
| 3.5 | Test user accounts created for each role | Milestone 1.1 start | ☐ | Test credentials stored in secret manager (never committed) |
| 3.6 | Test client application registered in IDP | Milestone 1.1 start | ☐ | Client ID and secret in secret manager |

---

## 4. Message Broker

The message broker must be operational before Milestone 1.2 implementation begins.

| # | Item | Required By | Confirmed | Evidence |
| :-- | :--- | :--- | :--- | :--- |
| 4.1 | Broker provisioned in staging (per ADR-001: RabbitMQ / Kafka / Redis) | Milestone 1.2 start | ☐ | _[Broker URL]_ |
| 4.2 | Telemetry queues / topics / streams created | Milestone 1.2 start | ☐ | Queue names: `telemetry.aircraft`, `telemetry.satellite`, `telemetry.seismic` |
| 4.3 | Dead-letter queue / exchange configured | Milestone 1.2 start | ☐ | DLQ name and routing key confirmed |
| 4.4 | Broker accessible from staging API and worker containers | Milestone 1.2 start | ☐ | Connection test passed |
| 4.5 | **If broker is not available at Milestone 1.2 start:** local Docker Compose fallback approved by Engineering Lead | Milestone 1.2 start | ☐ | Written approval from Engineering Lead on file |

> [!NOTE]
> The local Docker Compose fallback (item 4.5) is only acceptable for development-phase integration testing — it does not satisfy the Milestone 1.2 acceptance gate, which requires a staging broker.

---

## 5. CI/CD Required Checks

All CI/CD quality gates must be configured before any implementation PRs are submitted.

| # | Item | Required By | Confirmed | Evidence |
| :-- | :--- | :--- | :--- | :--- |
| 5.1 | `.github/workflows/ci.yml` updated with all 9 quality gate steps (per ADR-006) | First implementation PR | ☐ | CI workflow file committed to `main` |
| 5.2 | CI workflow runs on PR-open and PR-push events | First implementation PR | ☐ | Test CI trigger: create a draft PR |
| 5.3 | Deliberate test failure blocks merge (verified with a test PR) | Milestone 1.0 gate | ☐ | Link to blocked PR as evidence |
| 5.4 | Deliberate safety scanner failure blocks merge (verified) | Milestone 1.0 gate | ☐ | Link to blocked PR as evidence |
| 5.5 | Security exception expiry script (`scripts/check_security_exceptions.js`) committed and passing | Milestone 1.0 gate | ☐ | CI run evidence |
| 5.6 | SBOM generation step added (non-blocking, artifact upload) | Milestone 1.0 gate | ☐ | CI artifact visible on PR |

---

## 6. Branch Protection Verified

| # | Item | Required By | Confirmed | Evidence |
| :-- | :--- | :--- | :--- | :--- |
| 6.1 | Branch protection on `main`: PR required (no direct push) | Before first implementation PR | ☐ | Attempt direct push; confirm error |
| 6.2 | Branch protection on `main`: CI status check is a required check | Before first implementation PR | ☐ | Required status check list in GitHub repo settings |
| 6.3 | Branch protection on `develop`: PR required | Before first implementation PR | ☐ | Confirm in GitHub repo settings |
| 6.4 | Branch protection on `develop`: CI status check required | Before first implementation PR | ☐ | Confirm in GitHub repo settings |
| 6.5 | Admin bypass is documented as a named exceptional procedure | Before first implementation PR | ☐ | Procedure documented in `docs/phase1/ENVIRONMENT_PROMOTION_CHECKLIST.md` |
| 6.6 | Tag protection for `v*` and `prototype-*` enforced | Before first implementation PR | ☐ | Confirm in GitHub repo settings |

---

## 7. Risk Register Reviewed

| # | Item | Confirmed | Notes |
| :-- | :--- | :--- | :--- |
| 7.1 | All 11 risks in PHASE_1_RISK_REGISTER.md reviewed by Engineering Lead | ☐ | — |
| 7.2 | All HIGH risks (RISK-001, 003, 004, 007, 011) have named mitigation owners | ☐ | Owners listed in risk register |
| 7.3 | RISK-011 (RTO incompatibility) resolved via ADR-003 PATH decision | ☐ | PATH 1 or PATH 2 must be selected; see item 1.3 |
| 7.4 | RISK-007 (demo/prod boundary) accepted as a permanent register item | ☐ | — |
| 7.5 | Risk register committed to `docs/phase1/` on `main` in its current state | ☐ | — |

---

## 8. Execution Prompt Approved

| # | Item | Confirmed | Notes |
| :-- | :--- | :--- | :--- |
| 8.1 | PHASE_1_EXECUTION_PROMPT.md reviewed by Engineering Lead in full | ☐ | — |
| 8.2 | All milestone work items in the execution prompt align with ADR decisions made | ☐ | Update execution prompt if ADR decisions change any implementation detail |
| 8.3 | Invariants section of the execution prompt reviewed and accepted | ☐ | No-go constraints must not be modified |
| 8.4 | Execution prompt activation checklist (bottom of PHASE_1_EXECUTION_PROMPT.md) populated | ☐ | Name, title, and date fields completed |

---

## 9. Implementation Authorization Recorded

| # | Item | Confirmed | Notes |
| :-- | :--- | :--- | :--- |
| 9.1 | PHASE_1_SIGN_OFF_RECORD.md completed — all four role sign-offs populated | ☐ | Engineering Lead, Security Lead, Infrastructure Lead, DevOps Lead |
| 9.2 | "Implementation Authorized: YES" recorded in PHASE_1_SIGN_OFF_RECORD.md | ☐ | Must be YES before execution prompt is submitted |
| 9.3 | Sign-off commit tagged `v0.2.0-phase1-plan-approved` and pushed to remote | ☐ | `git tag -a v0.2.0-phase1-plan-approved -m "Phase 1 plan approved"` |
| 9.4 | Implementation team / agent briefed on execution prompt and invariants | ☐ | Briefing date: _[YYYY-MM-DD]_ |

---

## 10. Kickoff Certification

**Completed by (Engineering Lead):**

| Field | Value |
| :--- | :--- |
| Name | _[To be completed]_ |
| Date | _[YYYY-MM-DD]_ |
| All items above confirmed | ☐ YES — all items checked |
| Implementation authorized | ☐ YES — PHASE_1_SIGN_OFF_RECORD.md §5 updated |

---

> [!WARNING]
> If any item in sections 1–9 is unchecked at the time of kickoff certification, the certification is incomplete and implementation must not begin. There are no optional items.
