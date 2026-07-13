# First Build Sprint Plan — Phase 0 Stabilization

This document defines the scope, execution path, verification, and rollback plan for the first implementation sprint.

---

## 1. Sprint Details

*   **Sprint Name**: Phase 0 Baseline Stabilization (Sprint 1)
*   **Sprint Objective**: Establish robust repository controls, formalize the local automated validation checks, resolve hoisted package warnings, integrate compliance scanning into the dev workflow, and create a release verification template to enable secure multi-developer feature sprints.
*   **Why This Sprint Comes First**: Developing complex security middleware (Azure AD) or database-driven features (persistent alerts) without Git release boundaries, automated tests, or a unified validation script introduces severe regression risks. Stabilizing the repo first ensures all future code changes are automatically tested and compliant.
*   **Sprint Duration**: 10 Working Days (2 Weeks)

---

## 2. Scope (In-Scope)

*   **PLAT-01 (Git Branching & Release Discipline)**: Create standard `.gitattributes`, configure branch protection guidelines (e.g., restrict direct pushes to `main` and `develop`), and establish a release branching schema.
*   **PLAT-02 (CI Pipeline Scripting)**: Create a localized CI run script (`npm run ci:verify`) that coordinates build compiling, static typechecking, lint checks, and the compliance safety scanner.
*   **PLAT-03 (Dependency Upgrade Planning)**: Address root-level and hoisted package vulnerability reports. Upgrade `esbuild` to clear security warnings. Verify workspace-wide hoist integrity without forced packages breaking Vite configs.
*   **PLAT-04 (Docker Image Versioning)**: Establish standard semantic version tagging scripts for Docker builds, avoiding mutable `latest` tags in staging.
*   **PLAT-05 (Environment Profile Cleanup)**: Consolidate configuration templates (`.env.example`, `.env.live.example`, `.env.staging.example`) to ensure consistent, non-overlapping intervals across all setups.
*   **PLAT-10 (Release Evidence Pack)**: Automate the generation of a release summary file detailing verification commands run and security scan summaries.

---

## 3. Out-of-Scope

The following implementation areas are strictly out-of-scope for this sprint:
*   Integrating Azure AD / Entra ID or creating JWT token validation routes.
*   Establishing WebSocket token handshakes or tickets.
*   Writing persistent alert databases or updating PostGIS schemas.
*   Running active CI runners (e.g., GitHub Actions, GitLab runners) if remote infra is not provisioned. The focus is a "CI-Ready" local script.
*   Integrating SGP4 satellite orbital propagation logic.

---

## 4. Technical Tasks & Backlog Items

### PLAT-01: Repository Branching Discipline
*   **Task**: Add a repository onboarding guide outlining branch conventions:
    *   `main`: Production-ready, mirrors staging tag releases.
    *   `develop`: Integration branch for sprint feature branches.
    *   `feature/*`: Transient branches for epics.
*   **Files**: Create `docs/CONTRIBUTING.md`.

### PLAT-02: Local CI verification Script
*   **Task**: Add a master npm script in root `package.json` that executes:
    1.  Workspace dependency installation check.
    2.  `npm run typecheck` across API, Web, and Workers.
    3.  `npm run build` of all workspace modules.
    4.  `node scripts/verify_safety_guardrails.js` to assert zero safety violations.
*   **Files**: Modify `package.json`, create `scripts/ci_verify.ps1`.

### PLAT-03: Dependency & Hoisting Audit
*   **Task**: Upgrade `esbuild` to version `^0.21.0` or higher to resolve moderate security vulnerabilities. Verify shared Zod validations still compile.
*   **Files**: Modify `package.json`, `packages/shared/package.json`.

### PLAT-04: Docker Version Tagging
*   **Task**: Modify `infra/docker-compose.prototype.yml` or standard build scripts to read app version from the root `package.json` and tag built images accordingly.
*   **Files**: Update `scripts/build_docker.ps1`.

### PLAT-05: Environment Clean-up
*   **Task**: Align environment files to use conservative intervals (120s aircraft, 300s seismic, 86400s satellite) and ensure variables are clearly documented.
*   **Files**: Update `.env.example`, `.env.live.example`, `.env.staging.example`, `.env.demo.example`.

---

## 5. Acceptance Criteria

*   `npm run verify:ci` runs successfully and exits with code `0`.
*   All typecheck and compiler steps across `apps/api`, `apps/web`, `packages/shared`, and `workers` pass without warning.
*   The safety scanner executes and reports zero violations.
*   The `esbuild` package is successfully updated in the lockfile and reports no security vulnerabilities.
*   No features, routes, or database configurations are altered or degraded.

---

## 6. Risks & Mitigations

*   **Risk: Hoisted Dependency Conflicts**: Upgrading nested dependencies within an npm workspace may break local bundler caching or cause import issues.
    *   *Mitigation*: Back up lockfiles before upgrading. Run compilation and typecheck steps on each workspace layer immediately after updating packages.
*   **Risk: Environment Override Errors**: Modifying `.env` templates might cause workers to default to live mode.
    *   *Mitigation*: Verify that mock worker execution scripts explicitly enforce `LIVE_INGESTION_ENABLED=false` via `cross-env`.

---

## 7. Files Likely to Change

*   `package.json` (Root)
*   `package-lock.json`
*   `packages/shared/package.json`
*   `docs/CONTRIBUTING.md`
*   `scripts/ci_verify.ps1`
*   `infra/docker-compose.prototype.yml`
*   `.env.example`
*   `.env.live.example`
*   `.env.staging.example`
*   `.env.demo.example`

---

## 8. Verification & Validation Commands

```powershell
# 1. Clean node modules and perform fresh install
npm cache clean --force
npm install

# 2. Run static verification suite
npm run build
npm run typecheck

# 3. Run safety scanner compliance check
node scripts/verify_safety_guardrails.js

# 4. Run local CI baseline
npm run verify:ci
```

---

## 9. Rollback Plan

If dependency upgrades break workspace packages or builds:
1.  Discard all local modifications via Git: `git checkout -- .` (if git is initialized) or restore the backup of `package.json` and `package-lock.json`.
2.  Run `npm install` to restore the known pilot-frozen states.
3.  Re-run `npm run verify:static` to confirm database connectivity and app health.

---

## 10. Definition of Done (DoD)

A task or epic is considered "Done" only when:
1.  All code changes are fully documented in the release evidence file.
2.  The static verification script succeeds without warnings.
3.  The safety scanner returns 0 issues.
4.  Docker images compile successfully with semantic tags.
5.  No application code or DB schemas were changed.
