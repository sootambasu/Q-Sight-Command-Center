# PHASE 1 ARCHITECTURE DECISION RECORDS
## Q-Sight Command Center

**Document ID:** PHASE_1_ARCHITECTURE_DECISION_RECORDS  
**Status:** CANDIDATE — OPTIONS OPEN; DECISIONS REQUIRED BEFORE IMPLEMENTATION  
**Date:** 2026-07-13  
**Baseline:** `v0.1.0-phase0-accepted` (`4e31ee5ac031db1459364ec893d77e58889904f7`)  
**Format:** Lightweight ADR (Context → Options → Decision → Consequences)  

> [!IMPORTANT]
> All ADRs in this document are **candidates**. The "Decision" field is left as `[PENDING]` where a choice has not yet been formally made. No implementation work may begin on a component until the corresponding ADR is signed off and its Decision field is populated and dated.

---

## ADR-001 — Message Queue Choice: RabbitMQ vs Kafka vs Redis Streams

**Status:** PENDING  
**Gap Reference:** GAP-001 (Telemetry Pipeline Load Limits)  
**Decision Required By:** Phase 1 Milestone 1 start  

### Context

The current architecture has ingestor workers writing telemetry directly to PostgreSQL within the same Node.js event loop tick as the HTTP poll from the external provider. This creates a tight coupling that will collapse under sustained load. A persistent message broker must be interposed between ingestor workers (producers) and the database persistence layer (consumers) to provide:

- **Durability**: Messages must survive a consumer crash without data loss
- **Backpressure**: Consumers control their own throughput; producers are not blocked
- **Dead-letter routing**: Failed messages are captured, not silently dropped
- **Visibility**: Broker queue depth is observable via the observability stack
- **Operational simplicity**: The team must be able to operate the broker with reasonable effort

The existing architecture uses PostgreSQL `LISTEN/NOTIFY` for API-to-client push. The broker does not replace this mechanism; it sits upstream of the DB write.

### Options

#### Option A: RabbitMQ

| Attribute | Assessment |
| :--- | :--- |
| Durability | Durable queues + message persistence on disk |
| Protocol | AMQP 0-9-1 (well-supported in Node.js via `amqplib`) |
| Dead-letter | Native DLX (Dead Letter Exchange) support |
| Operational complexity | Moderate — single cluster for current scale |
| Throughput | ≈ 20,000–50,000 msgs/sec per node (well above requirement) |
| Hosting | Self-hosted or CloudAMQP managed service |
| Fit | Well-suited for work queues; per-message acknowledgement model maps cleanly to telemetry records |

**Recommended for:** Teams that want a battle-tested work queue with simple semantics, low operational overhead, and excellent Node.js tooling.

#### Option B: Apache Kafka

| Attribute | Assessment |
| :--- | :--- |
| Durability | Persistent log with configurable retention |
| Protocol | Kafka native (via `kafkajs` in Node.js) |
| Dead-letter | Requires manual DLT topic pattern |
| Operational complexity | High — ZooKeeper/KRaft, partition management, consumer group rebalancing |
| Throughput | Millions of msgs/sec; significantly over-engineered for current scale |
| Hosting | Confluent Cloud, AWS MSK, or self-hosted |
| Fit | Best for event sourcing, replay, multi-consumer fan-out at very high scale |

**Recommended for:** Organizations with existing Kafka infrastructure or anticipated need for event replay / audit log streaming at scale. Avoid if team has no Kafka operations experience.

#### Option C: Redis Streams

| Attribute | Assessment |
| :--- | :--- |
| Durability | Configurable persistence (RDB/AOF); risk of data loss on ungraceful shutdown without AOF |
| Protocol | Redis RESP via `ioredis` — already a familiar ecosystem for many Node teams |
| Dead-letter | Manual implementation via `XPENDING` / consumer group management |
| Operational complexity | Low — Redis is already commonly present in web stacks |
| Throughput | ≈ 100,000+ msgs/sec; adequate for requirement |
| Hosting | Redis Cloud, AWS ElastiCache (Redis), or self-hosted |
| Fit | Adequate if Redis is already in the infrastructure footprint; less mature ecosystem for complex routing |

**Recommended for:** Teams with existing Redis infrastructure wanting the lowest incremental operational cost.

### Decision

**[PENDING — must be signed off by Engineering Lead and Infrastructure Lead]**

Recommended direction: **Option A (RabbitMQ)** if no existing Kafka/Redis infrastructure is available. Simple AMQP semantics map cleanly to the telemetry work queue pattern, with native DLX and per-message ack providing durability guarantees appropriate for the current scale.

**Decision Rationale (to be completed on sign-off):**  
_[Record chosen option, rationale, any conditions, and sign-off date here]_

### Consequences

- **If RabbitMQ**: Add `amqplib` + `@types/amqplib` to worker and consumer packages. Provision RabbitMQ in Docker Compose (dev) and managed AMQP service (staging/production). Update worker architecture to publish, not write.
- **If Kafka**: Provision Kafka cluster. Add `kafkajs`. Implement Dead Letter Topic pattern. Higher operational burden.
- **If Redis Streams**: Add `ioredis`. Provision Redis with AOF persistence. Implement manual DLQ pattern.

In all cases: ingestor workers become **producers only**; a new **telemetry-consumer** service handles DB writes and backpressure.

---

## ADR-002 — Production Identity Provider Integration

**Status:** PENDING  
**Gap Reference:** GAP-002 (OIDC/JWKS Production Validation)  
**Decision Required By:** Phase 1 Milestone 1 start  

### Context

The API currently verifies JWTs using a symmetric HS256 secret (`JWT_SECRET`). The `jose` library and OIDC environment variables (`OIDC_JWKS_URL`, `OIDC_ISSUER_URL`, `OIDC_AUDIENCE`) are stubbed but not integration-tested against a real IDP. WebSocket tickets are issued and verified locally. Production deployments must use asymmetric RS256 or ES256 tokens issued by a trusted external IDP with JWKS key rotation support.

### Options

#### Option A: Auth0

| Attribute | Assessment |
| :--- | :--- |
| Setup complexity | Low — cloud-managed; JWKS endpoint auto-provisioned |
| Node.js integration | Excellent (`openid-client`, `jose` compatible) |
| RBAC mapping | Custom claims / roles via Auth0 Actions |
| Pricing | Free tier adequate for staging; production scale requires paid plan |
| Key rotation | Automatic; no manual intervention |

#### Option B: Keycloak (Self-hosted)

| Attribute | Assessment |
| :--- | :--- |
| Setup complexity | Moderate — requires Keycloak container + realm configuration |
| Node.js integration | Standard OIDC; compatible with `jose` |
| RBAC mapping | Native role claims in JWT |
| Pricing | Open source; infrastructure cost only |
| Key rotation | Configurable; requires operational management |

#### Option C: Okta

| Attribute | Assessment |
| :--- | :--- |
| Setup complexity | Low — cloud-managed; enterprise feature-rich |
| Node.js integration | Excellent |
| RBAC mapping | Group/role claims in JWT |
| Pricing | Enterprise pricing; may require procurement |
| Key rotation | Automatic |

### Decision

**[PENDING — must be signed off by Engineering Lead and Security Lead]**

Recommended direction for staging validation: **Option A (Auth0)** for lowest setup friction. For production enterprise deployment, **Option B (Keycloak)** avoids dependency on an external SaaS IDP and allows full control of token issuance.

**Decision Rationale (to be completed on sign-off):**  
_[Record chosen IDP, tenant/realm configuration approach, claim mapping for roles, and sign-off date here]_

### Consequences

- HS256 fallback (`JWT_SECRET` only) must be disabled when `BUILD_PROFILE=production`
- API context extraction (`context.ts`) updated to map IDP-specific claims to `VerifiedPrincipal`
- WebSocket ticket issuance must use IDP-issued tokens as the source of truth for subject and role
- All integration tests must be updated to obtain real tokens from the chosen IDP in the staging environment

---

## ADR-003 — PostgreSQL High-Availability Approach

**Status:** PENDING  
**Gap Reference:** GAP-003 (Database Reliability and Clustering)  
**Decision Required By:** Phase 1 Milestone 1 start  

### Context

The current deployment uses a single PostgreSQL container with no replication. Data loss on container failure is unacceptable in a staging or production context. RTO and RPO targets have not been formally defined. The system requires PostGIS, which limits the choice of managed database services.

### Options

#### Option A: AWS RDS for PostgreSQL with Multi-AZ (PostGIS via extension)

| Attribute | Assessment |
| :--- | :--- |
| PostGIS support | Yes — available as RDS extension |
| Failover | Automated Multi-AZ failover; RTO ≈ 60-120 seconds |
| Operational complexity | Low — fully managed |
| Backup | Automated daily snapshots + point-in-time recovery |
| Cost | Moderate; scales with instance size |

#### Option B: Patroni + etcd (Self-hosted)

| Attribute | Assessment |
| :--- | :--- |
| PostGIS support | Full — standard PostgreSQL installation |
| Failover | Automated leader election; RTO ≈ 20-30 seconds |
| Operational complexity | High — requires etcd cluster management |
| Backup | Must be configured separately (pgBackRest, WAL-G) |
| Cost | Infrastructure cost only |

#### Option C: CloudSQL (Google Cloud) with HA

| Attribute | Assessment |
| :--- | :--- |
| PostGIS support | Yes — PostGIS available on CloudSQL |
| Failover | Automatic regional failover; RTO ≈ 60 seconds |
| Operational complexity | Low — fully managed |
| Backup | Automated; point-in-time recovery |
| Cost | Comparable to RDS |

### Decision

**[PENDING — must be signed off by Engineering Lead and Infrastructure Lead]**

> [!CAUTION]
> **RTO Conflict — Must be resolved at sign-off. This field may not remain PENDING.**
>
> The enterprise gap backlog (GAP-003) and release plan (Milestone 1.3 deliverable 4.2) specify an
> **RTO target of ≤ 30 seconds**. Managed services (Option A: AWS RDS Multi-AZ, Option C: CloudSQL)
> have documented failover times of **60–120 seconds**, which **does not meet the ≤ 30-second target**.
>
> The decision-maker must choose exactly one of the following two paths before sign-off:
>
> **PATH 1 — RTO ≤ 30 seconds is non-negotiable:**
> - Select **Option B (Patroni + etcd, self-hosted)**
> - Accept higher operational complexity (etcd cluster management, manual Patroni ops, separate backup tooling)
> - RTO ≤ 30 seconds is achievable with Patroni and must be demonstrated in the Milestone 1.3 DR drill
> - All RTO references in GAP-003, Milestone 1.3 deliverable 4.2, and PHASE_1_PLANNING_BRIEF.md §5.3 remain at ≤ 30 seconds
>
> **PATH 2 — Managed DB service (RDS/CloudSQL) is preferred:**
> - Select **Option A (AWS RDS Multi-AZ)** or **Option C (CloudSQL)**
> - **Revise the RTO target** to a realistic managed-service value: **≤ 120 seconds**
> - Update GAP-003 acceptance criteria, Milestone 1.3 deliverable 4.2, and PHASE_1_PLANNING_BRIEF.md §5.3 to reflect ≤ 120 seconds before the next milestone gate review
> - Record this as an accepted trade-off: managed operational simplicity at the cost of a relaxed RTO
> - RISK-011 in PHASE_1_RISK_REGISTER.md tracks this decision until the DR drill confirms the accepted RTO

Recommended direction: if the team has no existing Patroni/etcd operations experience, **select PATH 2** and formally revise the RTO target to ≤ 120 seconds. The operational overhead of self-hosting Patroni is significant.

**Decision (to be populated at sign-off):**

| Field | Value |
| :--- | :--- |
| Selected Option | _[A / B / C — delete as applicable]_ |
| Selected RTO Path | _[PATH 1 — ≤ 30 sec / PATH 2 — ≤ 120 sec — delete as applicable]_ |
| Accepted RTO Target | _[≤ 30 seconds / ≤ 120 seconds — delete as applicable]_ |
| Accepted RPO Target | _[e.g., ≤ 1 hour]_ |
| Backup Cadence | _[e.g., daily automated snapshot + continuous WAL archiving]_ |
| Decision Date | _[YYYY-MM-DD]_ |
| Signed Off By (Engineering Lead) | _[Name]_ |
| Co-signed By (Infrastructure Lead) | _[Name]_ |

### Consequences

- Connection strings and SSL configuration must be updated in all environments
- Knex pool configuration must account for connection failover behavior; reconnect timeout must be set shorter than the accepted RTO
- DR runbook must document the exact failover test procedure for the chosen option
- `infra/docker-compose.prototype.yml` remains for local dev only; staging and production use the chosen HA solution
- **If PATH 2 is selected:** GAP-003 acceptance criteria, Milestone 1.3 deliverable 4.2, and PHASE_1_PLANNING_BRIEF.md §5 exit criterion 5.3 must be updated to read `RTO ≤ 120 seconds` before Milestone 1.3 gate review

---

## ADR-004 — Audit Sink / SIEM Export Strategy

**Status:** PENDING  
**Gap Reference:** GAP-006 (Observability), security-guardrails.md §Audit Logging  
**Decision Required By:** Phase 1 Milestone 2 start  

### Context

Audit logs are currently written to the PostgreSQL `audit_logs` table with a locally append-only trigger. An `httpsExporter` stub exists in the audit outbox architecture but is not connected to a real sink. The system's security guardrails explicitly state that the audit system is **not** enterprise-grade until logs are replicated to an external append-only service. For compliance and SIEM integration, events must be forwarded reliably.

### Options

#### Option A: AWS CloudWatch Logs

| Attribute | Assessment |
| :--- | :--- |
| Integration | Via AWS SDK in outbox consumer; standard in AWS environments |
| Append-only | CloudWatch log groups are write-once with retention policies |
| Cost | Pay-per-GB; inexpensive at current scale |
| SIEM integration | AWS Security Hub / GuardDuty integration available |

#### Option B: Splunk HEC (HTTP Event Collector)

| Attribute | Assessment |
| :--- | :--- |
| Integration | HTTP POST to HEC endpoint; straightforward |
| Append-only | Indexed events are immutable in Splunk |
| Cost | Splunk Enterprise or Cloud licensing required |
| SIEM integration | Native SIEM capabilities |

#### Option C: Datadog Log Management

| Attribute | Assessment |
| :--- | :--- |
| Integration | HTTP ingestion API + structured JSON |
| Append-only | Ingested logs immutable |
| Cost | Per-host or per-GB pricing |
| SIEM integration | Datadog SIEM (CSPM) available |

#### Option D: Generic HTTPS WORM Endpoint (Existing Stub)

| Attribute | Assessment |
| :--- | :--- |
| Integration | Existing `httpsExporter` stub activated with endpoint URL |
| Append-only | Depends on endpoint implementation |
| Cost | Depends on target service |
| SIEM integration | Any HTTPS-capable sink |

### Decision

**[PENDING — must be signed off by Engineering Lead and Security Lead]**

Recommended direction: Activate the existing `httpsExporter` stub pointed at **Option A (AWS CloudWatch)** for minimum viable compliance in staging. SIEM integration (Option B or C) to be defined as a Phase 2 objective if not already available in the organization's stack.

**Decision Rationale (to be completed on sign-off):**  
_[Record sink target, delivery guarantee, dead-letter policy, and sign-off date here]_

### Consequences

- `httpsExporter` activation requires endpoint URL in staging environment secrets
- Outbox consumer must handle HTTP 5xx from sink gracefully (retry + dead-letter)
- Audit delivery SLA defined: events appear in external sink within 30 seconds
- Alert configured when dead-letter queue is non-empty

---

## ADR-005 — Environment Promotion Model

**Status:** PENDING  
**Gap Reference:** GAP-008 (Deployment Hardening)  
**Decision Required By:** Phase 1 Milestone 1 start  

### Context

Currently there are two logical environments (demo and production) separated by `BUILD_PROFILE`, with no formal promotion model. Environments are stood up manually via Docker Compose. There is no staging environment distinct from production. No promotion gates, deployment checklists, or rollback procedures are formalized.

### Options

#### Option A: Three-Environment Linear Promotion (dev → staging → production)

| Attribute | Assessment |
| :--- | :--- |
| Environments | `dev` (local), `staging` (cloud), `production` (cloud) |
| Promotion trigger | Manual gate: PR approval + CI green + checklist sign-off |
| Rollback | Tag-based; redeploy prior image |
| Complexity | Moderate |

**Recommended for:** Most teams starting enterprise readiness; well-understood model.

#### Option B: GitOps with ArgoCD / Flux

| Attribute | Assessment |
| :--- | :--- |
| Environments | Git branch or path per environment; auto-synced |
| Promotion trigger | PR merge to environment branch / path |
| Rollback | Git revert; ArgoCD sync |
| Complexity | High — requires GitOps tooling and cluster operator |

**Recommended for:** Teams with Kubernetes infrastructure and GitOps experience.

### Decision

**[PENDING — must be signed off by Engineering Lead and Infrastructure Lead]**

Recommended direction: **Option A (Three-environment linear promotion)** for Phase 1. GitOps can be adopted in Phase 2 if Kubernetes is standardized.

**Decision Rationale (to be completed on sign-off):**  
_[Record environment URLs, promotion gate procedure, rollback policy, and sign-off date here]_

### Consequences

- Staging environment must be provisioned in cloud (see GAP-003 database HA)
- `.env.staging.example` exists and must be completed with staging-specific values
- Container image tagged `{service}-{profile}:{version}-{sha}` per RELEASE_IDENTITY.md
- Promotion checklist documented in PHASE_1_RELEASE_PLAN.md

---

## ADR-006 — CI/CD Quality Gates

**Status:** PENDING  
**Gap Reference:** GAP-004 (CI/CD Enforcement)  
**Decision Required By:** Phase 1 Milestone 1 start  

### Context

The existing `.github/workflows` configuration runs build and test on PR, but does not enforce the full quality gate required for enterprise-grade merge control. The following checks are missing or inconsistent: safety guardrails scan, npm audit threshold enforcement, container image build, security exception expiry check, and branch protection bypass governance.

### Proposed Quality Gate Sequence

All steps run on **every PR to `main` or `develop`**. All steps are required status checks — any failure blocks merge.

| Step | Tool / Command | Failure Action |
| :--- | :--- | :--- |
| 1. Install dependencies | `npm ci` | Block: environment invalid |
| 2. Typecheck | `npm run typecheck` | Block: type safety regression |
| 3. Unit tests | `npm test` | Block: test regression |
| 4. Safety guardrails scan | `node scripts/verify_safety_guardrails.js` | Block: safety control regression |
| 5. npm audit threshold | `npm audit --audit-level=high` | Block: unexcepted new HIGH+ vulnerability |
| 6. Security exception expiry | Custom script checks `security-exceptions.yaml` dates | Block: expired exception not reviewed |
| 7. Static production build | `npm run build` (Vite production) | Block: production build broken |
| 8. Container image build | `docker buildx build ...` | Block: Dockerfile regression |
| 9. SBOM generation | `cyclonedx-npm` or `syft` | Warn: artifact uploaded to PR |

### Decision

**[PENDING — must be signed off by Engineering Lead and DevOps Lead]**

Recommended direction: Adopt the proposed 9-step gate. Steps 1–8 are blocking; step 9 is non-blocking warning with artifact upload. All steps implemented as a single GitHub Actions workflow file.

**Decision Rationale (to be completed on sign-off):**  
_[Confirm step list, blocking vs. warning classification, and sign-off date here]_

### Consequences

- `.github/workflows/ci.yml` must be updated with all 9 steps
- Branch protection must list the CI workflow job as a required status check
- Admin bypass must be documented as an exceptional procedure requiring second approver
- Security exception expiry script authored and committed to `scripts/`

---

## ADR Sign-Off Tracker

| ADR | Title | Status | Decision Date | Signed Off By |
| :--- | :--- | :--- | :--- | :--- |
| ADR-001 | Message Queue Choice | PENDING | — | — |
| ADR-002 | Production IDP Integration | PENDING | — | — |
| ADR-003 | PostgreSQL HA Approach | PENDING | — | — |
| ADR-004 | Audit Sink / SIEM Strategy | PENDING | — | — |
| ADR-005 | Environment Promotion Model | PENDING | — | — |
| ADR-006 | CI/CD Quality Gates | PENDING | — | — |

> [!CAUTION]
> Implementation of any component associated with an ADR must not begin until that ADR's Status is changed from PENDING to ACCEPTED and a sign-off date is recorded. Premature implementation without ADR sign-off is a Phase 1 process violation.
