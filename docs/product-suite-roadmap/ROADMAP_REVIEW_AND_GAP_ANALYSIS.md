# Roadmap Review and Gap Analysis

This document provides a thorough audit of the **Q-Sight Command Center Product Suite Roadmap Draft v1** against the Prompt 23 and Prompt 24 requirements. It identifies gaps, evaluates safety and execution risks, traces requirements, and outlines corrections.

---

## 1. Roadmap Review Summary

The **Q-Sight Command Center Roadmap Draft v1** establishes a reasonable strategic framework for transitioning Q-Sight from a pilot-frozen staging environment to an enterprise-ready product. However, it operates at too high a level to be considered "sprint-ready" or "build-ready." 

While the strategic phases align with product maturation, many technical epics are described in single-sentence summaries. Significant enterprise architectural concerns—such as auth-handshakes, database schema migrations, and high-availability backups—are glossed over, creating delivery risks. This review closes those gaps by detailing the requirements, establishing a rigid traceability framework, and expanding the backlog.

---

## 2. Part A: Audit Roadmap Against Prompt 23 Requirements

The table below traces the original requirements from the product suite design against the coverage in the roadmap draft.

| Prompt 23 Requirement | Covered? | Current File | Quality | Gap | Required Action |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Tenant/Org Isolation Model** | Partially | `PHASED_ROADMAP.md` | **Thin** | Lacks database/API tenancy strategy (logical vs. physical isolation). | Define tenancy strategy (shared database with tenant discriminator columns and tenant-aware middleware). |
| **Secrets Handling** | No | None | **Missing** | No mention of vault integration or secret rotation. | Add SEC-07 and specify Azure Key Vault or AWS Secrets Manager. |
| **Audit Immutability/Export** | Partially | `TARGET_ARCHITECTURE.md` | **Adequate** | WORM storage mentioned but lacks export mechanism, formats, and API scopes. | Add SEC-10 and PROD-10 to define JSON/CSV signing and external syslog forwarding. |
| **Backup/Restore** | Partially | `PHASED_ROADMAP.md` | **Thin** | Lacks technical strategy, scheduling, or verification runbook. | Add PLAT-07 and specify DB dump schedules and bucket replication. |
| **Migration Strategy** | No | None | **Missing** | No execution plan for zero-downtime migrations or data seeding. | Add PLAT-06 and define transactional migrations using the existing Fastify runner. |
| **Deployment Rollback** | No | None | **Missing** | No rollback execution paths for containers or database schemas. | Add PLAT-08 and define the rollback runbook (data-safe column deprecation and tag reversion). |
| **Source Adapter Framework** | Partially | `PRODUCT_SUITE_DEFINITION.md` | **Thin** | Missing interface definitions and lifecycle hooks for telemetry feeds. | Add DATA-01 and define TypeScript contract interfaces for ingestors. |
| **Last-Known-Good Cache** | Partially | `PHASED_ROADMAP.md` | **Thin** | Missing fallback data strategies when third-party APIs fail. | Add DATA-02 and define the local cache/database fallback lookup logic. |
| **Data Quality Scoring** | No | None | **Missing** | Missing data validation criteria (latency, freshness, and parsing integrity). | Add DATA-04 and define quality parameters and UI health badges. |
| **Keyboard/Accessibility Pass** | No | None | **Missing** | No accessibility standards (WCAG 2.1) or keyboard navigation rules. | Add UX-05 and define tab indexing, ARIA labels, and focus trap requirements. |
| **Responsive QA Automation** | No | None | **Missing** | Missing test strategies for mobile/tablet screen widths. | Add UX-06 and define Playwright viewport testing in CI. |
| **Customer Onboarding Package** | Partially | `COMMERCIAL_READINESS_PACK.md`| **Thin** | Generic list; lacks step-by-step requirements or prerequisites. | Add COM-05 and define the onboarding milestone checklist. |
| **Support/L1 Runbook** | No | None | **Missing** | Lacks triage steps for API downtime, database locks, or worker failures. | Add OBS-07 and detail common incident response procedures. |
| **Release Gate Checklist** | Partially | `RELEASE_PLAN.md` | **Thin** | Checklist is too high-level; lacks specific numeric metrics or security exit gates. | Expand release gates in `RELEASE_PLAN.md` with explicit, verifiable checklist items. |
| **Alert Workflow Acceptance** | Partially | `PRODUCT_SUITE_DEFINITION.md` | **Thin** | Lacks server-side database schema requirements or assignment states. | Define database schema, assignment APIs, and SLA triggers. |
| **Admin/Config Acceptance** | Partially | `PRODUCT_SUITE_DEFINITION.md` | **Thin** | Missing API endpoint specs and RBAC rules for site and asset CRUD operations. | Define endpoint validation and Supervisor vs. Admin CRUD boundaries. |
| **Azure AD Sequence** | No | `EPIC_BACKLOG.md` | **Missing** | High-level epic only. Lacks OIDC flow details, token checks, and key rotations. | Add SEC-01 detailing JWT validation middleware and token verification logic. |
| **WebSocket Auth Sequence** | Partially | `CURRENT_STATE_ASSESSMENT.md` | **Thin** | Lacks explanation of connection handshake auth (tickets vs. queries). | Add SEC-04 detailing the one-time ticket auth mechanism. |
| **CI/CD Acceptance Criteria** | Partially | `EPIC_BACKLOG.md` | **Thin** | Missing build rules, cache strategies, or test execution parameters. | Add PLAT-02 and define strict validation gates. |
| **Dependency Upgrade Plan** | Partially | `CURRENT_STATE_ASSESSMENT.md` | **Thin** | Lacks planning for hoisted npm workspaces or CVE remediation strategy. | Add PLAT-03 detailing vulnerability resolution and esbuild upgrades. |

---

## 3. Gaps Found

1. **Authentication Architecture**: The roadmap draft jumps directly to "Integrate Azure AD" without specifying how the backend Fastify server validates tokens (JWKS URI polling, signature verification, and audience matching) or how the frontend stores and refreshes tokens.
2. **WebSocket Handshake Security**: The current implementation simulates WebSocket authentication via query string parameters (`?role=operator`). Standard WebSockets do not support custom HTTP headers in the browser. The roadmap lacked a secure transition mechanism, such as a **Single-Use Pre-Authentication Ticket** REST endpoint.
3. **Database Tenant Isolation**: The roadmap mentions multi-tenancy but fails to specify the isolation model. Without this, developers might implement insecure query scoping that leaks cross-tenant data.
4. **DevOps & Release Controls**: No definition of "release readiness" or container tagging strategy. The current compose file uses mutable local builds. Production requires immutable registry tags.

---

## 4. Missing Epics
* **Tenancy Enforcement Middleware**: An epic ensuring every database query is bound to the tenant ID of the authenticated user session.
* **Audit Export API & Signing**: A process to export audit logs as cryptographically signed JSON packages to prevent tampering.
* **Ingestion Rate Limit Tracking**: Code to monitor upstream API limits dynamically and prevent vendor bans.
* **Staging Rollback Scripting**: Scripts to revert database migrations safely without losing core user data.

---

## 5. Thin Epics That Need Expansion
* **SEC-01 (Azure AD)**: Must expand into sub-components representing JWT verification, JWKS key loading, and redirect security.
* **PROD-02 (Persistent Alerts)**: Needs explicit database schema design, indexing, and REST endpoint security guidelines.
* **OBS-01 (Structured Logging)**: Needs to define standard log formats (JSON, ECS) and logging levels (info, warn, error).

---

## 6. Unrealistic Assumptions
* **Time-to-Production Auth**: The draft assumes Azure AD integration can be executed alongside REST/WS auth in a single sprint. Setting up tenant registration, redirect URLs, client secrets, and token rotation usually requires coordination with enterprise IT, which takes weeks.
* **Immediate CI/CD**: Building a full CI/CD pipeline targeting remote staging is scheduled early. However, without first standardizing the local validation suite and fixing hoisted dependency issues, the CI runner will fail repeatedly due to environmental drift.

---

## 7. Safety Risks
* **Surveillance Scope Creep**: The roadmap must ensure no team member accidentally attempts to stream RTSP/HLS video or implement face detection. 
* **Redaction Bypass**: A lack of server-side data redaction testing could allow operators to read exact coordinates via direct REST API calls, bypassing the frontend UI redaction.

---

## 8. Execution Risks
* **Vulnerability Debt**: Upgrading dependencies in an npm workspace with hoisted packages can easily break Vite builds or Fastify router typings.
* **Database Deadlocks**: Introduction of database-driven alerts during high-frequency ingestion runs could exhaust connection pools if not throttled or queued.

---

## 9. Proposed Corrections
* **Select Phase 0 Stabilization First**: Clean up the dependency structure, Git-readiness, and local validation scripts first. This provides a baseline so future commits can be validated before introducing complex auth libraries.
* **Formalize a 66-Epic Backlog**: Expand the backlog into specific, actionable tickets with clear dependencies, effort metrics, and persona tags.
* **Separate Mock vs. Production Capabilities**: Clearly label mock features and design patterns in code comments and documents.

---

## 10. Final Recommendation

**Proceed with Phase 0 — Baseline Stabilization Sprint.** 

Executing security or admin console sprints first is highly risky without a standardized CI pipeline, clear versioning discipline, and a bulletproof regression verification script. Phase 0 secures the codebase, fixes hoisted dependency warnings, integrates the compliance safety scanner directly into the local verification suite, and prepares the repository for multi-developer workflows.

*Approved by:* **Antigravity Product Strategy Lead**
