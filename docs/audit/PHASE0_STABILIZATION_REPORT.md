# Sprint Report — Phase 0 Baseline Stabilization

This document summarizes the outcomes of the Phase 0 Baseline Stabilization Sprint. It marks the formal establishment of the staging baseline release v1.1.

---

## 1. Sprint Objective
The primary objective was to establish repository controls, versioning discipline, local CI verification, and safe dependency auditing to establish a clean, repeatable development baseline. This baseline serves as the secure staging platform before introducing security features (Azure AD, JWT) or product console changes.

---

## 2. Scope Summary

### Scope Completed:
*   **Release Versioning & Git Discipline**: Created a contributor guide (`docs/CONTRIBUTING.md`) detailing conventional commit rules, branching models, and local CI verification boundaries. Normalized monorepo line endings via `.gitattributes`.
*   **Standardized Local CI Verification**: Built a PowerShell script (`scripts/ci_verify.ps1`) executing builds, typechecks, static validation, WebSocket integrity, and safety scans. Exposed these as npm commands: `verify:ci` and `verify:ci:docker`.
*   **Dependency Audit & Safe Upgrade**: Addressed vulnerability `GHSA-67mh-4wv8-2f99` by overriding nested `esbuild` dependency versions to `v0.25.12`. Documented deferred high-severity transitive dependencies in `docs/audit/PHASE0_DEPENDENCY_AUDIT.md`.
*   **Docker Semantic Version Tagging**: Added `scripts/build_docker.ps1` to build and tag prototype API and Web images with the version specified in `package.json` (`0.1.0`), preventing mutable `latest` tags.
*   **Environment Cleanup**: Standardized all `.env.*` templates with conservative default polling intervals (120s aviation, 300s seismic, 86400s satellite), clean mock/live isolation flags, and obvious secrets placeholders.

### Excluded Capabilities (Preserved Boundaries):
*   No Azure AD / Entra ID or production JWT routing.
*   No WebSocket authentication ticketing.
*   No server-side alert database schema migration.
*   No camera stream rendering (RTSP, HLS, WebRTC) or facial recognition.
*   No UI feature fixes for BUG-001 or BUG-002 (carried forward).

---

## 3. Files Created and Modified

### Created Files:
*   [CONTRIBUTING.md](file:///d:/Q-Sight%20Command%20Center/docs/CONTRIBUTING.md)
*   [.gitattributes](file:///d:/Q-Sight%20Command%20Center/.gitattributes)
*   [scripts/ci_verify.ps1](file:///d:/Q-Sight%20Command%20Center/scripts/ci_verify.ps1)
*   [scripts/build_docker.ps1](file:///d:/Q-Sight%20Command%20Center/scripts/build_docker.ps1)
*   [docs/audit/PHASE0_DEPENDENCY_AUDIT.md](file:///d:/Q-Sight%20Command%20Center/docs/audit/PHASE0_DEPENDENCY_AUDIT.md)
*   [docs/audit/v1.1-RELEASE_EVIDENCE.md](file:///d:/Q-Sight%20Command%20Center/docs/audit/v1.1-RELEASE_EVIDENCE.md)
*   [docs/audit/PHASE0_STABILIZATION_REPORT.md](file:///d:/Q-Sight%20Command%20Center/docs/audit/PHASE0_STABILIZATION_REPORT.md)

### Modified Files:
*   [package.json](file:///d:/Q-Sight%20Command%20Center/package.json)
*   [apps/web/package.json](file:///d:/Q-Sight%20Command%20Center/apps/web/package.json)
*   [package-lock.json](file:///d:/Q-Sight%20Command%20Center/package-lock.json)
*   [.env.example](file:///d:/Q-Sight%20Command%20Center/.env.example)
*   [.env.live.example](file:///d:/Q-Sight%20Command%20Center/.env.live.example)
*   [.env.demo.example](file:///d:/Q-Sight%20Command%20Center/.env.demo.example)
*   [.env.staging.example](file:///d:/Q-Sight%20Command%20Center/.env.staging.example)
*   [walkthrough.md](file:///d:/Q-Sight%20Command%20Center/walkthrough.md)
*   [task.md](file:///d:/Q-Sight%20Command%20Center/task.md)
*   [docs/audit/COMMAND_EVIDENCE_LOG.md](file:///d:/Q-Sight%20Command%20Center/docs/audit/COMMAND_EVIDENCE_LOG.md)

---

## 4. Audit & Verification Outcomes

### Dependency Audit
*   **Outcome**: The moderate vulnerability in `esbuild` has been resolved by directly targeting `esbuild` as a devDependency in the web workspace and declaring root overrides. Audited vulnerability count is reduced to 6 high-severity deferred items.
*   **Vite/fast-uri Vulnerabilities**: Documented and deferred. Upgrade paths represent breaking changes (Fastify v5 / Vite v8) that are deferred to Phase 1.

### CI Verification
*   `npm run verify:ci`: **PASSED (100% success)**.
*   `npm run verify:ci:docker`: **PASSED (100% success)**.
*   `node scripts/verify_safety_guardrails.js`: **PASSED (0 violations)**.

### Docker Version Tagging
*   `scripts/build_docker.ps1` correctly reads the version `0.1.0` from `package.json` and compiles version-tagged staging images: `q-sight-api:0.1.0` and `q-sight-web:0.1.0`. Builds completed successfully.

### Environment Clean-up
*   Intervals verified to use conservative polling values (120s/300s/86400s) across all template files. obtrusive variables, credentials placeholders, and mock configs are explicitly commented.

---

## 5. Known Issues Carried Forward
The following low-severity UI bugs from E2E rehearsal are carried forward as non-blocking issues:
*   **BUG-001**: "CHECKLIST" button toggles state in header, but the Checklist sliding drawer is not rendered.
*   **BUG-002**: Activity/Timeline rail panel contains a WIP placeholder card.

---

## 6. Rollback Instructions
To restore the repository state to v1.0:
1.  Revert code changes in `package.json`, `apps/web/package.json`, and `.env.*` files.
2.  Restore the lockfile backup: `powershell -Command "Copy-Item package-lock.json.bak package-lock.json -Force"`.
3.  Run `npm.cmd install` to restore old dependencies.
4.  Remove created files (`docs/CONTRIBUTING.md`, `.gitattributes`, `scripts/ci_verify.ps1`, `scripts/build_docker.ps1`).

---

## 7. Next Recommended Prompt
“Prompt 26 — Security Foundation Architecture Spike for Azure AD, JWT, WebSocket Auth, and Tenant Isolation.”

---

## 8. Final Status Verdict
**Phase 0 Stabilization Complete — Staging Baseline v1.1 Frozen.**
