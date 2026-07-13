# PHASE 1 ENTERPRISE GAP BACKLOG
## Q-Sight Command Center

**Document ID:** PHASE_1_ENTERPRISE_GAP_BACKLOG  
**Status:** DRAFT — PENDING SIGN-OFF  
**Date:** 2026-07-13  
**Baseline:** `v0.1.0-phase0-accepted` (`4e31ee5ac031db1459364ec893d77e58889904f7`)  
**Source:** Phase 0 closure audit, PHASE_0_REMAINING_ENTERPRISE_GAPS.md, FINDINGS_REGISTER.md, PHASE_0_RESCUE_OPEN_RISKS.md  

---

## Priority Legend

| Priority | Definition |
| :--- | :--- |
| **P0-CRITICAL** | Blocks any production deployment; system is unsafe or unreliable without this |
| **P1-HIGH** | Required for enterprise certification; significant risk if deferred |
| **P2-MEDIUM** | Important for operational maturity; acceptable to implement in second sprint |
| **P3-LOW** | Quality-of-life or hygiene; can be deferred to Phase 2 |

---

## GAP-001 — Telemetry Pipeline Load Limits

**Priority:** P0-CRITICAL  
**Source Findings:** PHASE_0_REMAINING_ENTERPRISE_GAPS.md §1.1, FND-006  
**Phase 0 Status:** Open — deferred with documentation  

### Problem Statement
Telemetry records (aircraft via OpenSky, satellites via CelesTrak, earthquakes via USGS) are ingested by Node.js workers that write directly to PostgreSQL without any durable intermediate buffering. Under high message volume, the Node.js event loop will saturate. There is no backpressure, no dead-letter queue, no rate limiting at the broker layer, and no circuit breaker to prevent a cascade from a slow database write.

### Current State
- Ingestors write directly to PostgreSQL via Knex within the same event loop tick as the HTTP poll
- `INGESTION_MAX_RECORDS_PER_RUN=500` provides a soft cap but no protection against burst volume
- `INGESTION_INTERVAL_*_MS` limits poll frequency but does not protect the write path
- No retry/backoff on DB write failure (worker crashes silently)

### Required Outcome
- A persistent message broker decouples ingestor HTTP polls from DB writes
- Ingestor workers publish to the broker; a separate consumer service batches and persists
- Dead-letter queue captures failed messages for inspection without data loss
- Circuit breaker prevents DB overload on connection exhaustion
- Load test passes at ≥ 500 msgs/sec sustained for 5 minutes without event loop lag > 100 ms

### Acceptance Criteria
- [ ] ADR-001 (message queue choice) decided and implemented
- [ ] Broker consumer service created for each telemetry type
- [ ] Dead-letter queue observable via monitoring
- [ ] Load test report attached to PR
- [ ] `INGESTION_MAX_RECORDS_PER_RUN` enforced at broker consumer, not just worker
- [ ] Circuit breaker fires and alerts on DB unavailability

---

## GAP-002 — OIDC/JWKS Production Validation

**Priority:** P0-CRITICAL  
**Source Findings:** PHASE_0_REMAINING_ENTERPRISE_GAPS.md §1.2, PHASE_0_RESCUE_OPEN_RISKS.md §1.2  
**Phase 0 Status:** Open — HS256 symmetric JWT in place; OIDC path stubbed in env vars  

### Problem Statement
The current production JWT verification path falls back to a symmetric `JWT_SECRET` (HS256) if `OIDC_JWKS_URL` is not configured. A compromised or weak symmetric key allows token forgery. No end-to-end test validates the OIDC path with a real external identity provider (IDP). The WebSocket ticket flow has been verified structurally but never tested against a real JWKS endpoint.

### Current State
- `OIDC_JWKS_URL`, `OIDC_ISSUER_URL`, `OIDC_AUDIENCE` env vars present but not integration-tested
- `jose` library present but JWKS remote key fetch never exercised in CI
- HTTP + WS authentication flows pass tests against local HS256 tokens only
- No token revocation / expiry enforcement test

### Required Outcome
- A real external IDP (Auth0, Keycloak, or Okta) issues RS256 JWTs
- API verifies tokens asymmetrically via JWKS endpoint
- WebSocket ticket flow verified with RS256 tokens
- Token expiry and revocation scenarios tested
- Symmetric HS256 fallback disabled in production build profile

### Acceptance Criteria
- [ ] ADR-002 (IDP choice) decided
- [ ] `OIDC_JWKS_URL` configured in staging environment
- [ ] Integration tests pass with real IDP-issued tokens
- [ ] HS256 fallback disabled when `BUILD_PROFILE=production`
- [ ] Token expiry causes 401 within ≤ 5 seconds
- [ ] WebSocket ticket flow tested with RS256 tokens
- [ ] Audit event `auth_token_verified` logged with `verified_issuer` field populated

---

## GAP-003 — Database Reliability and Clustering

**Priority:** P0-CRITICAL  
**Source Findings:** PHASE_0_REMAINING_ENTERPRISE_GAPS.md §1.3  
**Phase 0 Status:** Open — single-instance PostgreSQL in Docker Compose  

### Problem Statement
The PostgreSQL instance is a single non-replicated container. Any failure (container crash, host restart, disk exhaustion) causes full service outage and potential data loss. There is no automated failover, no backup verification, and no documented RTO/RPO target.

### Current State
- Single PostgreSQL container in `infra/docker-compose.prototype.yml`
- No replica configuration
- Data volume mounted locally — no off-host backup
- No documented recovery procedure

### Required Outcome
- PostgreSQL configured with at least one streaming replica
- Automated failover tested with measured RTO ≤ 30 seconds
- Backup schedule defined with RPO ≤ 1 hour
- Backup restoration tested in staging
- DR runbook documented and executed

### Acceptance Criteria
- [ ] ADR-003 (PostgreSQL HA approach) decided
- [ ] Replica provisioned in staging environment
- [ ] Failover drill completed with RTO ≤ 30 seconds documented
- [ ] Backup restoration from prior day's backup verified
- [ ] DR runbook referenced from PHASE_1_RELEASE_PLAN.md

---

## GAP-004 — CI/CD Enforcement

**Priority:** P1-HIGH  
**Source Findings:** P0_ACCEPTANCE_MATRIX.md §2.7, POST_MERGE_GITHUB_GOVERNANCE_AUDIT.md  
**Phase 0 Status:** Partial — `.github/workflows` present but quality gates not fully enforced  

### Problem Statement
The existing CI workflow builds and runs tests on push/PR, but does not enforce: the safety guardrails scanner, npm audit vulnerability thresholds, or container image build verification. Direct pushes to `main` are blocked by GitHub branch protection rules but rely on admin bypass behavior. Quality gate failures do not reliably block merges.

### Current State
- CI runs `npm run build` and `npm test` on PR
- Safety guardrails scanner (`node scripts/verify_safety_guardrails.js`) runs manually, not in CI
- npm audit not enforced in CI (vulnerabilities present in dev dependencies)
- Container image build tested manually, not in CI

### Required Outcome
- Every PR triggers: build → typecheck → unit tests → safety scan → npm audit threshold check → container build
- PR merge is blocked if any step fails (no bypass for non-admins)
- Security exceptions reviewed in CI (expiry date enforcement)
- CI run produces a SARIF/artifact report linkable to PR

### Acceptance Criteria
- [ ] ADR-006 (CI/CD quality gates) decided
- [ ] GitHub Actions workflow updated with all required steps
- [ ] Deliberate safety scan failure blocks PR merge (verified)
- [ ] Deliberate test failure blocks PR merge (verified)
- [ ] `security-exceptions.yaml` expiry check runs in CI
- [ ] Container build step succeeds and produces tagged image in CI

---

## GAP-005 — Full End-to-End Integration Tests

**Priority:** P1-HIGH  
**Source Findings:** PHASE_0_RESCUE_OPEN_RISKS.md §1.3  
**Phase 0 Status:** Open — only 3 unit tests exist; no integration test framework  

### Problem Statement
The test suite contains only 3 unit tests (`outboxWorker.test.ts`, static verifiers, `ws_verify.js`). There is no automated integration test covering the full stack: worker → broker → DB → API → WebSocket → client delta. Failure scenarios (IDP down, DB unreachable, broker partition) have no automated regression coverage.

### Required Outcome
- Integration test suite covering all primary flow paths
- WebSocket authentication tested with valid, expired, and spoofed tokens
- Telemetry ingestion failure scenarios tested (IDP down, DB connection failure, rate-limit)
- Alert state machine transitions tested end-to-end
- Audit outbox delivery tested with sink unreachable and recovery

### Acceptance Criteria
- [ ] Integration test framework selected and scaffolded (see PHASE_1_TEST_STRATEGY.md)
- [ ] All flows in PHASE_1_TEST_STRATEGY.md §2 have passing test cases in CI
- [ ] Failure scenario tests pass in CI
- [ ] Load tests pass at ≥ 500 msgs/sec (per GAP-001)

---

## GAP-006 — Observability

**Priority:** P1-HIGH  
**Source Findings:** FND-003  
**Phase 0 Status:** Open — structured stdout JSON logging present; no external sink  

### Problem Statement
Audit logs are written to PostgreSQL only. No logs are exported to an external sink (Datadog, ELK, Splunk, AWS CloudWatch). There is no distributed tracing (OpenTelemetry). The API, workers, and audit outbox do not emit traces that can be correlated across service boundaries. Operational anomaly detection is impossible without aggregated observability.

### Required Outcome
- OpenTelemetry SDK integrated in API and workers
- Traces exported to a staging observability backend
- Audit sink (HTTPS exporter) routes audit events to external SIEM-compatible target
- Dashboard or query interface demonstrates log correlation across API → DB → workers

### Acceptance Criteria
- [ ] ADR-004 (audit sink/SIEM strategy) decided
- [ ] OTel SDK installed and traces visible in staging
- [ ] Audit events appear in external sink within 30 seconds of DB write
- [ ] Alert for audit sink failure (dead-letter queue non-empty) operational

---

## GAP-007 — Disaster Recovery

**Priority:** P1-HIGH  
**Source Findings:** PHASE_0_RESCUE_OPEN_RISKS.md §1.1, architecture.md §5  
**Phase 0 Status:** Not started  

### Problem Statement
There is no documented or tested disaster recovery procedure. RTO and RPO targets are undefined. No backup validation has been performed. Recovery from a full environment loss would be manual and undocumented.

### Required Outcome
- DR runbook covering: full DB loss, API service crash, broker failure, container registry unavailability
- RTO ≤ 30 seconds for DB failover, ≤ 5 minutes for full service restart
- RPO ≤ 1 hour
- DR runbook executed successfully in staging before Phase 1 exit

### Acceptance Criteria
- [ ] DR runbook authored and reviewed
- [ ] RTO/RPO targets formally documented
- [ ] DR drill completed in staging, results logged
- [ ] Backup restoration verified from a prior backup

---

## GAP-008 — Deployment Hardening

**Priority:** P1-HIGH  
**Source Findings:** P0_ACCEPTANCE_MATRIX.md §7, RELEASE_IDENTITY.md  
**Phase 0 Status:** Partial — demo/production separation via `BUILD_PROFILE` implemented; no promotion model  

### Problem Statement
There is no formalized environment promotion model (dev → staging → production). Container images use `latest` tags in some contexts. Secrets are managed via `.env` files without a secret manager. No container signing or pull-policy enforcement exists.

### Required Outcome
- Environment promotion model: dev → staging → production with promotion gates
- All container images tagged with `{version}-{short-sha}` and never `latest` alone
- Secrets managed via a secret manager (Vault, AWS Secrets Manager, or equivalent)
- Container images signed (Cosign or equivalent) and verification enforced on pull
- Deployment checklist enforced before any staging or production push

### Acceptance Criteria
- [ ] ADR-005 (environment promotion model) decided
- [ ] Promotion gate checklist documented and enforced in CI/CD
- [ ] Container images signed in CI pipeline
- [ ] Secrets rotated via documented procedure (not via `.env` copy)
- [ ] `NEVER deploy using mutable latest tag alone` rule enforced by CI lint

---

## GAP-009 — Security Exception Governance

**Priority:** P2-MEDIUM  
**Source Findings:** P0_ACCEPTANCE_MATRIX.md §3.4, docs/security/exceptions.md  
**Phase 0 Status:** Partial — `security-exceptions.yaml` stub exists; no expiry enforcement  

### Problem Statement
The security exception register (`security-exceptions.yaml`) exists as a stub but has no expiry date enforcement, no CI-level check, and no review cadence. Dev-only exceptions could silently age into production without being re-reviewed.

### Required Outcome
- All exceptions have: `id`, `cve_or_finding`, `justification`, `scope` (dev-only vs all), `owner`, `expiry_date`, `approved_by`
- CI checks expiry dates and fails if any exception is expired
- Review cadence defined (quarterly)

### Acceptance Criteria
- [ ] `security-exceptions.yaml` schema defined and all existing entries populated
- [ ] CI expiry check implemented and verified
- [ ] Quarterly review cadence documented in PHASE_1_RELEASE_PLAN.md
- [ ] At least one test confirms CI fails on an expired exception date

---

## Backlog Summary

| Gap ID | Description | Priority | Phase 0 Status | ADR Required |
| :--- | :--- | :--- | :--- | :--- |
| GAP-001 | Telemetry pipeline load limits | P0-CRITICAL | Open | ADR-001 |
| GAP-002 | OIDC/JWKS production validation | P0-CRITICAL | Open | ADR-002 |
| GAP-003 | Database reliability and clustering | P0-CRITICAL | Open | ADR-003 |
| GAP-004 | CI/CD enforcement | P1-HIGH | Partial | ADR-006 |
| GAP-005 | Full end-to-end integration tests | P1-HIGH | Open | None |
| GAP-006 | Observability | P1-HIGH | Open | ADR-004 |
| GAP-007 | Disaster recovery | P1-HIGH | Not started | None |
| GAP-008 | Deployment hardening | P1-HIGH | Partial | ADR-005 |
| GAP-009 | Security exception governance | P2-MEDIUM | Partial | None |

---

> [!NOTE]
> GAP-001, GAP-002, and GAP-003 are P0-CRITICAL and must be resolved before Phase 1 can be closed. GAP-004 through GAP-008 are required for enterprise certification but may be sequenced within Phase 1 milestones. GAP-009 may be addressed in the second half of Phase 1.
