# Current State Snapshot — Q-Sight Command Center

**Document:** Pre-Remediation Current State Snapshot  
**Timestamp:** 2026-07-13T11:38:51+05:30 (UTC: 2026-07-13T06:08:51Z)  
**Author:** Q-Sight Governance Bot (Agent A1)  
**Purpose:** P0 Hardening Program — Repository Governance Step  

---

## 1. Repository State

| Property | Value |
|----------|-------|
| Workspace | `D:\Q-Sight Command Center` |
| Git State | Initialized (fresh — `git init -b main` executed) |
| Active Branch | `main` (no commits yet at snapshot time) |
| Remote | Not yet configured at snapshot time |
| Working Tree | All project source files present |

---

## 2. Credential File Status

| File | Status |
|------|--------|
| `.env` | EXISTS locally — contains live credentials |
| `.env` in `.gitignore` | YES — line 22: `.env` |
| `.env` staged for commit | NO — protected by `.gitignore` |
| `.env` in SHA256 manifest | NO — excluded from manifest generation |
| `.env` value contents | NOT PRINTED — classified |

**Security guarantee:** `.env` will NOT be committed. `.gitignore` line 22 is the primary control. Pre-commit verification (`git status --short`) will confirm absence before commit is finalized.

---

## 3. Tracked Files (from BASELINE_FILE_MANIFEST.sha256)

Total tracked files in manifest: **177** (excluding `.env`, `node_modules/`, `dist/`, `build/`, `.next/`)

### Root Files (14)
- `.editorconfig`, `.env.demo.example`, `.env.example`, `.env.live.example`, `.env.staging.example`
- `.gitattributes`, `.gitignore`, `package-lock.json`, `package.json`, `README.md`
- `task.md`, `tsconfig.base.json`, `verify.ps1`, `walkthrough.md`

### apps/api/ (18 files)
- Source: `src/config.ts`, `src/db.ts`, `src/mock-data.ts`, `src/server.ts`
- Auth: `src/auth/context.ts`, `src/auth/requirePermission.ts`, `src/auth/roles.ts`
- DB: `src/db/migrationRunner.ts`, `src/db/migrations.ts`
- SQL migrations: `001_initial_schema_reference.sql`, `002_audit_log_metadata_columns.sql`
- Routes: `assets.ts`, `audit.ts`, `cameras.ts`, `health.ts`, `index.ts`, `realtime.ts`, `telemetry.ts`
- Config: `Dockerfile`, `package.json`, `README.md`, `tsconfig.json`, `tsconfig.tsbuildinfo`

### apps/web/ (27 files)
- Config: `Dockerfile`, `index.html`, `package.json`, `README.md`, `tsconfig.json`, `tsconfig.tsbuildinfo`, `update_app.cjs`, `vite.config.ts`
- Source: `src/api.ts`, `src/App.tsx`, `src/main.tsx`, `src/styles.css`, `src/vite-env.d.ts`
- Components (11): `AlertInbox.tsx`, `CommandBar.tsx`, `EmptyState.tsx`, `EntityDetailPanel.tsx`, `ExecutiveOverlay.tsx`, `icons.tsx`, `MetricCard.tsx`, `MissionRail.tsx`, `OperatingModeBanner.tsx`, `SafetyFooter.tsx`, `SourceHealthPanel.tsx`, `StatusBadge.tsx`, `TimelineStrip.tsx`
- Hooks (5): `useAlertInbox.ts`, `useDashboardData.ts`, `useDemoScenario.ts`, `usePolling.ts`, `useRealtime.ts`
- Utils (3): `cesiumGeometry.ts`, `exportEvidence.ts`, `formatting.ts`

### docs/ (17 core docs + audit/ + product-suite-roadmap/ + remediation/)
- Core docs: architecture, CONTRIBUTING, data-sources, database-schema, decision-log, demo-checklist, demo-runbook, demo-script, final-handover, live-prototype-evidence, live-prototype-runbook, operator-walkthrough, pilot-readiness-checklist, pre-product-suite-hardening, product-requirements, prototype-operations-runbook, security-guardrails
- `docs/audit/`: 28 files (COMMAND_EVIDENCE_LOG, DEPENDENCY_AUDIT_SUMMARY, E2E reports, FINDINGS_REGISTER, FORENSIC_AUDIT_REPORT, PHASE0 reports, PILOT logs, test results, audit JSON exports)
- `docs/product-suite-roadmap/`: 14 files (roadmap, backlog, delivery plan, release plan, risk register, etc.)
- `docs/remediation/`: MIGRATION_ALLOCATION.md, P0_DESIGN_CONTRACTS.md, BASELINE_FILE_MANIFEST.sha256, BASELINE_EXCLUSIONS.md (this file)

### infra/ (6 files)
- `docker-compose.prototype.yml`, `docker-compose.yml`
- `nginx/default.conf`
- `postgres/init/.gitkeep`, `postgres/init/001_init.sql`

### packages/shared/ (7 files)
- `package.json`, `README.md`, `tsconfig.json`, `tsconfig.tsbuildinfo`
- `src/index.ts`, `src/ingestion.ts`, `src/schemas.ts`, `src/types.ts`

### scripts/ (8 files)
- `apply-ui-hardening.js`, `build_docker.ps1`, `ci_verify.ps1`, `scheduled_ingestion.js`
- `verify_ingestion.js`, `verify_live_sources.js`, `verify_safety_guardrails.js`, `ws_verify.js`

### workers/ (15 files across 3 workers)
- `earthquake-ingestor/`: package.json, README.md, tsconfig.json, tsconfig.tsbuildinfo, src/index.ts, src/mock-data.ts
- `opensky-ingestor/`: package.json, README.md, tsconfig.json, tsconfig.tsbuildinfo, src/index.ts, src/mock-data.ts
- `satellite-ingestor/`: package.json, README.md, tsconfig.json, tsconfig.tsbuildinfo, src/index.ts, src/mock-data.ts

---

## 4. Excluded Directories (NOT tracked)

| Directory | Reason |
|-----------|--------|
| `node_modules/` | Dependency directory; ~300MB+; reproducible via `npm ci` |
| `dist/` | Compiled output; reproducible via `npm run build` |
| `build/` | Build artifacts |
| `.next/` | Framework cache |

---

## 5. Previous Audit State (docs/audit/)

The `docs/audit/` directory contains 28 files documenting prior remediation sprints:
- Phase 0 Stabilization (PHASE0_STABILIZATION_REPORT.md, PHASE0_DEPENDENCY_AUDIT.md)
- Pilot Freeze Evidence (FINAL_PILOT_FREEZE_EVIDENCE.md, PILOT_FREEZE_NOTE.md)
- E2E Functional Testing (E2E_FUNCTIONAL_TEST_REPORT.md, E2E_FUNCTIONAL_BUG_REGISTER.md)
- Dependency Audits (audit_full.json, audit_prod.json, audit_phase0_full.json, audit_phase0_prod.json)
- Version Evidence (v1.1-RELEASE_EVIDENCE.md)
- PRE_PRODUCT_SUITE_HARDENING_EVIDENCE.md
- UI_UX_OVERHAUL_VALIDATION.md

These are all committed to the baseline.

---

## 6. Git Configuration Set

```
user.email = governance@q-sight.local
user.name  = Q-Sight Governance Bot
```

---

## 7. Architecture Overview

```
Q-Sight Command Center (monorepo)
├── apps/
│   ├── api/          (Fastify + TypeScript — REST/WebSocket API)
│   └── web/          (React + Vite + TypeScript — Operator Dashboard)
├── packages/
│   └── shared/       (Shared types, schemas, ingestion logic)
├── workers/
│   ├── earthquake-ingestor/   (USGS earthquake data)
│   ├── opensky-ingestor/      (OpenSky Network ADS-B flight data)
│   └── satellite-ingestor/    (Satellite tracking)
├── infra/
│   ├── docker-compose.prototype.yml
│   ├── docker-compose.yml
│   ├── nginx/
│   └── postgres/init/
└── scripts/          (CI verify, Docker build, safety guardrails, ingestion verify)
```

---

*Generated by Agent A1 — Q-Sight P0 Hardening Program — 2026-07-13*
