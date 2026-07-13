# PHASE 1 TEST STRATEGY
## Q-Sight Command Center

**Document ID:** PHASE_1_TEST_STRATEGY  
**Status:** DRAFT — PENDING SIGN-OFF  
**Date:** 2026-07-13  
**Baseline:** `v0.1.0-phase0-accepted` (`4e31ee5ac031db1459364ec893d77e58889904f7`)  
**Gap Reference:** GAP-005 (End-to-End Integration Tests)  

---

## 1. Current Test Baseline

As of Phase 0 acceptance, the test suite consists of:

| Test | Type | Location | Status |
| :--- | :--- | :--- | :--- |
| `outboxWorker.test.ts` | Unit | `packages/shared/src/__tests__/` | 3/3 PASS |
| `verify_safety_guardrails.js` | Static scan | `scripts/` | PASS |
| `ws_verify.js` | Manual WS auth smoke test | `scripts/` | PASS (manual) |

**Coverage gap:** No integration tests, no API contract tests, no load tests, no WebSocket auth regression tests, no telemetry failure scenario tests, no migration tests, no container health tests.

---

## 2. Test Pyramid

```
                    ┌─────────────────────────┐
                    │     Load Tests           │  ← k6 / Locust (CI-gated on PR to main)
                    ├─────────────────────────┤
                    │  Integration Tests       │  ← Supertest + ws + Testcontainers
                    ├─────────────────────────┤
                    │  API Contract Tests      │  ← OpenAPI / Pact
                    ├─────────────────────────┤
                    │  Unit Tests              │  ← Jest (existing + expanded)
                    └─────────────────────────┘
                    + Container Tests (structure)
                    + Migration Tests (schema)
                    + CI Enforcement Checks
```

---

## 3. Test Suites

### 3.1. Unit Tests

**Framework:** Jest (existing)  
**Run command:** `npm test`  
**CI trigger:** Every PR  

#### Existing Coverage (must not regress)
- `outboxWorker.test.ts`: audit outbox flush, retry, dead-letter behavior (3 tests)

#### Required New Unit Tests

| Test ID | Component | Scenario | Expected Result |
| :--- | :--- | :--- | :--- |
| UT-001 | `requirePermission.ts` | Missing JWT → no role resolved | 401 returned |
| UT-002 | `requirePermission.ts` | Valid role, insufficient permission | 403 returned |
| UT-003 | `requirePermission.ts` | Valid role, correct permission | Handler invoked |
| UT-004 | Alert state machine | Valid transition `open → acknowledged` | State persisted |
| UT-005 | Alert state machine | Invalid transition `resolved → investigating` | 409 Conflict |
| UT-006 | `DataOrigin` constraint | Synthetic insert in production mode | Trigger rejects |
| UT-007 | `TelemetryProvenance` | Stale data age calculation | Correct `quality_state` |
| UT-008 | `VerifiedPrincipal` | `isDemoSim=true` rejected in production profile | 401 returned |
| UT-009 | Safety guardrails scanner | Injected `stream_url` in source | Scanner exits 1 |
| UT-010 | Safety guardrails scanner | Injected `getUserMedia` call | Scanner exits 1 |
| UT-011 | Security exception expiry | Expired date in `security-exceptions.yaml` | Check script exits 1 |
| UT-012 | Security exception expiry | Valid future date | Check script exits 0 |

---

### 3.2. Integration Tests

**Framework:** Jest + Supertest (HTTP) + `ws` (WebSocket client) + Testcontainers (PostgreSQL)  
**Run command:** `npm run test:integration`  
**CI trigger:** Every PR  

Integration tests spin up a real PostgreSQL (via Testcontainers) and the Fastify API instance in-process. They do not mock the database layer.

#### Telemetry API Flows

| Test ID | Flow | Scenario | Expected Result |
| :--- | :--- | :--- | :--- |
| INT-001 | `GET /api/aircraft` | Empty DB, production mode | 200, empty array, `no_trusted_data` quality state |
| INT-002 | `GET /api/aircraft` | DB has stale record (> 15 min) | 200, record present, `quality_state: 'stale'` |
| INT-003 | `GET /api/aircraft` | DB has expired record (> 15 min) | 200, record present, `quality_state: 'expired'` |
| INT-004 | `GET /api/satellites` | DB has record with `data_origin: 'synthetic'` in production mode | Record excluded or flagged |
| INT-005 | `GET /api/seismic` | Source provider timeout simulated | 200, last-known-good returned with `quality_state: 'degraded'` |

#### Alert API Flows

| Test ID | Flow | Scenario | Expected Result |
| :--- | :--- | :--- | :--- |
| INT-010 | `POST /api/alerts` | Create new alert as operator | 201, alert created with `status: 'open'` |
| INT-011 | `PATCH /api/alerts/:id/status` | Valid transition `open → acknowledged` | 200, `alert_events` row written |
| INT-012 | `PATCH /api/alerts/:id/status` | Invalid transition `resolved → investigating` | 409 Conflict |
| INT-013 | `PATCH /api/alerts/:id/status` | Concurrent update, stale `state_version` | 409 Conflict (optimistic lock) |
| INT-014 | `GET /api/alerts/:id` | Fetch alert as auditor (no telemetry access) | 200, alert returned |

#### Audit API Flows

| Test ID | Flow | Scenario | Expected Result |
| :--- | :--- | :--- | :--- |
| INT-020 | Audit log write | Authorized camera metadata accessed | `audit_logs` row written within same transaction |
| INT-021 | Audit immutability | Attempt UPDATE on `audit_logs` via application role | DB trigger rejects — no update applied |
| INT-022 | Audit outbox | Outbox flush to HTTPS sink succeeds | Outbox row marked `delivered` |
| INT-023 | Audit outbox | Sink returns 500 | Message retried; dead-letter after max retries |
| INT-024 | RBAC audit | Operator attempts to access `GET /api/audit` | 403, `access_denied` audit event written |

#### Sensor Registry Flows

| Test ID | Flow | Scenario | Expected Result |
| :--- | :--- | :--- | :--- |
| INT-030 | `GET /api/sensors/registry` | Operator role | 200, no `stream_url` or `verification_hash` in response |
| INT-031 | `GET /api/cameras/authorized` | Any role | 410 Gone |

---

### 3.3. API Contract Tests

**Framework:** Dredd (OpenAPI) or Pact (consumer-driven)  
**Run command:** `npm run test:contract`  
**CI trigger:** Every PR  

Contract tests verify that the API responses match the declared OpenAPI schema and that any breaking changes to the contract are detected before merge.

#### Coverage

| Test ID | Endpoint | Contract Assertion |
| :--- | :--- | :--- |
| CT-001 | `GET /api/aircraft` | Response matches `AircraftResponse` schema |
| CT-002 | `GET /api/satellites` | Response matches `SatelliteResponse` schema |
| CT-003 | `GET /api/seismic` | Response matches `SeismicResponse` schema |
| CT-004 | `GET /api/sensors/registry` | Response excludes `stream_url`, `verification_hash` |
| CT-005 | `POST /api/alerts` | Request and response match `AlertCreate` schema |
| CT-006 | `GET /version` | Response contains `version`, `commit`, `buildProfile` |
| CT-007 | Any endpoint | `x-q-sight-role` header rejected with 401 in production profile |

---

### 3.4. WebSocket Authentication Tests

**Framework:** Jest + `ws` client  
**Run command:** `npm run test:ws`  
**CI trigger:** Every PR  

| Test ID | Scenario | Expected Result |
| :--- | :--- | :--- |
| WS-001 | Valid RS256 token → ticket → WS connect | Connection accepted, channels subscribed |
| WS-002 | Expired RS256 token → ticket request | 401 from ticket endpoint |
| WS-003 | Missing Authorization header | 401 from ticket endpoint |
| WS-004 | Reused WS ticket (replay attempt) | 401 on second use |
| WS-005 | `?role=operator` query param in production mode | 401; header-based auth rejected |
| WS-006 | Auditor role connects and subscribes to `telemetry.aircraft` | 403; subscription denied; `ws_subscription_denied` audit event |
| WS-007 | Operator role connects and subscribes to `telemetry.aircraft` | Subscription accepted; data flows |
| WS-008 | WS connection dropped and reconnected | New ticket required; old ticket rejected |
| WS-009 | `cameras.*` channel subscription attempt | Schema validation rejects unknown channel |

---

### 3.5. Telemetry Ingestion Failure Tests

**Framework:** Jest + mock HTTP server (nock/msw)  
**Run command:** `npm run test:ingestor`  
**CI trigger:** Every PR  

| Test ID | Scenario | Expected Result |
| :--- | :--- | :--- |
| INF-001 | OpenSky returns 429 (rate limit) | Worker logs `ingestion_run_failed`, does not crash, last-known-good preserved |
| INF-002 | OpenSky returns 503 (server unavailable) | Worker falls back to mock (demo) or marks `quality_state: 'degraded'` (production) |
| INF-003 | CelesTrak returns malformed TLE | Zod validation rejects, `ingestion_records_skipped` logged, no DB write |
| INF-004 | USGS timeout exceeds `INGESTION_REQUEST_TIMEOUT_MS` | Fetch aborted, run marked failed, circuit breaker increments |
| INF-005 | DB connection failure during write | Message published to dead-letter queue; worker does not crash |
| INF-006 | Broker connection failure | Worker logs error, backs off with exponential retry |
| INF-007 | `INGESTION_MAX_RECORDS_PER_RUN` exceeded | Records beyond limit silently discarded and counted in `ingestion_records_skipped` |

---

### 3.6. Migration Tests

**Framework:** Jest + Testcontainers  
**Run command:** `npm run test:migration`  
**CI trigger:** Every PR  

| Test ID | Scenario | Expected Result |
| :--- | :--- | :--- |
| MIG-001 | Apply all migrations from clean schema | All migrations apply with exit code 0 |
| MIG-002 | Apply migration 002 (`data_origin` constraint) | Trigger rejects `INSERT` with `data_origin='synthetic'` in production mode |
| MIG-003 | Apply migration 003 (audit v2 + outbox) | `UPDATE` on `audit_logs` rejected by trigger |
| MIG-004 | Apply migration 004 (alert platform) | Alert tables present; state machine trigger active |
| MIG-005 | Apply migration 005 (sensor registry) | `stream_url` and `verification_hash` columns absent from `sensor_registry` |
| MIG-006 | Rollback is not supported | Confirm no rollback scripts; document as intentional |
| MIG-007 | Migration idempotency | Running migrations twice does not fail | `IF NOT EXISTS` guards validated |

---

### 3.7. Load Tests

**Framework:** k6 (recommended) or Locust  
**Run command:** `npm run test:load` (or `k6 run scripts/load/telemetry_load.js`)  
**CI trigger:** PR to `main` only (not every PR — expensive)  

#### Load Scenario: Telemetry Ingestion Throughput

| Parameter | Value |
| :--- | :--- |
| Target | 500 msgs/sec sustained |
| Duration | 5 minutes |
| Workers | 3 concurrent ingestor workers |
| Broker | RabbitMQ / Kafka / Redis Streams (per ADR-001) |
| DB | Staging PostgreSQL (per ADR-003) |

**Acceptance Thresholds:**

| Metric | Threshold |
| :--- | :--- |
| Event loop lag P99 | ≤ 100 ms |
| DB write latency P95 | ≤ 500 ms |
| Message drop rate | 0% under nominal load |
| Dead-letter queue size | 0 under nominal load |
| API `GET /api/aircraft` P95 response time | ≤ 200 ms |

#### Load Scenario: WebSocket Concurrent Connections

| Parameter | Value |
| :--- | :--- |
| Target | 200 concurrent WebSocket clients |
| Channels | All 4 telemetry/alert channels subscribed |
| Duration | 10 minutes |

**Acceptance Thresholds:**

| Metric | Threshold |
| :--- | :--- |
| Connection establishment P99 | ≤ 500 ms |
| Message delivery latency P95 | ≤ 1000 ms |
| Connection drop rate | < 1% |

---

### 3.8. Container Tests

**Framework:** `container-structure-test` (Google) or Trivy + manual health check  
**Run command:** `npm run test:container`  
**CI trigger:** Every PR  

| Test ID | Assertion |
| :--- | :--- |
| CON-001 | API container starts and responds to `GET /health` within 10 seconds |
| CON-002 | Web container starts and serves static assets (HTTP 200) |
| CON-003 | No `stream_url` or `verification_hash` strings in API production image filesystem |
| CON-004 | No mock generator module in production image (`!demo`) |
| CON-005 | `node:22-alpine` base image used across all Dockerfiles |
| CON-006 | Container image signed (Cosign) and verification passes |
| CON-007 | Trivy scan: zero CRITICAL findings; HIGH findings documented in exceptions |

---

### 3.9. CI Enforcement Checks

The following checks run in GitHub Actions on every PR and block merge if they fail. See ADR-006 for the complete quality gate definition.

| Check ID | Command | Blocking |
| :--- | :--- | :--- |
| CI-001 | `npm ci` | Yes |
| CI-002 | `npm run typecheck` | Yes |
| CI-003 | `npm test` | Yes |
| CI-004 | `node scripts/verify_safety_guardrails.js` | Yes |
| CI-005 | `npm audit --audit-level=high` | Yes |
| CI-006 | Exception expiry check script | Yes |
| CI-007 | `npm run build` | Yes |
| CI-008 | `docker buildx build` | Yes |
| CI-009 | SBOM generation | No (artifact upload) |

---

## 4. Test Environment Requirements

| Environment | Purpose | Database | Broker | IDP |
| :--- | :--- | :--- | :--- | :--- |
| Local dev | Unit + integration | Testcontainers (auto) | Mock | Dev HS256 |
| CI (GitHub Actions) | All PR checks | Testcontainers | Mock or embedded | Dev HS256 |
| Staging | Integration + load + DR | PostgreSQL HA (per ADR-003) | Real broker (per ADR-001) | Real IDP (per ADR-002) |

---

## 5. Coverage Targets

| Suite | Phase 0 Coverage | Phase 1 Target |
| :--- | :--- | :--- |
| Unit tests | 3 tests (outbox only) | ≥ 40 tests, all critical paths |
| Integration tests | 0 | ≥ 25 tests covering all API flows |
| API contract tests | 0 | All public endpoints |
| WebSocket auth tests | Manual only | 9 automated (WS-001 to WS-009) |
| Ingestion failure tests | 0 | 7 automated (INF-001 to INF-007) |
| Migration tests | 0 | 7 automated (MIG-001 to MIG-007) |
| Load tests | 0 | 2 scenarios (throughput + concurrency) |
| Container tests | 0 | 7 automated (CON-001 to CON-007) |

---

> [!NOTE]
> This test strategy is a planning document. Implementation of each suite must follow the ADR sign-off sequence. No test framework code should be committed until the test framework choices for integration and contract testing are confirmed and documented (see PHASE_1_ARCHITECTURE_DECISION_RECORDS.md).
