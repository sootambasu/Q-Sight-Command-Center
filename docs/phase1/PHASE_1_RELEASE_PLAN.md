# PHASE 1 RELEASE PLAN
## Q-Sight Command Center

**Document ID:** PHASE_1_RELEASE_PLAN  
**Status:** DRAFT — PENDING SIGN-OFF  
**Date:** 2026-07-13  
**Baseline:** `v0.1.0-phase0-accepted` (`4e31ee5ac031db1459364ec893d77e58889904f7`)  

---

## 1. Milestones

Phase 1 is organized into four sequential milestones. Each milestone has an acceptance gate that must be passed before the next milestone begins.

---

### Milestone 1.0 — Foundation (ADRs + CI/CD + Infrastructure)

**Target Duration:** ~2 weeks  
**Dependency:** All ADRs signed off before coding begins  

**Deliverables:**

| # | Deliverable | Gap Reference | ADR |
| :-- | :--- | :--- | :--- |
| 1.1 | ADR-001 through ADR-006 signed off and recorded | All | All |
| 1.2 | CI/CD quality gate workflow updated (9-step gate) | GAP-004 | ADR-006 |
| 1.3 | CI/CD deliberately failing tests confirm merge block | GAP-004 | ADR-006 |
| 1.4 | Security exception expiry script authored and CI-integrated | GAP-009 | — |
| 1.5 | Staging environment provisioned (cloud DB, broker, IDP) | GAP-003, GAP-002, GAP-001 | ADR-001/002/003 |
| 1.6 | Environment promotion model documented and approved | GAP-008 | ADR-005 |
| 1.7 | Secrets migrated from `.env` to secret manager | GAP-008 | ADR-005 |

**Milestone 1.0 Acceptance Gate:**

- [ ] All 6 ADRs have Decision field populated and dated
- [ ] CI/CD pipeline blocks on deliberate test failure (evidenced by CI run link)
- [ ] CI/CD pipeline blocks on deliberate safety scan failure (evidenced)
- [ ] Staging environment accessible and all services start cleanly
- [ ] No `.env` files with secrets committed to repository

---

### Milestone 1.1 — Identity Hardening

**Target Duration:** ~1.5 weeks  
**Dependency:** Milestone 1.0 complete; IDP provisioned; ADR-002 signed off  

**Deliverables:**

| # | Deliverable | Gap Reference |
| :-- | :--- | :--- |
| 2.1 | OIDC/JWKS integration live in staging (`OIDC_JWKS_URL` configured) | GAP-002 |
| 2.2 | HS256 fallback disabled for `BUILD_PROFILE=production` | GAP-002 |
| 2.3 | Integration tests WS-001 to WS-009 all passing in CI | GAP-005 |
| 2.4 | WebSocket ticket flow tested with real IDP-issued RS256 tokens | GAP-002 |
| 2.5 | Token expiry causes 401 within ≤ 5 seconds (tested) | GAP-002 |
| 2.6 | `auth_token_verified` audit event logged with `verified_issuer` | GAP-002 |

**Milestone 1.1 Acceptance Gate:**

- [ ] All WS tests (WS-001 to WS-009) pass in CI with real IDP
- [ ] Deliberate spoofed token attempt returns 401 in staging (evidence log)
- [ ] `x-q-sight-role` header returns 401 in production build (integration test)
- [ ] Independent reviewer confirms no HS256 fallback path in production profile

---

### Milestone 1.2 — Telemetry Pipeline + Observability

**Target Duration:** ~2.5 weeks  
**Dependency:** Milestone 1.0 complete; broker provisioned; ADR-001 signed off  

**Deliverables:**

| # | Deliverable | Gap Reference |
| :-- | :--- | :--- |
| 3.1 | Message broker provisioned in staging | GAP-001 |
| 3.2 | Ingestor workers refactored to publish to broker (producers only) | GAP-001 |
| 3.3 | Telemetry consumer service created (broker → DB write) | GAP-001 |
| 3.4 | Dead-letter queue implemented and observable | GAP-001 |
| 3.5 | Circuit breaker on DB write implemented | GAP-001 |
| 3.6 | Ingestor failure tests INF-001 to INF-007 passing in CI | GAP-005 |
| 3.7 | OpenTelemetry SDK integrated in API and workers | GAP-006 |
| 3.8 | Traces visible in staging observability backend | GAP-006 |
| 3.9 | Audit sink (`httpsExporter`) activated in staging | GAP-006 |
| 3.10 | Alert for audit sink dead-letter queue non-empty | GAP-006 |

**Milestone 1.2 Acceptance Gate:**

- [ ] Load test at 500 msgs/sec for 5 minutes: event loop P99 ≤ 100 ms (load test report)
- [ ] Dead-letter queue observable with at least one test message
- [ ] Audit events appear in external sink within 30 seconds (evidence log)
- [ ] All INF tests passing in CI

---

### Milestone 1.3 — Database HA + Disaster Recovery + Deployment Hardening

**Target Duration:** ~2 weeks  
**Dependency:** Milestone 1.0 complete; HA DB provisioned; ADR-003/005 signed off  

**Deliverables:**

| # | Deliverable | Gap Reference |
| :-- | :--- | :--- |
| 4.1 | PostgreSQL replica provisioned in staging | GAP-003 |
| 4.2 | Failover drill completed: RTO documented per ADR-003 PATH decision (PATH 1: ≤ 30 sec; PATH 2: ≤ 120 sec) | GAP-003, GAP-007 |
| 4.3 | Backup restoration verified from prior day's backup | GAP-003, GAP-007 |
| 4.4 | DR runbook authored and reviewed | GAP-007 |
| 4.5 | Container images signed (Cosign) in CI pipeline | GAP-008 |
| 4.6 | Container structure tests CON-001 to CON-007 passing in CI | — |
| 4.7 | Migration tests MIG-001 to MIG-007 passing in CI | — |
| 4.8 | Promotion checklist enforced for staging → production gate | GAP-008 |
| 4.9 | `security-exceptions.yaml` fully populated with expiry dates | GAP-009 |

**Milestone 1.3 Acceptance Gate:**

- [ ] DR drill report attached and RTO ≤ 30 seconds confirmed
- [ ] Backup restoration successful (evidence log)
- [ ] Container images signed and verification passes in CI (evidence)
- [ ] All CON and MIG tests passing in CI
- [ ] All `security-exceptions.yaml` entries have valid expiry dates and owners

---

## 2. Sequencing

```
   Week 1-2                Week 3-4              Week 5-7             Week 8-9
┌─────────────────┐   ┌──────────────────┐   ┌──────────────────┐  ┌──────────────────┐
│  Milestone 1.0  │──▶│  Milestone 1.1   │   │  Milestone 1.2   │  │  Milestone 1.3   │
│  Foundation     │   │  Identity Hard.  │   │  Queue + Obs.    │  │  DB HA + DR +    │
│  ADRs + CI +    │   │  OIDC/JWKS       │   │  Load Tests      │  │  Deployment      │
│  Infrastructure │   │                  │   │                  │  │  Hardening       │
└─────────────────┘   └──────────────────┘   └──────────────────┘  └──────────────────┘
                        (can start in          (can start in
                         parallel with          parallel with
                         1.2 if broker          1.1 if IDP and
                         is provisioned)        broker are ready)
```

> [!NOTE]
> Milestones 1.1, 1.2, and 1.3 may proceed in parallel once Milestone 1.0 is complete and their respective ADR dependencies are provisioned. They must not share implementation work that creates merge conflicts. Engineering Lead is responsible for parallel track coordination.

> [!IMPORTANT]
> **The 8–9 week timeline is conditional on infrastructure availability.**
>
> The entire schedule assumes that the message broker, managed PostgreSQL HA instance, and OIDC/IDP
> test tenant are provisioned and accessible by the end of Milestone 1.0. If any of the following
> are delayed, **all subsequent milestone start dates shift proportionally**:
>
> - ADR sign-off delayed (e.g., procurement not approved) → Milestone 1.0 slips; cascades to all milestones
> - Broker not provisioned by end of Milestone 1.0 → Milestone 1.2 cannot begin implementation work
> - IDP test tenant not provisioned by end of Milestone 1.0 → Milestone 1.1 cannot begin integration testing
> - PostgreSQL HA instance not provisioned → Milestone 1.3 DR drill cannot be scheduled
>
> Engineering Lead must re-baseline milestone target dates if Milestone 1.0 completes later than Week 2.
> RISK-001 in PHASE_1_RISK_REGISTER.md is the tracking vehicle for this dependency.

---

## 3. Branch Strategy

### Branch Hierarchy

```
main                  ← Protected; only from develop via PR + approval
  └── develop         ← Protected; only from feature/fix branches via PR
        ├── feature/phase1/gap-001-telemetry-queue
        ├── feature/phase1/gap-002-oidc-jwks
        ├── feature/phase1/gap-003-db-ha
        ├── feature/phase1/gap-004-cicd-enforcement
        ├── feature/phase1/gap-005-integration-tests
        ├── feature/phase1/gap-006-observability
        ├── feature/phase1/gap-007-disaster-recovery
        ├── feature/phase1/gap-008-deployment-hardening
        └── feature/phase1/gap-009-security-exceptions
```

### Branch Naming Convention

```
feature/phase1/{gap-id}-{short-description}
fix/phase1/{gap-id}-{short-description}
docs/phase1/{description}
```

### Rules

1. All branches created from `develop` (never from `main` directly)
2. Branch name must include Phase 1 gap ID (e.g., `gap-001`)
3. No `main` or `develop` direct pushes — GitHub branch protection enforced
4. Feature branches are deleted after PR merge
5. Release branches: `release/v0.2.0-phase1-rc{N}` cut from `develop` for staging promotion

---

## 4. PR Rules

| Rule | Requirement |
| :--- | :--- |
| **Minimum approvers** | 1 (Engineering Lead or designated reviewer) |
| **CI gate** | All 9 CI steps must pass before merge is allowed |
| **PR description** | Must link to the Gap ID being addressed and reference the ADR if applicable |
| **Test coverage** | All tests relevant to the gap must be added in the same PR |
| **No WIP PRs merged** | Draft PRs may not be merged; convert to ready before review |
| **Commit hygiene** | Squash or rebase merge only; no merge commits on `develop` |
| **Review turnaround** | Reviewer must respond within 1 business day of PR-ready |

---

## 5. Acceptance Gates

Each gate below must be passed before the next stage proceeds. Gates are verified by the Engineering Lead and documented in the release register.

| Gate | Trigger | Verifier | Pass Condition |
| :--- | :--- | :--- | :--- |
| **ADR Sign-Off** | Before any Milestone 1.0 code work | Engineering Lead + Security Lead | All 6 ADRs have Decision recorded |
| **Milestone 1.0** | After CI/CD and infrastructure ready | Engineering Lead | All Milestone 1.0 deliverables and acceptance items checked |
| **Milestone 1.1** | After identity hardening | Security Lead | All WS tests pass with real IDP; HS256 disabled |
| **Milestone 1.2** | After queue + observability | Engineering Lead | Load test passed; audit events in sink |
| **Milestone 1.3** | After DB HA + DR + hardening | Engineering Lead + Security Lead | DR drill passed; containers signed |
| **Phase 1 Exit** | After all milestones complete | Independent reviewer | All exit criteria from PHASE_1_PLANNING_BRIEF.md §5 verified |

---

## 6. Rollback Plan

### Per-PR Rollback

If a merged PR introduces a regression:

1. Immediately revert the PR via GitHub "Revert PR" on `develop`
2. CI must pass on the revert before it merges
3. Document regression in the Gap backlog with root cause
4. Root cause must be fixed before re-introducing the change

### Milestone Rollback

If a milestone deployment to staging introduces a critical regression:

1. Redeploy prior container image: `q-sight-{service}-{profile}:{prior-version}-{prior-sha}`
2. Database schema rollback: **not supported** (schema changes are forward-only); use data correction scripts if required
3. Engineering Lead declares milestone rollback and re-opens milestone work items

### Production Rollback (Demo → Production Boundary Violation)

If any change accidentally removes the `BUILD_PROFILE` guard or introduces demo-mode behavior in production:

1. Immediately take the production service offline
2. Redeploy last verified production-profile container image
3. Treat as a P0-CRITICAL incident; mandatory post-mortem within 48 hours
4. Safety guardrails scanner added to production deployment health check

---

## 7. Demo vs. Production Boundary

The demo/production boundary is governed by `BUILD_PROFILE` (see P0_DESIGN_CONTRACTS.md Contract 1 and Contract 2).

| Aspect | Demo Mode | Production Mode |
| :--- | :--- | :--- |
| `BUILD_PROFILE` | `demo` | `production` |
| Synthetic data | Allowed and labeled | Rejected by DB trigger |
| `x-q-sight-role` header | Accepted (dev simulation) | Rejected (401) |
| `?role=` query param | Accepted | Rejected (401) |
| HS256 JWT fallback | Active if no OIDC | **Disabled** |
| External IDP | Optional | **Required** |
| Audit sink | Local dev exporter | HTTPS external sink |

### Enforcement in Phase 1

- Demo mode must remain functional throughout Phase 1 (regression check in CI)
- Production profile must pass all integration tests in staging (CI run with `BUILD_PROFILE=production`)
- No PR may disable the `BUILD_PROFILE` guard without a dedicated ADR and Engineering Lead sign-off
- Safety scanner checks for mock modules in production image on every container build

---

## 8. Release Versioning

| Release | Trigger | Semantic Version | Tag Format |
| :--- | :--- | :--- | :--- |
| Phase 1 RC1 | First staging deployment | `0.2.0-rc.1` | `v0.2.0-rc.1` |
| Phase 1 RC-N | Each staging iteration | `0.2.0-rc.N` | `v0.2.0-rc.N` |
| Phase 1 Final | All exit criteria met | `0.2.0` | `v0.2.0-phase1-accepted` |

All images tagged: `q-sight-{service}-{profile}:{version}-{short-sha}`  
Never deploy using `latest` tag alone (enforced by CI lint per RELEASE_IDENTITY.md).

---

> [!CAUTION]
> The Phase 1 release plan does not authorize any production deployment to live operational environments. All Phase 1 work targets the staging environment. A separate Production Readiness Review (PRR) must be conducted and signed off before any Phase 1 artifact is promoted to production.
