# Phase 0 Rescue Open Risks Report

This document registers any outstanding risks remaining after the rescue stabilization sprint.

## 1. Registered Risks

### 1.1. Manual GitHub Governance Required
* **Description:** Remote repository branch protection settings cannot be fully applied or verified programmatically. Manual action is required by the repository administrator to restrict direct push to `main` and enforce required PR approval and status check gates.
* **Severity:** **HIGH**
* **Mitigation:** Owner must follow the steps documented in `docs/audit/POST_MERGE_GITHUB_GOVERNANCE_AUDIT.md`.

---

### 1.2. Weak Development Token Issuer/Audience Check
* **Description:** Symmetric HS256 JWT tokens verify with a fallback `config.jwtSecret` only. In production, a secure OIDC/JWKS provider (e.g. Google Cloud Identity or Okta) must be configured via `OIDC_JWKS_URL` to prevent spoofing with weak local secrets.
* **Severity:** **MEDIUM**
* **Mitigation:** Production deployment must define `OIDC_JWKS_URL`, `OIDC_ISSUER_URL`, and `OIDC_AUDIENCE` variables to bypass symmetric secret verification.

---

### 1.3. Lack of Comprehensive Integration Test Coverage
* **Description:** The project currently only contains unit tests for the audit outbox worker (`outboxWorker.test.ts`) and static verifiers. There is no automated end-to-end test framework in CI for telemetry ingestion or real-time websocket flows under load.
* **Severity:** **MEDIUM**
* **Mitigation:** Plan end-to-end integration tests as part of the Phase 1 hardening schedule.
