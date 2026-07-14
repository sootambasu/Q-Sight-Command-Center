# PHASE 1 ADR WORKSHOP FACILITATOR SCRIPT
## Q-Sight Command Center

**Document ID:** PHASE_1_ADR_WORKSHOP_FACILITATOR_SCRIPT  
**Status:** ACTIVE — FOR FACILITATOR USE  
**Date:** 2026-07-14  

---

> [!CAUTION]
> **IMPORTANT: IMPLEMENTATION IS NOT AUTHORIZED.**
> This workshop is for planning and architectural decision-making only. No coding, no feature branches, and no deployment actions may be initiated as a result of this meeting until the formal `PHASE_1_SIGN_OFF_RECORD.md` is fully completed and signed.

---

## 1. Opening Statement (To be read aloud by the Facilitator)

"Welcome, everyone, to the Q-Sight Command Center Phase 1 Architecture Decision Record (ADR) Workshop. 

Our goal today is to finalize the core architectural decisions required for the Phase 1 Enterprise-Readiness Hardening phase. We have 6 pending ADRs that must be decided and signed off before we can transition out of planning. 

I must state clearly at the outset: **Phase 1 implementation is not yet authorized.** Today's session is strictly a decision-making and planning gate. No development work or codebase changes are authorized to start today.

We will proceed through the agenda, starting with our database high-availability path, and conclude with the post-workshop documentation cleanup requirements."

---

## 2. Decision Rules

- **Consensus Goal:** We seek unanimous agreement among the required attendees for each decision.
- **Tie-Breaker:** If consensus cannot be reached within the allotted time, the **Engineering Lead** holds final decision authority, subject to co-sign requirements.
- **Binary Choices:** For ADR-003, we must choose either PATH 1 or PATH 2. No "undecided" or hybrid status is acceptable.
- **Recording:** Decisions are captured in `PHASE_1_ADR_DECISION_SUMMARY_TEMPLATE.md` during the call.

---

## 3. Required Attendees

- **Engineering Lead** (Overall architecture & delivery owner)
- **Security Lead** (Identity, audit logging, & security scanning owner)
- **Infrastructure Lead** (Database HA, broker, & staging environment owner)
- **DevOps Lead** (CI/CD pipelines & release gate owner)

---

## 4. ADR-003 Decision Flow: PostgreSQL HA & RTO (Time: 30 mins)

- **Facilitator Prompt:** "Let's resolve ADR-003. We have a documented conflict between our target RTO of ≤ 30 seconds and the failover times of managed cloud database services (RDS/CloudSQL), which take 60–120 seconds."
- **The Choice:**
  - **PATH 1 (Strict RTO):** Select Option B (Patroni + etcd, self-hosted). Achieves RTO ≤ 30s but introduces high operational complexity.
  - **PATH 2 (Managed DB):** Select Option A (AWS RDS Multi-AZ) or Option C (CloudSQL). Requires us to relax our RTO target to ≤ 120s.
- **Recommended Option:** PATH 2 (AWS RDS or CloudSQL HA) with a relaxed RTO target of ≤ 120s, due to the high operational overhead of self-hosting Patroni.
- **Discussion Points:**
  1. Do we have the team bandwidth to support etcd and Patroni operations?
  2. Is an RTO of ≤ 120s acceptable to the business for staging and production failovers?
- **Risks Affected:** RISK-011 (RTO target compatibility) and RISK-004 (WebSocket reconnection).
- **Required Sign-Offs:** Engineering Lead & Infrastructure Lead.

---

## 5. ADR-001 Decision Flow: Message Queue Choice (Time: 20 mins)

- **Facilitator Prompt:** "Next is ADR-001. We need to decouple our real-time telemetry workers from direct database writes to prevent event loop lag."
- **Options:** 
  - Option A: RabbitMQ (AMQP broker)
  - Option B: Apache Kafka (Event streaming platform)
  - Option C: Redis Streams (Lightweight in-memory streams)
- **Recommended Option:** Option A (RabbitMQ) for its robust queue semantics, developer familiarity, and ease of management.
- **Discussion Points:**
  1. Do we need event replay capabilities (points to Kafka), or simple FIFO queueing and processing (points to RabbitMQ/Redis)?
  2. What is our hosting model (self-managed container vs. cloud SaaS)?
- **Risks Affected:** RISK-003 (telemetry pipeline data loss) and RISK-009 (event loop lag).
- **Required Sign-Offs:** Engineering Lead & Infrastructure Lead.

---

## 6. ADR-002 Decision Flow: Production IDP/OIDC Provider (Time: 20 mins)

- **Facilitator Prompt:** "Moving to ADR-002. We must replace our development-only header simulation with production-ready OIDC and JWKS token verification."
- **Options:** 
  - Option A: Auth0 (SaaS IDP)
  - Option B: Keycloak (Self-hosted IDP)
  - Option C: Okta (SaaS IDP)
- **Recommended Option:** Option A (Auth0) for low setup complexity, or Option B (Keycloak) if data residency/on-premises deployment is required.
- **Discussion Points:**
  1. Can we accept a SaaS IDP dependency (Auth0/Okta), or does compliance dictate a self-hosted instance (Keycloak)?
  2. How will we map our roles (Operator, Supervisor, Auditor, Admin) to token claims?
- **Risks Affected:** RISK-002 (OIDC integration complexity).
- **Required Sign-Offs:** Engineering Lead & Security Lead.

---

## 7. ADR-005 Decision Flow: Environment Promotion Model (Time: 15 mins)

- **Facilitator Prompt:** "ADR-005. We must define how code and infrastructure are promoted through environments."
- **Options:**
  - Option A: Linear 3-tier (Dev → Staging → Production) with manual release gates.
  - Option B: GitOps-driven continuous promotion.
- **Recommended Option:** Option A (Linear 3-tier) to align with our current release process and manual safety verification workflows.
- **Discussion Points:**
  1. Are our staging and production deployment steps fully automated?
  2. How do we enforce manual sign-offs in our deployment pipeline?
- **Risks Affected:** RISK-007 (demo/production boundary leakage).
- **Required Sign-Offs:** Engineering Lead & Infrastructure Lead.

---

## 8. ADR-006 Decision Flow: CI/CD Quality Gates (Time: 15 mins)

- **Facilitator Prompt:** "ADR-006. We must define the 9-step quality gate that runs on every pull request."
- **Options:**
  - Option A: Strict blocking (any check failure prevents merging).
  - Option B: Warning-only for specific static/dependency scans.
- **Recommended Option:** Option A (Strict blocking) to guarantee compliance with security guardrails.
- **Discussion Points:**
  1. Will the security scanning step (`npm audit`) cause excessive PR build times or developer friction?
  2. What is our emergency bypass procedure if a quality gate is blocked?
- **Risks Affected:** RISK-005 (CI/CD PR friction) and RISK-006 (security exception expiry).
- **Required Sign-Offs:** Engineering Lead & DevOps Lead.

---

## 9. ADR-004 Decision Flow: Audit Sink / SIEM Strategy (Time: 10 mins)

- **Facilitator Prompt:** "Finally, ADR-004. We must configure our audit outbox to export events to a central, append-only security sink."
- **Options:** 
  - Option A: AWS CloudWatch Logs
  - Option B: Splunk / HTTP Event Collector
  - Option C: Datadog
- **Recommended Option:** Option A (CloudWatch) or Option B (Splunk), depending on the organization's existing centralized SIEM.
- **Discussion Points:**
  1. What logging and SIEM tools are already provisioned at the organizational level?
  2. How will we handle network failure/retry logic in the outbox exporter?
- **Risks Affected:** RISK-010 (audit sink connectivity).
- **Required Sign-Offs:** Security Lead & Infrastructure Lead.

---

## 10. How to Record Decisions

1. During the workshop, the facilitator will write the chosen option, rationale, and date for each ADR into `PHASE_1_ADR_DECISION_SUMMARY_TEMPLATE.md`.
2. Ensure the names of the sign-off owners are noted for each item.
3. At the end of the meeting, copy the contents of the completed summary template into the corresponding sections of `PHASE_1_ARCHITECTURE_DECISION_RECORDS.md` and `PHASE_1_SIGN_OFF_RECORD.md`.
4. **Sign-Off Update Checklist Rule:** Record ADR decisions as **SIGNED OFF** in the checklist, but keep `IMPLEMENTATION AUTHORIZED` as **NO** after the ADR decisions are finalized. Record implementation authorization separately as a subsequent step. Do not set `IMPLEMENTATION AUTHORIZED` to `YES` unless all kickoff blockers are closed and all authorization gates are fully met.

---

## 11. How to Handle Unresolved Decisions

- If any of the 6 ADRs cannot be decided today:
  - Document the reason for deferral in the "Open Sign-Off Blockers" section of `PHASE_1_SIGN_OFF_RECORD.md`.
  - Assign a single owner and target date to resolve the blocker.
  - **Do NOT authorize implementation.** The "Implementation Authorized" field in the sign-off record must remain **NO** until the blocker is resolved.

---

## 12. Post-Workshop Documentation Cleanup Requirement

Directly following the workshop, a documentation-only PR must be prepared to resolve the inconsistencies identified in `PHASE_1_DOCUMENTATION_CONSISTENCY_PREFLIGHT.md`:
1. Update `docs/database-schema.md` to remove `stream_url` and `verification_hash`, and rename `authorized_cameras` to `sensor_registry`.
2. Update all runbooks and READMEs to enforce Node.js 22.
3. Add clear environment caveats regarding mock fallbacks and simulated headers in production.

---

## 13. Implementation Authorization Gates (Mandatory Verification)

ADR decisions alone do **NOT** authorize implementation. The `IMPLEMENTATION AUTHORIZED` field in `PHASE_1_SIGN_OFF_RECORD.md` may be set to **`YES`** only after all of the following gates are completed in full:

1. **ADR-001 through ADR-006 Signed Off:** All decisions populated, dated, and co-signed.
2. **Docs Cleanup PR Merged:** The preflight documentation consistency cleanup PR is completed and merged into `develop`.
3. **BLOCKER-007 Staging Access Verified:** Access to the staging environment (database HA, message broker, IDP test tenant) is verified or formally waived in writing by the Engineering Lead and Infrastructure Lead.
4. **Kickoff Checklist Complete:** All items in `PHASE_1_KICKOFF_CHECKLIST.md` are fully checked off.
5. **Formal Activation Sign-off:** The Engineering Lead explicitly authorizes activation of `PHASE_1_EXECUTION_PROMPT.md` by signing the kickoff certification.

Until all five criteria are met, implementation remains strictly **UNAUTHORIZED** and `IMPLEMENTATION AUTHORIZED: NO` must be enforced.

---

## 14. Concluding Facilitator Statement

"This concludes our ADR review. Thank you for your input. I remind the team that ADR decisions alone do **not** authorize implementation. **No implementation work may begin** until the documentation cleanup PR is merged, staging environment access is verified, the kickoff checklist is fully completed, and the final `PHASE_1_SIGN_OFF_RECORD.md` is updated to 'Implementation Authorized: YES'."
