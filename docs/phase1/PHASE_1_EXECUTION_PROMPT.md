# PHASE 1 EXECUTION PROMPT
## Q-Sight Command Center

**Document ID:** PHASE_1_EXECUTION_PROMPT  
**Status:** NOT ACTIVE — DO NOT EXECUTE UNTIL PHASE 1 PLANNING SIGN-OFF IS COMPLETE  
**Date Authored:** 2026-07-13  
**Activation Condition:** All 6 ADRs signed off; Engineering Lead and Security Lead have countersigned PHASE_1_PLANNING_BRIEF.md; Phase 1 risk register reviewed  

---

> [!CAUTION]
> This prompt is a **future execution instruction document**. It must NOT be submitted to an implementation agent, CI pipeline, or development team until the Phase 1 planning sign-off conditions above are fully satisfied. The prompt is authored here for completeness and traceability of the planning pack.

---

## Execution Prompt Text

The following prompt is intended to be submitted to the implementing engineering agent or team lead at the moment Phase 1 execution is authorized.

---

```
PHASE 1 EXECUTION AUTHORIZATION
Q-Sight Command Center
Baseline: v0.1.0-phase0-accepted (4e31ee5ac031db1459364ec893d77e58889904f7)

You are authorized to begin Phase 1 implementation of the Q-Sight Command Center.
Phase 1 is an enterprise-readiness hardening phase. You are NOT building new features.
Every change must be traceable to a Gap ID in PHASE_1_ENTERPRISE_GAP_BACKLOG.md.

===========================================================================
MANDATORY PRE-CHECKS — DO NOT PROCEED UNTIL ALL ARE CONFIRMED
===========================================================================

Before writing any code:

1. Confirm you are working from a clean clone of commit 4e31ee5ac031db1459364ec893d77e58889904f7.
   Command: git log --oneline -1
   Expected: 4e31ee5 (or with tag v0.1.0-phase0-accepted)

2. Confirm npm ci && npm run build && npm run typecheck && npm test all exit 0.
   These are your clean-baseline checks. If any fail, stop and report before proceeding.

3. Confirm the Phase 1 ADR sign-off tracker in PHASE_1_ARCHITECTURE_DECISION_RECORDS.md
   shows all 6 ADRs with a Decision, Decision Date, and Signed Off By field populated.
   Do NOT begin implementation on any component without its ADR signed off.

4. Confirm all planning documents in docs/phase1/ are present and have been reviewed:
   - PHASE_1_PLANNING_BRIEF.md
   - PHASE_1_ENTERPRISE_GAP_BACKLOG.md
   - PHASE_1_ARCHITECTURE_DECISION_RECORDS.md
   - PHASE_1_TEST_STRATEGY.md
   - PHASE_1_RELEASE_PLAN.md
   - PHASE_1_RISK_REGISTER.md

===========================================================================
IMPLEMENTATION SEQUENCE
===========================================================================

Follow the milestone sequence defined in PHASE_1_RELEASE_PLAN.md. The sequence is:

  Milestone 1.0 → Milestone 1.1 → Milestone 1.2 → Milestone 1.3 → Phase 1 Exit

Do not skip ahead to a later milestone's implementation tasks before the current
milestone's acceptance gate is passed and documented.

===========================================================================
MILESTONE 1.0 — FOUNDATION (ADRs + CI/CD + Infrastructure)
===========================================================================

Work items (reference PHASE_1_RELEASE_PLAN.md §1):

[M1.0-1] Update .github/workflows/ci.yml to implement all 9 quality gate steps
  defined in ADR-006 (PHASE_1_ARCHITECTURE_DECISION_RECORDS.md):
  Step 1: npm ci
  Step 2: npm run typecheck
  Step 3: npm test
  Step 4: node scripts/verify_safety_guardrails.js
  Step 5: npm audit --audit-level=high
  Step 6: scripts/check_security_exceptions.js (to be authored — see M1.0-2)
  Step 7: npm run build
  Step 8: docker buildx build (API and web images)
  Step 9: SBOM generation (non-blocking, artifact upload)

[M1.0-2] Author scripts/check_security_exceptions.js:
  - Reads docs/security/exceptions.yaml (or security-exceptions.yaml at root)
  - Parses each entry's expiry_date field
  - Exits 1 if any entry's expiry_date is in the past
  - Exits 0 if all entries have future expiry dates
  - Logs each expired entry to stderr with its ID and expiry date

[M1.0-3] Populate security-exceptions.yaml (or equivalent):
  - Add expiry_date, owner, and approved_by to all existing entries
  - Minimum expiry window: 90 days from today
  - Reference docs/security/npm-audit-inventory.txt for existing findings

[M1.0-4] Verify branch protection:
  - Confirm GitHub branch protection on main and develop requires CI to pass
  - Confirm the new CI workflow job names are listed as required status checks
  - Document branch protection verification in a new evidence log at
    docs/phase1/evidence/BRANCH_PROTECTION_VERIFICATION.md

[M1.0-5] Environment promotion documentation:
  - Create docs/phase1/ENVIRONMENT_PROMOTION_CHECKLIST.md per ADR-005
  - Document staging environment URLs, secrets locations, deployment commands
  - Document rollback procedure per PHASE_1_RELEASE_PLAN.md §6

Milestone 1.0 acceptance gate: Reference PHASE_1_RELEASE_PLAN.md §5.
Do not begin Milestone 1.1 or 1.2 until Milestone 1.0 gate is passed.

===========================================================================
MILESTONE 1.1 — IDENTITY HARDENING
===========================================================================

Work items (reference PHASE_1_RELEASE_PLAN.md §1 and ADR-002):

[M1.1-1] Configure OIDC/JWKS integration in API:
  - OIDC_JWKS_URL, OIDC_ISSUER_URL, OIDC_AUDIENCE must be read from env
  - API must use jose's createRemoteJWKSet() to verify tokens against the real JWKS endpoint
  - The symmetric HS256 fallback (JWT_SECRET only) must be disabled when BUILD_PROFILE=production
  - All changes confined to apps/api/src/ — do NOT touch shared types or worker code

[M1.1-2] Update WebSocket ticket issuance:
  - WS ticket endpoint must validate the incoming Bearer token against JWKS
  - Ticket payload must carry verified_subject and verified_issuer from the IDP token
  - Ticket must remain single-use (existing architecture preserved)

[M1.1-3] Update audit events:
  - auth_token_verified audit event must populate verified_issuer field from the IDP JWT iss claim
  - Audit event schema must not change — only populate the existing optional field

[M1.1-4] Add integration tests WS-001 to WS-009 (PHASE_1_TEST_STRATEGY.md §3.4):
  - Tests must use real IDP-issued tokens in the staging environment
  - In local/CI environments, use a test IDP (Auth0 test tenant or Keycloak dev realm)
  - Do NOT mock the JWKS endpoint in integration tests — use a real JWKS URL

[M1.1-5] Add unit tests UT-001 to UT-008 (PHASE_1_TEST_STRATEGY.md §3.1):
  - All tests must pass in npm test

Milestone 1.1 acceptance gate: Reference PHASE_1_RELEASE_PLAN.md §5.

===========================================================================
MILESTONE 1.2 — TELEMETRY QUEUE + OBSERVABILITY
===========================================================================

Work items (reference PHASE_1_RELEASE_PLAN.md §1 and ADR-001, ADR-004):

[M1.2-1] Message broker integration — per ADR-001 decision:
  - Install chosen broker client library (amqplib / kafkajs / ioredis)
  - Refactor workers/opensky, workers/satellite, workers/earthquake:
    * Workers become producers only — they publish a structured message to the broker
    * Workers must NOT write directly to PostgreSQL
    * Message schema: { source, type, payload, timestamp, data_origin, quality_state }
  - Create apps/telemetry-consumer/ (new Node.js service):
    * Subscribes to all telemetry queues
    * Validates messages with Zod
    * Writes to PostgreSQL (preserving existing Knex patterns)
    * Implements idempotent writes (unique constraint: source_provider + observed_at + external_id)
    * Triggers PostgreSQL NOTIFY after each write (to preserve LISTEN/NOTIFY fan-out to API)
    * Dead-letter queue: failed messages after max_retries sent to DLQ
  - Circuit breaker: if DB connection unavailable, consumer suspends with exponential backoff

[M1.2-2] Update Docker Compose (dev and prototype):
  - Add broker service (RabbitMQ / Kafka / Redis)
  - Add telemetry-consumer service
  - Verify existing docker-compose.prototype.yml still starts end-to-end

[M1.2-3] OpenTelemetry instrumentation:
  - Install @opentelemetry/sdk-node and required exporters
  - Instrument apps/api and apps/telemetry-consumer with trace context propagation
  - Configure OTLP exporter for staging observability backend (per ADR-004 environment variables)
  - Add process.eventLoopLag metric to API (for load test validation)

[M1.2-4] Activate audit sink (httpsExporter):
  - Configure AUDIT_SINK_URL in staging environment secrets
  - Verify outbox flush delivers events to external sink within 30 seconds
  - Dead-letter alert: implement a check that fires if DLQ size > 0

[M1.2-5] Add ingestor failure tests INF-001 to INF-007 (PHASE_1_TEST_STRATEGY.md §3.5)
[M1.2-6] Run and pass load test scenario (PHASE_1_TEST_STRATEGY.md §3.7):
  - 500 msgs/sec, 5 minutes, event loop P99 ≤ 100 ms
  - Attach load test report to PR

Milestone 1.2 acceptance gate: Reference PHASE_1_RELEASE_PLAN.md §5.

===========================================================================
MILESTONE 1.3 — DATABASE HA + DR + DEPLOYMENT HARDENING
===========================================================================

Work items (reference PHASE_1_RELEASE_PLAN.md §1 and ADR-003, ADR-005):

[M1.3-1] PostgreSQL HA configuration — per ADR-003 decision:
  - Provision replica in staging
  - Update DATABASE_URL / connection config to point to HA endpoint
  - Configure Knex pool reconnect behavior for failover

[M1.3-2] DR runbook — create docs/phase1/DISASTER_RECOVERY_RUNBOOK.md:
  - Covers: full DB loss, API crash, broker failure, registry unavailability
  - Documents: RTO targets, RPO targets, failover commands, recovery verification steps

[M1.3-3] DR drill — conduct and document:
  - Terminate primary DB container/instance in staging
  - Measure time to automatic failover
  - Verify WebSocket clients recover within RTO
  - Attach evidence to docs/phase1/evidence/DR_DRILL_REPORT.md

[M1.3-4] Container image signing:
  - Install Cosign in CI pipeline
  - Sign all built images in CI
  - Add signature verification step to container pull in deployment checklist

[M1.3-5] Add migration tests MIG-001 to MIG-007 (PHASE_1_TEST_STRATEGY.md §3.6)
[M1.3-6] Add container tests CON-001 to CON-007 (PHASE_1_TEST_STRATEGY.md §3.8)

[M1.3-7] Security exception governance:
  - Ensure security-exceptions.yaml fully populated (from M1.0-3)
  - Confirm CI expiry check passes
  - Document quarterly review cadence

Milestone 1.3 acceptance gate: Reference PHASE_1_RELEASE_PLAN.md §5.

===========================================================================
PHASE 1 EXIT
===========================================================================

When all four milestone acceptance gates are passed:

1. Run the full test suite one final time from a clean clone:
   git clone <repo> phase1_final_verification
   cd phase1_final_verification
   npm ci && npm run build && npm run typecheck && npm test && npm run test:integration

2. Verify all exit criteria in PHASE_1_PLANNING_BRIEF.md §5 with evidence logs.

3. Create docs/phase1/PHASE_1_ACCEPTANCE_NOTE.md documenting:
   - Final code commit SHA
   - Final test run evidence
   - All exit criterion verifications
   - Independent reviewer sign-off
   - Tag: v0.2.0-phase1-accepted

4. Push the acceptance tag:
   git tag -a v0.2.0-phase1-accepted -m "Phase 1 enterprise hardening accepted"
   git push origin v0.2.0-phase1-accepted

5. Update the release register in docs/release/RELEASE_NOTES.md with Phase 1 summary.

6. Do NOT deploy to production without a separate Production Readiness Review (PRR)
   sign-off. Phase 1 exit only authorizes staging deployment.

===========================================================================
INVARIANTS — MUST NOT CHANGE DURING PHASE 1
===========================================================================

These constraints are absolute and must not be violated by any PR:

- Advisory-only positioning: No control actuation or life-safety automation
- BUILD_PROFILE guard: Demo/production separation must remain intact
- Safety guardrails: verify_safety_guardrails.js must pass on every PR
- No biometric, facial recognition, or streaming capabilities introduced
- Node.js 22 across all Dockerfiles, package.json engines, .nvmrc
- No direct push to main or develop — all changes via PR
- No enterprise-grade, pilot-ready, immutable (for audit) in authoritative docs
  (per P0_DESIGN_CONTRACTS.md Contract 11)
- RELEASE_IDENTITY.md image tagging rules enforced: never deploy with `latest` alone
```

---

## Activation Checklist

Before submitting this prompt to the implementing agent or team:

- [ ] PHASE_1_PLANNING_BRIEF.md countersigned by Engineering Lead
- [ ] PHASE_1_PLANNING_BRIEF.md countersigned by Security Lead
- [ ] All 6 ADRs have Decision, Decision Date, and Signed Off By populated in PHASE_1_ARCHITECTURE_DECISION_RECORDS.md
- [ ] PHASE_1_RISK_REGISTER.md reviewed; all HIGH risks have documented mitigation and acceptance status
- [ ] Staging environment provisioned (DB, broker, IDP)
- [ ] GitHub Actions secrets configured for staging
- [ ] Phase 1 planning documents committed to `docs/phase1/` on `main` branch

**Authorized by:** ______________________________  
**Title:** ______________________________  
**Date:** ______________________________  

---

> [!IMPORTANT]
> This execution prompt is a planning artifact only. Submitting this prompt to an agent or team before the activation checklist is complete is a Phase 1 governance violation. The date field in the activation checklist must be populated before execution begins.
