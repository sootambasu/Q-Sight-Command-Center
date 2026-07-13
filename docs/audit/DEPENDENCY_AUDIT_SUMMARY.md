# Dependency Audit Summary

## Overview
A dependency audit was conducted on the Q-Sight Command Center workspace.

**Total Vulnerabilities (Full Workspace)**: 7
**Severity Breakdown**: 6 High, 1 Moderate

**Total Vulnerabilities (Production / omit=dev)**: 5
**Severity Breakdown**: 5 High

## Affected Packages (Sample)
- `esbuild` (Moderate, dev-only)
- `fastify`, `fast-json-stringify`, `fast-uri`, `@fastify/ajv-compiler` (High, runtime)

## Classification
- The `esbuild` vulnerability is dev-only and does not affect the runtime Docker container since `esbuild` is not executed in production mode.
- The `fastify` related vulnerabilities are runtime issues, but in this prototype context (where the API is not exposed to the open internet without an ingress/WAF, and telemetry is trusted), the risk is low.

## Recommended Action
- Apply safe, non-breaking `npm audit fix`.
- If vulnerabilities remain, they are acceptable for the pilot phase given the closed-network operating environment.

## Pilot-Blocking Status
- **NO**: These vulnerabilities do not block the pilot rehearsal, but should be resolved before public/production deployment.
