# Post-Merge Requirement Traceability Matrix

This matrix maps stabilization defects to files modified and the tests that verify their resolution.

| Audit Defect / Control | Target Requirement | Modified Files | Verification Method | Status |
| :--- | :--- | :--- | :--- | :--- |
| **1. Web Typecheck** | Frontend build integrity | `apps/web/src/api.ts`, `packages/shared/src/schemas.ts`, `packages/shared/src/types.ts` | `npm run typecheck:web` | **PASS** |
| **2. Jest Syntax/Harness** | Unit testing execution | `apps/api/jest.config.js`, `apps/api/package.json`, `package.json`, `apps/api/src/audit/__tests__/outboxWorker.test.ts` | `npm test` | **PASS** |
| **3. Fastify Version Crash**| API runtime stability | `apps/api/package.json`, `apps/api/src/routes/realtime.ts` | `npm run dev:api` and `/health` curl check | **PASS** |
| **4. WS Query Auth Spoof**| Secure WebSocket auth | `apps/api/src/routes/realtime.ts`, `scripts/ws_verify.js` | `node scripts/ws_verify.js` (Test 6 blocks spoofing) | **PASS** |
| **5. Docker Install Error**| Reproducible staging builds| `apps/api/Dockerfile`, `apps/web/Dockerfile`, `apps/web/package.json` | `docker compose -f infra/docker-compose.prototype.yml build` | **PASS** |
| **6. GitHub Governance**| Remote project protection| `docs/audit/POST_MERGE_GITHUB_GOVERNANCE_AUDIT.md` | Active remote branch protections on `main` (verified by push warning) | **PASS** |
