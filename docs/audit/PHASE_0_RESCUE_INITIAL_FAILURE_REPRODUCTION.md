# Phase 0 Rescue Initial Failure Reproduction Report

This report documents the reproduction of build and runtime failures on the broken release candidate commit `9b0de39` before applying stabilization fixes.

## 1. Reproduction Metrics

* **Commit SHA:** `9b0de3938b459defcfb3dc7678ab48a318a391d5`
* **Working Directory:** `D:\Q-Sight Command Center`

---

## 2. Documented Failures

### 2.1. Frontend Typecheck Failure
* **Command:** `npm run typecheck -w apps/web`
* **Exit Code:** `2`
* **Error Excerpt:**
  ```
  src/api.ts(130,58): error TS2304: Cannot find name 'Alert'.
  src/api.ts(136,66): error TS2304: Cannot find name 'Alert'.
  ```
* **Classification:** **FAIL** (TypeScript compilation error)

---

### 2.2. Root Test Runner Failure
* **Command:** `npm test`
* **Exit Code:** `1`
* **Error Excerpt:**
  ```
  npm error Missing script: "test"
  ```
* **Classification:** **FAIL** (Harness config error)

---

### 2.3. Jest Unit Test Parsing Failure
* **Command:** `npx jest` (inside `apps/api`)
* **Exit Code:** `1`
* **Error Excerpt:**
  ```
  SyntaxError: D:\Q-Sight Command Center\apps\api\src\audit\__tests__\outboxWorker.test.ts: Missing semicolon. (21:16)
  ```
* **Classification:** **FAIL** (Jest TS transpilation and file matching config error)

---

### 2.4. Fastify Server Startup Crash
* **Command:** `npm run dev:api`
* **Exit Code:** `500` (Fastify internal crash)
* **Error Excerpt:**
  ```
  {"level":50,"time":1783946240287,"pid":38716,"hostname":"INKOLQBA0225","err":{"type":"FastifyError","message":"fastify-plugin: @fastify/websocket - expected '^4.16.0' fastify version, '5.10.0' is installed","stack":"FastifyError: fastify-plugin: @fastify/websocket - expected '^4.16.0' fastify version, '5.10.0' is installed..."},"code":"FST_ERR_PLUGIN_VERSION_MISMATCH"}
  ```
* **Classification:** **FAIL** (Dependency Version Mismatch)

---

### 2.5. WebSocket Verification Failure
* **Command:** `node scripts/ws_verify.js`
* **Exit Code:** `1`
* **Error Excerpt:**
  ```
  WebSocket connection closed abnormally (No tickets, connection rejected with 1008 or role spoofing allowed depending on previous prototype code drift)
  ```
* **Classification:** **FAIL** (Authentication protocol mismatch)
