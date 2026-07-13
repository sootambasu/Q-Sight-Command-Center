# P0 Acceptance Matrix
Owner: Lead Orchestrator (A0)
Last updated: 2026-07-13
Status key: PASS | FAIL | BLOCKED | NOT TESTED | IN PROGRESS

## Phase 0: Repository Baseline Gate

| # | Acceptance Criterion | Agent | Status | Evidence |
|---|---------------------|-------|--------|---------|
| 0.1 | Git initialized with main branch | A1 | IN PROGRESS | |
| 0.2 | Baseline source commit exists (no .env committed) | A1 | IN PROGRESS | |
| 0.3 | Annotated tag prototype-baseline-2026-07-13 created | A1 | IN PROGRESS | |
| 0.4 | Remote origin added | A1 | IN PROGRESS | |
| 0.5 | Remote push to main | A1 | IN PROGRESS | BLOCKED if no auth |
| 0.6 | Remote tag pushed | A1 | IN PROGRESS | BLOCKED if no auth |
| 0.7 | .github/CODEOWNERS created | A1 | IN PROGRESS | |
| 0.8 | CI workflow created | A1 | IN PROGRESS | |
| 0.9 | Security scan workflow created | A1 | IN PROGRESS | |
| 0.10 | PR template and issue templates created | A1 | IN PROGRESS | |
| 0.11 | CURRENT_STATE_SNAPSHOT.md created | A1 | IN PROGRESS | |
| 0.12 | BASELINE_FILE_MANIFEST.sha256 created | A1 | IN PROGRESS | |
| 0.13 | No secret committed | A1 | IN PROGRESS | |
| 0.14 | Branch protection configured in GitHub | A1 | NOT TESTED | BLOCKED - requires GitHub auth |

## Defect 1: No Fabricated Telemetry in Production

| # | Acceptance Criterion | Agent | Status | Evidence |
|---|---------------------|-------|--------|---------|
| 1.1 | driftAircraft removed from production code path | A3 | IN PROGRESS | |
| 1.2 | driftSatellite removed from production code path | A3 | IN PROGRESS | |
| 1.3 | Empty production DB → zero telemetry markers (not mock) | A3 | NOT TESTED | |
| 1.4 | OpenSky 429 → last-known-good fixed, marked stale | A3 | NOT TESTED | |
| 1.5 | USGS timeout → no synthetic earthquake appears | A3 | NOT TESTED | |
| 1.6 | CelesTrak malformed → no synthetic satellite appears | A3 | NOT TESTED | |
| 1.7 | Synthetic insert into production DB → rejected by trigger | A3 | NOT TESTED | |
| 1.8 | Production API image scan: no mock generator present | A3 | NOT TESTED | |
| 1.9 | migration 002 (data_origin constraint) created | A3 | IN PROGRESS | |
| 1.10 | BUILD_PROFILE=production startup with demo flags → exits non-zero | A3 | NOT TESTED | |

## Defect 2: Git/GitHub Baseline

| # | Acceptance Criterion | Agent | Status | Evidence |
|---|---------------------|-------|--------|---------|
| 2.1 | Local baseline commit created | A1 | IN PROGRESS | |
| 2.2 | Tag verified locally | A1 | IN PROGRESS | |
| 2.3 | Remote main verified (SHA matches local) | A1 | IN PROGRESS | BLOCKED |
| 2.4 | Branch protection main: PR required | A1 | NOT TESTED | BLOCKED |
| 2.5 | Branch protection main: force push disabled | A1 | NOT TESTED | BLOCKED |
| 2.6 | Tag protection for prototype-* and v* | A1 | NOT TESTED | BLOCKED |
| 2.7 | CI runs from clean checkout | A1 | NOT TESTED | BLOCKED |
| 2.8 | Build output carries commit SHA | A7 | NOT TESTED | |

## Defect 3: Dependency Security

| # | Acceptance Criterion | Agent | Status | Evidence |
|---|---------------------|-------|--------|---------|
| 3.1 | All 6 high findings are fixed or have explicit exception | A2 | NOT STARTED | |
| 3.2 | No finding labeled "resolved" when still present | A2 | NOT STARTED | |
| 3.3 | Clean builds pass after dependency changes | A2 | NOT STARTED | |
| 3.4 | security-exceptions.yaml created with all fields | A2 | NOT STARTED | |
| 3.5 | SBOM generated | A2 | NOT STARTED | |
| 3.6 | CI gate fails on deliberate high finding | A2 | NOT TESTED | |
| 3.7 | Exception expiry enforcement | A2 | NOT TESTED | |

## Defect 4: Server-Side Alert Operations

| # | Acceptance Criterion | Agent | Status | Evidence |
|---|---------------------|-------|--------|---------|
| 4.1 | Alert DB tables created (migration 004) | A5 | IN PROGRESS | |
| 4.2 | Alert API endpoints created | A5 | IN PROGRESS | |
| 4.3 | Alert state machine enforced server-side | A5 | IN PROGRESS | |
| 4.4 | localStorage not authoritative for alert state | A5 | IN PROGRESS | |
| 4.5 | Invalid state transition → 409 Conflict | A5 | NOT TESTED | |
| 4.6 | Alert history reconstructable from events table | A5 | NOT TESTED | |
| 4.7 | LocalStorage tampering does not change server state | A5 | NOT TESTED | |
| 4.8 | Two browsers see consistent alert state | A5 | NOT TESTED | |
| 4.9 | Notification delivery stubs created | A5 | IN PROGRESS | |

## Defect 5: Tamper-Evident Audit Pipeline

| # | Acceptance Criterion | Agent | Status | Evidence |
|---|---------------------|-------|--------|---------|
| 5.1 | Audit v2 schema created (migration 003) | A4 | IN PROGRESS | |
| 5.2 | Audit outbox created | A4 | IN PROGRESS | |
| 5.3 | Transactional audit event insert + outbox insert | A4 | IN PROGRESS | |
| 5.4 | Audit v2 rows cannot be modified via application role | A4 | NOT TESTED | |
| 5.5 | External sink adapter (HTTPS/WORM stub) created | A4 | IN PROGRESS | |
| 5.6 | Sink outage visible (not silent) | A4 | NOT TESTED | |
| 5.7 | Audit described as 'locally append-only' not 'immutable' | A7 | IN PROGRESS | |
| 5.8 | Server-generated request ID used (not client-supplied) | A4 | IN PROGRESS | |

## Defect 6: Camera Scope / Sensor Registry

| # | Acceptance Criterion | Agent | Status | Evidence |
|---|---------------------|-------|--------|---------|
| 6.1 | Migration 005 removes stream_url from schema | A6 | IN PROGRESS | |
| 6.2 | Migration 005 removes verification_hash from schema | A6 | IN PROGRESS | |
| 6.3 | Shared types contain no stream_url or verification_hash | A6 | IN PROGRESS | |
| 6.4 | API responses contain no prohibited fields | A6 | NOT TESTED | |
| 6.5 | /api/cameras/authorized returns 410 Gone | A6 | IN PROGRESS | |
| 6.6 | /api/sensors/registry created with clean metadata only | A6 | IN PROGRESS | |
| 6.7 | Safety scanner catches injected prohibited fixture | A6 | NOT TESTED | |
| 6.8 | No documentation claims live video available | A7 | IN PROGRESS | |
| 6.9 | Real stream credentials found and treated as compromised | A6 | IN PROGRESS | |

## Defect 7: Demo/Production Isolation

| # | Acceptance Criterion | Agent | Status | Evidence |
|---|---------------------|-------|--------|---------|
| 7.1 | BUILD_PROFILE guard in production code path | A3 | IN PROGRESS | |
| 7.2 | Separate Compose files for demo and production | A3 | IN PROGRESS | |
| 7.3 | Production image scan: no mock module present | A3 | NOT TESTED | |
| 7.4 | Demo image works and labeled synthetic | A3 | NOT TESTED | |
| 7.5 | Production startup with demo flags → exits non-zero | A3 | NOT TESTED | |
| 7.6 | Separate DB identities for demo vs production | A3 | IN PROGRESS | |

## Defect 8: Version/Runtime/Doc Consistency

| # | Acceptance Criterion | Agent | Status | Evidence |
|---|---------------------|-------|--------|---------|
| 8.1 | Single version source (root package.json) | A7 | IN PROGRESS | |
| 8.2 | CAPABILITY_STATUS.md created | A7 | IN PROGRESS | |
| 8.3 | ENVIRONMENT_AND_PORT_MATRIX.md created | A7 | IN PROGRESS | |
| 8.4 | .nvmrc created with 22 | A7 | IN PROGRESS | |
| 8.5 | Node version consistent across code/Dockerfiles | A7 | IN PROGRESS | |
| 8.6 | /version endpoint carries commit SHA | A7 | NOT TESTED | |
| 8.7 | Documented ports match code/Compose | A7 | IN PROGRESS | |
| 8.8 | No enterprise-grade/pilot-ready/immutable in auth docs | A7 | IN PROGRESS | |

## Defect 9: Advisory-Only Safety Positioning

| # | Acceptance Criterion | Agent | Status | Evidence |
|---|---------------------|-------|--------|---------|
| 9.1 | No automated shutdown claim in PRD | A7 | IN PROGRESS | |
| 9.2 | No automated shutdown claim in UI | A7 | NOT TESTED | |
| 9.3 | No control actuation route or feature exists | A8 | NOT TESTED | |
| 9.4 | Advisory-only notice in CAPABILITY_STATUS.md | A7 | IN PROGRESS | |
| 9.5 | Source limitations visible in data-sources docs | A7 | IN PROGRESS | |
| 9.6 | USGS: not early-warning claim present | A7 | IN PROGRESS | |

## Wave 5: Independent Verification (A8)
All above criteria re-tested by A8 from clean checkout.

## Release Gate
- All P0 criteria (1.x through 9.x) must be PASS or explicitly BLOCKED with owner action documented.
- No criterion may be NOT TESTED when marking release candidate.
- A criterion BLOCKED on external auth/credentials is acceptable if the code is verifiably correct.
