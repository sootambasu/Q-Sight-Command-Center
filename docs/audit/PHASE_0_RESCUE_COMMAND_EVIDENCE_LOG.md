# Phase 0 Rescue Command Evidence Log

This log documents the commands executed during verification of the rescue fixes, showing output, exit codes, and timestamps.

## 1. Local Workspace Execution

### 1.1. npm ci (Clean Local Dependencies)
* **Command:** `npm ci`
* **Exit Code:** `0`
* **Log Excerpt:**
  ```
  added 463 packages, and audited 470 packages in 19s
  found 0 vulnerabilities
  ```

---

### 1.2. npm run build (Build Shared, API, and Workers)
* **Command:** `npm run build`
* **Exit Code:** `0`
* **Log Excerpt:**
  ```
  > @q-sight/shared@0.1.0 build
  > tsc

  > @q-sight/api@0.1.0 build
  > tsc

  > @q-sight/opensky-ingestor@0.1.0 build
  > tsc
  ```

---

### 1.3. npm run typecheck (Strict Typecheck Across Workspace)
* **Command:** `npm run typecheck`
* **Exit Code:** `0`
* **Log Excerpt:**
  ```
  > @q-sight/shared@0.1.0 typecheck
  > tsc --noEmit

  > @q-sight/api@0.1.0 typecheck
  > tsc --noEmit
  ```

---

### 1.4. npm test (Jest Test Suite)
* **Command:** `npm test`
* **Exit Code:** `0`
* **Log Excerpt:**
  ```
  PASS dist/audit/__tests__/outboxWorker.test.js
    Audit Outbox Worker
      √ processes events successfully (2 ms)
      √ handles retry and backpressure/failure
      √ moves to dead-letter queue after max retries (1 ms)

  Test Suites: 1 passed, 1 total
  Tests:       3 passed, 3 total
  ```

---

### 1.5. npm run verify:static (Complete Static Checklist)
* **Command:** `npm run verify:static`
* **Exit Code:** `0`
* **Log Excerpt:**
  ```
  > @q-sight/web@0.1.0 build
  > tsc && vite build
  ✓ built in 866ms
  ```

---

### 1.6. node scripts/verify_safety_guardrails.js (Safety Rule Scan)
* **Command:** `node scripts/verify_safety_guardrails.js`
* **Exit Code:** `0`
* **Log Excerpt:**
  ```
  ✅ Safety Verification PASSED. No forbidden patterns detected in code/configs.
  ```

---

### 1.7. curl (API Health Verification)
* **Commands:**
  - `curl -s http://localhost:4000/health`
  - `curl -s http://localhost:4000/ready`
  - `curl -s http://localhost:4000/version`
* **Output:**
  - `/health`: `{"status":"ok","timestamp":"2026-07-13T12:41:52.430Z","app":"q-sight-api"}`
  - `/ready`: `{"status":"ready","liveIngestionEnabled":true,"seismicLiveEnabled":true,"satelliteLiveEnabled":true,"aircraftLiveEnabled":true,"websocketConfigStatus":"active"}`
  - `/version`: `{"appName":"q-sight-api","version":"0.1.0","environment":"development","gitCommit":"9b0de3938b459defcfb3dc7678ab48a318a391d5"}`

---

### 1.8. WebSocket Verification (Ticket & RBAC Validation)
* **Command:** `node scripts/ws_verify.js`
* **Exit Code:** `0`
* **Log Excerpt:**
  ```
  === Q-Sight V0.6 WebSocket Verification ===
  Test 1: Operator connection and subscription...
    ✅ PASS: [operator] Connected
  Test 2: Auditor RBAC channel denial...
    ✅ PASS: [auditor] Subscription denied channels as expected
  Test 3: Admin full access...
    ✅ PASS: [admin] Subscription granted channels
  Test 4: REST API telemetry still functional...
    ✅ PASS: [REST] /api/telemetry/aircraft returns 873 records
  Test 5: Verify camera channels are absent...
    ✅ PASS: [SAFETY] No camera channels in WebSocket allowed_channels
  Test 6: Verify direct query param role spoofing is blocked...
    ✅ PASS: [SPOOF] Connection error as expected (rejected): Unexpected server response: 401
    ✅ PASS: [SPOOF] Connection rejected as expected
  🎉 All V0.6 WebSocket tests passed!
  ```

---

### 1.9. Docker compose config & build
* **Command:** `docker compose -f infra/docker-compose.prototype.yml build`
* **Exit Code:** `0`
* **Log Excerpt:**
  ```
   Image infra-api Built 
   Image infra-web Built
  ```
