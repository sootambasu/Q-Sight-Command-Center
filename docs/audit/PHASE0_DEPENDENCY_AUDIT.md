# Dependency Audit Report — Phase 0 Baseline Stabilization

This document summarizes the dependency vulnerability assessment and mitigation strategy implemented for the Q-Sight Command Center staging release v1.1.

---

## 1. Audit Summary

*   **Vulnerability Scan Date**: 2026-07-01
*   **Total Packages Audited**: 224
*   **Initial Security Status**: 7 vulnerabilities (1 moderate, 6 high)
*   **Remediated Status**: 6 vulnerabilities (0 moderate, 6 high)
*   **Resolution Type**: Selective manual override of transitive dependencies. No forced upgrades applied.

---

## 2. Vulnerability Details & Mitigation Status

| Package | Severity | Category | Dependency Type | Status | Mitigation / Justification |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **esbuild** | `Moderate` | Request Forgery (GHSA-67mh-4wv8-2f99) | Transitive (Vite Dev Server) | **REMEDIATED** | Explicitly upgraded `esbuild` to `v0.25.12` via workspace devDependency in `apps/web/package.json` and root package `overrides`. Verified Vite dev server compilation is fully backward-compatible. |
| **fast-uri** | `High` | Path Traversal / Host Confusion (GHSA-q3j6-qgpj-74h6, GHSA-v39h-62p7-jpjc) | Transitive (Fastify API Compiler) | **DEFERRED** | Upgrading `fast-uri` requires upgrading Fastify from `v4` to `v5`, representing a breaking change to the backend routing architecture. Deferred as low risk since staging/production deployments run on a closed subnet behind an authorized load balancer. |
| **vite** | `High` | Path Traversal (GHSA-4w7w-66w2-5vf9, GHSA-fx2h-pf6j-xcff) | Dev Dependency | **DEFERRED** | Upgrading `vite` to version `v8` is a major breaking change that conflicts with the Cesium monorepo hoisting and asset resolution configs. Safe to defer as Vite is only used during development and production static asset compilation. |

---

## 3. Post-Upgrade Verification Results

Following the `esbuild` override implementation:
1.  **Dependency Tree Resolution**: Checked and verified that `node_modules/esbuild` resolved successfully to `v0.25.12`.
2.  **Workspaces Build**: `npm run build` completed successfully.
3.  **Typecheck Validation**: `npm run typecheck` passed for all packages.
4.  **Vite Asset Compilation**: `npm run build:web` built the React/Cesium application without bundle warnings.
5.  **Staging Environment Build**: Docker images built cleanly under Node `22-alpine` context.

---

## 4. Remaining Risks & Recommendations

*   **Fastify v5 Migration**: Transitioning to Fastify v5 is recommended for Phase 1 to clear the `fast-uri` vulnerability.
*   **Vite v6/v8 Migration**: Upgrading Vite is recommended once CesiumJS path resolutions are updated to match the new Vite dev server boundaries.
