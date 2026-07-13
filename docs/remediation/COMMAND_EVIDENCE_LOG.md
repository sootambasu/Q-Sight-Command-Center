# Command Evidence Log
Owner: Lead Orchestrator (A0) + all agents
Last updated: 2026-07-13

> [!IMPORTANT]
> This log records every command executed during P0 remediation with exact output.
> Commands are appended by each agent. Never backfill or invent output.
> Mark BLOCKED when a command cannot be run due to missing auth or external dependency.

---

## A0 - Lead Orchestrator

### 2026-07-13 Initial Inspection

**Command**: `git -C "D:\Q-Sight Command Center" status 2>&1`
**Output**:
```
fatal: not a git repository (or any of the parent directories): .git
```
**Finding**: Git is NOT initialized. Repository has no version control history.

**Command**: `Get-ChildItem -Name "D:\Q-Sight Command Center" | head`
**Output**: `.editorconfig, .env, .env.demo.example, .env.example, .env.live.example, .env.staging.example, .gitattributes, .gitignore, README.md, apps, docs, infra, node_modules, package-lock.json, package.json, packages, scripts, task.md, tsconfig.base.json, verify.ps1, walkthrough.md, workers`

**Finding**: `.env` file exists at root (contains credentials — confirmed by redacted scan). `.gitignore` correctly lists `.env`.

**Finding**: `node_modules/`, `dist/` exist and are excluded by `.gitignore`.

### Confirmed P0 Defects

| Defect | File | Line | Evidence |
|--------|------|------|---------|
| Mock drift in production | `apps/api/src/routes/realtime.ts` | 60–82, 282–287, 386–390 | `driftAircraft`, `driftSatellite` called unconditionally; fallback to mock when DB empty |
| Mock fallback in telemetry | `apps/api/src/routes/telemetry.ts` | 53–61, 134–141, 213–220 | `source: 'mock'` on empty DB |
| Mock fallback on DB error | `apps/api/src/routes/telemetry.ts` | 87–95, 164–172, 245–253 | `source: 'mock'` on DB error |
| Dev role from query param | `apps/api/src/routes/realtime.ts` | 176 | `?role=...` accepted unconditionally |
| stream_url in DB schema | `infra/postgres/init/001_init.sql` | 67 | `stream_url VARCHAR(500) NOT NULL` |
| verification_hash in DB schema | `infra/postgres/init/001_init.sql` | 69 | `verification_hash VARCHAR(64) NOT NULL` |
| Audit locally only | `infra/postgres/init/001_init.sql` | 95–105 | Trigger only; no outbox |
| No Git repo | Repository root | — | `git status` fatal error |
| Enterprise-grade claim | `README.md` | L3 | "enterprise-grade Industrial Spatial Intelligence" |
| Pilot-ready claim | `docs/audit/PILOT_GO_NO_GO_ASSESSMENT.md` | — | "GO WITH CONDITIONS" |

---

## A1 - Repository Governance
(Commands appended when A1 completes)

---

## A2 - Dependency Security
(Commands appended when A2 completes)

---

## A3 - Telemetry Trust
(Commands appended when A3 completes)

---

## A4 - Identity and Audit
(Commands appended when A4 completes)

---

## A5 - Alert Operations
(Commands appended when A5 completes)

---

## A6 - Sensor Registry
(Commands appended when A6 completes)

---

## A7 - Documentation
(Commands appended when A7 completes)

---

## A8 - Independent Verification
(Commands appended when A8 completes)
