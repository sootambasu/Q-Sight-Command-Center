# PHASE 1 ADR WORKSHOP AGENDA
## Q-Sight Command Center

**Document ID:** PHASE_1_ADR_WORKSHOP_AGENDA  
**Status:** ACTIVE — FOR WORKSHOP FACILITATION  
**Date:** 2026-07-13  

---

> [!CAUTION]
> Phase 1 implementation remains **UNAUTHORIZED** until all decisions in this workshop are finalized, recorded in the `PHASE_1_SIGN_OFF_RECORD.md`, and the Engineering Lead officially activates the execution prompt. 

---

## Workshop Objectives

1. Make definitive architectural decisions on all 6 Phase 1 ADRs.
2. Resolve BLOCKER-001 through BLOCKER-006.
3. Establish clear infrastructure procurement requirements to unblock Milestone 1.0.

**Required Attendees:** Engineering Lead, Security Lead, Infrastructure Lead, DevOps Lead.

---

## Agenda / Run of Show

### 1. ADR-003: PostgreSQL High-Availability & RTO (30 min)
*Must be resolved first. Sets the baseline for disaster recovery capabilities.*

- **Decision Needed:** Choose HA architecture and resolve RTO target conflict (PATH 1 vs PATH 2).
- **Options:** 
  - Option A: AWS RDS Multi-AZ (Managed)
  - Option B: Patroni + etcd (Self-hosted)
  - Option C: Google CloudSQL HA (Managed)
- **Recommended Option:** PATH 2 (Option A or C) — Accept managed DB and formally relax RTO to ≤ 120 seconds.
- **Trade-offs:** Self-hosted Patroni meets the rigid ≤ 30s RTO but imposes heavy operational and maintenance overhead. Managed RDS/CloudSQL provides operational simplicity but fails the strict 30s RTO requirement.
- **Dependency Impact:** Dictates the DR drill execution criteria in Milestone 1.3 and the staging provisioning requirements in Milestone 1.0.
- **Cost/Complexity Impact:** High complexity for Patroni. High cost for Managed.
- **Risks Affected:** Closes RISK-011 upon decision; impacts RISK-004 (WebSocket reconnect behavior).
- **Sign-off Owner:** Engineering Lead, Infrastructure Lead.

### 2. ADR-001: Message Queue Architecture (20 min)

- **Decision Needed:** Select the message broker technology for telemetry decoupling.
- **Options:** RabbitMQ, Kafka, Redis Streams.
- **Recommended Option:** RabbitMQ (well-understood AMQP, good for Node.js workers, easy to host or consume as SaaS).
- **Trade-offs:** Kafka offers extreme scale and replay but is operationally heavy. Redis Streams is lightweight but lacks robust dead-letter queue semantics natively. RabbitMQ provides a balanced AMQP feature set.
- **Dependency Impact:** Unblocks Milestone 1.2 implementation (worker refactor).
- **Cost/Complexity Impact:** Low-to-Medium complexity.
- **Risks Affected:** RISK-003 (data pipeline regression), RISK-009 (event loop bottleneck).
- **Sign-off Owner:** Engineering Lead, Infrastructure Lead.

### 3. ADR-002: Production IDP / OIDC Provider (20 min)

- **Decision Needed:** Select the Identity Provider for production and staging OIDC integration.
- **Options:** Auth0, Keycloak, Okta.
- **Recommended Option:** Auth0 (for fast staging integration) or Keycloak (if no-SaaS constraint exists).
- **Trade-offs:** Auth0 and Okta provide seamless SaaS experiences but carry recurring licensing costs and external dependencies. Keycloak is open-source and internally hostable but requires dedicated infrastructure and maintenance.
- **Dependency Impact:** Unblocks Milestone 1.1 implementation (JWT verification).
- **Cost/Complexity Impact:** Keycloak (High ops complexity, Low license cost); Auth0/Okta (Low ops complexity, High license cost).
- **Risks Affected:** RISK-002 (OIDC integration complexity).
- **Sign-off Owner:** Engineering Lead, Security Lead.

### 4. ADR-005: Environment Promotion Model (15 min)

- **Decision Needed:** Formalize the environment topology and deployment model.
- **Options:** Linear 3-tier (Dev → Staging → Prod) vs GitOps continuous sync.
- **Recommended Option:** Linear 3-tier model with explicit manual gates for production.
- **Trade-offs:** GitOps offers highly automated consistency but can be complex to retrofit into an existing manual deployment culture. Linear promotion is standard but requires disciplined manual gating.
- **Dependency Impact:** Unblocks environment provisioning and Milestone 1.3 deployment hardening.
- **Cost/Complexity Impact:** Low complexity.
- **Risks Affected:** RISK-007 (demo/prod boundary compromise).
- **Sign-off Owner:** Engineering Lead, Infrastructure Lead.

### 5. ADR-006: CI/CD Quality Gates (15 min)

- **Decision Needed:** Ratify the 9-step CI quality gate and determine blocking enforcement.
- **Options:** 9-step gate (blocking on all failures) vs phased introduction (warning only on some checks).
- **Recommended Option:** Strict blocking on all 9 steps immediately.
- **Trade-offs:** Strict blocking ensures high quality and security but increases PR friction and developer time per PR.
- **Dependency Impact:** Unblocks Milestone 1.0 (CI pipeline updates).
- **Cost/Complexity Impact:** Moderate time cost for developers per PR.
- **Risks Affected:** RISK-005 (excessive PR friction), RISK-006 (security exception block).
- **Sign-off Owner:** Engineering Lead, DevOps Lead.

### 6. ADR-004: Audit Sink / SIEM Strategy (10 min)

- **Decision Needed:** Determine the final destination for the system's audit logs.
- **Options:** AWS CloudWatch, Splunk, Datadog.
- **Recommended Option:** Align with organization's existing primary SIEM tool.
- **Trade-offs:** Integrating with an existing SIEM is standard practice but requires network configuration and IAM alignment.
- **Dependency Impact:** Needed by start of Milestone 1.2 (Audit outbox implementation).
- **Cost/Complexity Impact:** Depends on existing enterprise infrastructure.
- **Risks Affected:** RISK-010 (audit sink connectivity).
- **Sign-off Owner:** Security Lead, Infrastructure Lead.

---

## Post-Workshop Actions

1. Populate `PHASE_1_ADR_DECISION_SUMMARY_TEMPLATE.md`.
2. Update `PHASE_1_ARCHITECTURE_DECISION_RECORDS.md` with final selections.
3. Update `PHASE_1_SIGN_OFF_RECORD.md` with sign-off dates and names.
4. If ADR-003 PATH 2 is chosen, immediately update GAP-003 and Milestone 1.3 docs to reflect RTO ≤ 120 seconds.
5. Kick off infrastructure procurement using `PHASE_1_INFRA_PRECHECKLIST.md`.
