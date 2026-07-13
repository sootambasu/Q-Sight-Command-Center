# PHASE 1 DOCUMENTATION CONSISTENCY PREFLIGHT
## Q-Sight Command Center

**Document ID:** PHASE_1_DOCUMENTATION_CONSISTENCY_PREFLIGHT  
**Status:** DRAFT — REVIEW REQUIRED BEFORE ADR SIGN-OFF  
**Date:** 2026-07-13  
**Baseline:** `v0.1.0-phase0-accepted` (`4e31ee5ac031db1459364ec893d77e58889904f7`)  

---

## 1. Overview

This document presents a consistency preflight analysis of the legacy documentation against the accepted boundaries of Phase 0 and the planned scope of Phase 1. Before formal sign-off is completed at the ADR workshop, these legacy contradictions must be addressed to prevent design drift or incorrect implementations during execution.

---

## 2. Document Consistency Report

### Finding 1: Prohibited Fields and Old Table in Database Schema Specification

| Attribute | Detail |
| :--- | :--- |
| **File** | [docs/database-schema.md](file:///d:/Q-Sight%20Command%20Center/docs/database-schema.md#L85-L104) |
| **Conflicting Text** | Section `2.E` defines the `authorized_cameras` table containing `stream_url VARCHAR(500) NOT NULL` and `verification_hash VARCHAR(64) NOT NULL`. |
| **Why it Conflicts** | Phase 0 Migration 005 permanently dropped the `stream_url` and `verification_hash` columns and renamed the table from `authorized_cameras` to `sensor_registry`. Keeping the old definition in the schema spec violates the privacy safety guardrails and could cause developer confusion or incorrect database structure assumptions. |
| **Recommended Correction** | Rename the section to `E. Sensor Registry Table (sensor_registry)`, remove `stream_url` and `verification_hash` from the schema code block, and update the index to `idx_sensor_registry_location`. |
| **Priority** | High |
| **When to Correct** | Before Implementation (Milestone 1.0) |

---

### Finding 2: Inconsistent Node.js Version Requirements

| Attribute | Detail |
| :--- | :--- |
| **File** | [README.md](file:///d:/Q-Sight%20Command%20Center/README.md#L68), [docs/demo-runbook.md](file:///d:/Q-Sight%20Command%20Center/docs/demo-runbook.md#L7) |
| **Conflicting Text** | `README.md` states: `Node.js 22 (LTS recommended — see .nvmrc; minimum >=18.0.0)`. `demo-runbook.md` states: `1. Node.js: v18 or later installed.` |
| **Why it Conflicts** | Phase 1 enforces a strict, non-negotiable requirement of Node.js 22 across all local, Docker, and CI environments. Allowing `>=18.0.0` or `v18 or later` is inconsistent with the execution constraint. |
| **Recommended Correction** | Update both files to read: `Node.js 22 (strictly enforced; see .nvmrc)` and remove any reference to v18. |
| **Priority** | Medium |
| **When to Correct** | Before ADR Sign-Off |

---

### Finding 3: Automatic Mock Ingestion Fallback in Production/Staging

| Attribute | Detail |
| :--- | :--- |
| **File** | [docs/architecture.md](file:///d:/Q-Sight%20Command%20Center/docs/architecture.md#L58), [docs/data-sources.md](file:///d:/Q-Sight%20Command%20Center/docs/data-sources.md#L25-L41) |
| **Conflicting Text** | `docs/architecture.md`: `workers automatically and gracefully fall back to local mock data.` `docs/data-sources.md`: `Fallback to mock data if disabled or unavailable.` |
| **Why it Conflicts** | Allowing ingestion workers to automatically publish mock data on live API errors or timeouts in a production environment violates the demo/production boundary constraint. Staging and production databases should never be populated with simulated/mock telemetry data automatically on live feed failure. |
| **Recommended Correction** | Explicitly document that fallback to mock data is **strictly disabled** when `BUILD_PROFILE=production` or `LIVE_INGESTION_ENABLED=true`. If live ingestion fails, workers must throw an error, log details, and retry via backoff rather than silently injecting mock telemetry. |
| **Priority** | High |
| **When to Correct** | Before Implementation (Milestone 1.0/1.2 design) |

---

### Finding 4: Simulated Headers for RBAC Without Production Caveats

| Attribute | Detail |
| :--- | :--- |
| **File** | [docs/architecture.md](file:///d:/Q-Sight%20Command%20Center/docs/architecture.md#L45), [docs/security-guardrails.md](file:///d:/Q-Sight%20Command%20Center/docs/security-guardrails.md#L61), [docs/pilot-readiness-checklist.md](file:///d:/Q-Sight%20Command%20Center/docs/pilot-readiness-checklist.md#L72), [docs/final-handover.md](file:///d:/Q-Sight%20Command%20Center/docs/final-handover.md#L83) |
| **Conflicting Text** | Multiple references describe simulated headers (`x-q-sight-role`) as the system's role extraction mechanism, presenting it either as a current capability or a "known limitation" without stating that it is a critical security vulnerability if left active. |
| **Why it Conflicts** | ADR-002 and Milestone 1.1 introduce production-ready OIDC and JWKS authentication. Leaving simulated header authentication active or poorly documented as the primary mechanism creates a risk of header-spoofing bypass in staging/production. |
| **Recommended Correction** | Update all references to state: `Simulated RBAC headers (x-q-sight-role) are active strictly in development profiles. They are compiled out or rejected when BUILD_PROFILE=production.` |
| **Priority** | High |
| **When to Correct** | Before ADR Sign-Off (sets input for ADR-002) |

---

## 3. Summary of Documentation Gaps

| Category | High Priority | Medium Priority | Total |
| :--- | :---: | :---: | :---: |
| DB Schema & Prohibited Fields | 1 | 0 | 1 |
| Ingestion & Fallback Logic | 1 | 0 | 1 |
| Security & Authentication | 1 | 0 | 1 |
| Version/Environment Constraints | 0 | 1 | 1 |
| **Total** | **3** | **1** | **4** |

---

## 4. Recommended Next Steps

1. **Review Report at ADR Workshop:** Include this preflight report as a reading item in the ADR workshop agenda.
2. **Assign Corrections:**
   - **DevOps Lead:** Update Node.js version constraints in `README.md` and runbooks.
   - **Infrastructure Lead:** Update `docs/database-schema.md` to match the actual Phase 0 `sensor_registry` table.
   - **Engineering Lead:** Update `docs/architecture.md` and `docs/data-sources.md` to define the mock fallback boundary for workers under the production profile.
3. **Execute Documentation PR:** Submit a single PR to apply all 4 documentation corrections onto `develop` immediately after ADR sign-off, before Milestone 1.0 coding begins.
