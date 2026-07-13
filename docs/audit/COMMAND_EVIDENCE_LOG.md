# Command Evidence Log

This log captures the terminal outputs of all remediation verification steps.

## Static Verification Suite
```bash
npm.cmd run build
npm.cmd run typecheck
npm.cmd run build:web
npm.cmd run verify:static
node scripts/verify_ingestion.js
node scripts/verify_live_sources.js
node scripts/ws_verify.js
node scripts/verify_safety_guardrails.js
npm.cmd run pilot:verify
npm.cmd run pilot:live-check
npm.cmd run safety:verify
```
*Results captured in `docs/audit/test_results_4.txt`.*

## Docker Compose Build and Config
```bash
npm.cmd run pilot:docker:config
npm.cmd run pilot:docker:build
```
*Results captured in `docs/audit/test_results_4.txt`.*

## Live Docker Environment Validation
```bash
docker compose -f infra/docker-compose.prototype.yml up -d postgres api web
docker compose -f infra/docker-compose.prototype.yml ps
Invoke-RestMethod -Uri http://localhost:4000/health
Invoke-RestMethod -Uri http://localhost:4000/ready
Invoke-RestMethod -Uri http://localhost:4000/version
# verified web UI loads at http://localhost:5173
docker compose -f infra/docker-compose.prototype.yml down
```
*Results captured in `docs/audit/test_results_5.txt`.*

## Dependency Audit
```bash
npm.cmd audit --json > docs/audit/audit_full.json
npm.cmd audit --omit=dev --json > docs/audit/audit_prod.json
```
*Results captured in `docs/audit/DEPENDENCY_AUDIT_SUMMARY.md`.*

## Final Pilot Freeze Validation
*Results captured in `docs/audit/FINAL_PILOT_FREEZE_EVIDENCE.md`.*

## Controlled Pilot Rehearsal
*Execution traces and manual checks captured in `docs/audit/PILOT_REHEARSAL_LOG.md`.*

## Pre-Product-Suite UI Hardening Sprint Verification
```bash
npm.cmd run build
npm.cmd run typecheck
npm.cmd run build:web
npm.cmd run verify:static
node scripts/ws_verify.js
node scripts/verify_safety_guardrails.js
npm.cmd run safety:verify
npm.cmd run pilot:docker:build
docker compose -f infra/docker-compose.prototype.yml up -d postgres api web
docker compose -f infra/docker-compose.prototype.yml ps
Invoke-RestMethod -Uri http://localhost:4000/health
Invoke-RestMethod -Uri http://localhost:4000/ready
Invoke-RestMethod -Uri http://localhost:4000/version
# Verified web UI loads at http://localhost:5173
docker compose -f infra/docker-compose.prototype.yml down
```
*Results captured in `docs/audit/PRE_PRODUCT_SUITE_HARDENING_EVIDENCE.md`.*


## Enterprise UI/UX Overhaul Validation
*Results captured in `docs/audit/UI_UX_OVERHAUL_VALIDATION.md`.*

## E2E Functional Test Rehearsal
```bash
npm.cmd run build
npm.cmd run typecheck
npm.cmd run build:web
npm.cmd run verify:static
node scripts/ws_verify.js
node scripts/verify_safety_guardrails.js
npm.cmd run safety:verify
npm.cmd run pilot:docker:build
docker compose -f infra/docker-compose.prototype.yml up -d postgres api web
docker compose -f infra/docker-compose.prototype.yml ps
Invoke-RestMethod -Uri http://localhost:4000/health
Invoke-RestMethod -Uri http://localhost:4000/ready
Invoke-RestMethod -Uri http://localhost:4000/version
# Verified web UI loads at http://localhost:5173
# Ran custom REST API test matrix
# Ran Select-String safety scans
docker compose -f infra/docker-compose.prototype.yml down
```
*Results captured in `docs/audit/E2E_FUNCTIONAL_TEST_REPORT.md` and `docs/audit/E2E_FUNCTIONAL_BUG_REGISTER.md`.*

## Phase 0 Baseline Stabilization Sprint

```bash
# 1. Clean installation and dependency tree updates
npm.cmd install

# 2. Run local CI static verification (build, typechecks, static verify, ws verify, safety verify)
npm.cmd run verify:ci

# 3. Run safety guardrails scanner directly
node scripts/verify_safety_guardrails.js

# 4. Compile semantic version-tagged Docker prototype images
powershell -ExecutionPolicy Bypass -File scripts/build_docker.ps1

# 5. Run full local CI verification including Docker staging build and Compose configs
npm.cmd run verify:ci:docker

# 6. Generate full and production-only dependency audit JSON logs
npm.cmd audit --json > docs/audit/audit_phase0_full.json
npm.cmd audit --omit=dev --json > docs/audit/audit_phase0_prod.json
```
*Results captured in `docs/audit/PHASE0_DEPENDENCY_AUDIT.md`, `docs/audit/v1.1-RELEASE_EVIDENCE.md`, and `docs/audit/PHASE0_STABILIZATION_REPORT.md`.*
