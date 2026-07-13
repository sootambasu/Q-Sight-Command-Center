# Phase 0 Rescue Fix Report

This report documents the architectural and implementation fixes applied to restore baseline build/runtime integrity.

## 1. Summary of Applied Fixes

### 1.1. Frontend TypeScript Build Error
* **Defect:** `apps/web/src/api.ts` used `Alert` type which was not defined in the workspace or exported by `@q-sight/shared`.
* **Fix:** 
  - Defined a canonical `AlertSchema` matching the Postgres table schema in `packages/shared/src/schemas.ts`.
  - Exported type `Alert` from `packages/shared/src/types.ts`.
  - Imported `Alert` in `apps/web/src/api.ts` and successfully verified compilation of `@q-sight/web`.

---

### 1.2. Jest Unit Test Parser and Configuration Error
* **Defect:** Jest was attempting to parse TS files without transpiler tools (like `ts-jest`), causing syntax errors on TS-specific types (`let clientMock: any`). Also, root `"test"` script was missing.
* **Fix:**
  - Added `"test": "jest"` to `apps/api/package.json`.
  - Added `"test": "npm run build && npm run test -w apps/api"` to the root `package.json`.
  - Created `apps/api/jest.config.js` to match only compiled Javascript test files in `dist/**/*.test.js`, bypassing direct TS files and `.d.ts` definitions.
  - Corrected `outboxWorker.test.ts` to mock `config.buildProfile` instead of the non-existent `config.environment`.

---

### 1.3. Fastify Version Mismatch Crash
* **Defect:** `@fastify/websocket` version `8.3.1` is designed for Fastify v4 and crashed when loaded on Fastify v5.10.0.
* **Fix:**
  - Upgraded `@fastify/websocket` to `^11.3.0` in `apps/api/package.json`.
  - Installed `@types/ws` as a devDependency in `apps/api`.
  - Refactored `apps/api/src/routes/realtime.ts` to type connection as `WebSocket` (from `'ws'`) rather than the legacy `SocketStream` which is no longer exported in v11.

---

### 1.4. WebSocket Ticket Authentication Bypass
* **Defect:** Direct query param role spoofing (e.g. `?role=admin`) was handled within the handler after the socket upgraded. This allowed connections to open, and client `open` events to fire before getting closed.
* **Fix:**
  - Configured `preValidation` hook on the `/ws/realtime` route to enforce that query ticket is parsed, validated, and resolved against the OIDC/JWT symmetric signature *before* the connection upgrades.
  - Direct connection requests without valid tickets now fail during the HTTP handshake with a `401 Unauthorized` status.
  - Updated `scripts/ws_verify.js` to use `jose` to sign a dev JWT token, request a temporary ticket via POST `/ws-ticket`, and connect to `/ws/realtime?ticket=...`.

---

### 1.5. Package/Lockfile Drift & Docker Resolution Conflicts
* **Defect:** `apps/web/package.json` had `"vite": "^8.1.4"` while the lockfile pinned `vite@7.3.6`. In Docker, running `npm install` triggered peer dependency resolution conflicts with `esbuild`.
* **Fix:**
  - Downgraded `vite` to `^7.3.6` in `apps/web/package.json` to align with the lockfile.
  - Modified both `Dockerfile`s to run `npm ci` instead of `npm install` for consistent clean builds.
