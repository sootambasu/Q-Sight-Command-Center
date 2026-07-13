# Post-Merge Command Evidence Log (Phase 0 Closure Audit)

This log captures the terminal outputs and findings from executing the verification matrix against the clean clone of `9b0de39`.

## A8 Verification Suite

### Static Verification (`npm run verify:static`)
**Command executed:**
```bash
npm.cmd run verify:static
```

**Result:** `FAIL`
**Reason:** The web frontend typecheck failed during compilation.
```text
> @q-sight/web@0.1.0 typecheck
> tsc --noEmit

src/api.ts(130,58): error TS2304: Cannot find name 'Alert'.
src/api.ts(136,66): error TS2304: Cannot find name 'Alert'.
```
This demonstrates the frontend is broken on `main`.

### Unit Tests (`npm run test`)
**Command executed:**
```bash
npx.cmd jest src/.*\.test\.ts
```

**Result:** `FAIL`
**Reason:** `outboxWorker.test.ts` failed due to a missing semicolon `SyntaxError: D:\QSightCleanVerification\apps\api\src\audit\__tests__\outboxWorker.test.ts: Missing semicolon. (21:16)`. The API tests do not run correctly without proper TS configuration or fixing the syntax.

## A9 Challenge Reviews & Runtime Verification

### API Runtime & WebSocket Auth Validation
**Command executed:**
```bash
npm.cmd run dev (in apps/api)
node scripts/ws_verify.js
```

**Result:** `FAIL`
**Reason:** The API server crashes immediately on startup due to a dependency version mismatch between `fastify` (v5.10.0) and `@fastify/websocket` (expects ^4.16.0).
```json
{"level":50,"time":1783945474136,"msg":"fastify-plugin: @fastify/websocket - expected '^4.16.0' fastify version, '5.10.0' is installed"}
```
Consequently, all A9 WebSocket (A3 Identity & WS Auth) tests fail since the server cannot accept connections.

### Safety Guardrails Scan
**Command executed:**
```bash
node scripts/verify_safety_guardrails.js
```

**Result:** `PASS`
**Reason:** The static scanner found no forbidden patterns in code or configurations on the clean clone.

### Overall Status for Phase 0
**PHASE 0 NOT COMPLETE.** The codebase on `main` fails to compile, fails to test, and fails to run. Evidence strictly downgrades the claim of completion.
