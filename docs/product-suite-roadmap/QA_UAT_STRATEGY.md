# QA and UAT Strategy

This document defines the quality assurance framework, test matrices, testing methodologies, and UAT signoff criteria for the Q-Sight Product Suite.

---

## 1. Test Matrices

### A. Role-Based Access Control (RBAC) Test Matrix
Ensures endpoints and client interfaces restrict access according to the user's role.

| Role | Telemetry Map | Geofence Bounds | Audit Ledger UI | Admin Console | DB Write (CRUD) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Operator** | Read (Redacted) | Denied | Denied | Denied | Denied |
| **Supervisor** | Read (Unredacted)| Read / Draw | Denied | Denied | Denied |
| **Auditor** | Denied | Denied | Read Only | Denied | Denied |
| **Admin** | Read (Unredacted)| Read / Draw | Read Only | Read / Write | Read / Write |

### B. Functional, Security, and Resilience Test Matrix

| Test ID | Test Category | Target Component | Scenario | Expected Result | Automation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TS-SEC-01**| Security | API Router | Call REST endpoint without authorization header. | Returns `401 Unauthorized`. | Yes (Supertest)|
| **TS-SEC-02**| Security / RBAC | WebSocket | Subscriber attempts connection with simulated role headers. | Connection rejected. | Yes (WS client)|
| **TS-SEC-03**| Security / RBAC | API Router | Operator requests compliance logs endpoint. | Returns `403 Forbidden` and logs. | Yes (Supertest)|
| **TS-RES-01**| Resilience | Ingestion Workers| OpenSky live API returns HTTP 503. | Worker task logs failure; loads mock. | Yes (Mock API) |
| **TS-RES-02**| Resilience | WebSocket | WebSocket feed disconnects mid-session. | UI falls back to HTTP polling. | Yes (Selenium)|
| **TS-SAF-01**| Compliance | Workspaces | Scanner script checks codebase files. | 0 violations found; exit code 0. | Yes (CI hook) |
| **TS-EXP-01**| Evidence | Web App | Operator exports incident report. | Redacted coordinates omitted. | Yes (Unit test)|
| **TS-ROL-01**| DevOps | Staging VM | Execute rollback script after upgrade fail. | Reverts DB schema and containers. | Yes (Deploy script) |

---

## 2. Browser & Responsive Test Plan
*   **Viewport Targets**:
    *   *Standard Desktop*: 1920x1080 (Operational view).
    *   *Low-res Desktop / Notebook*: 1366x768 (Must have zero horizontal scrolling or sidebar overlaps).
*   **Browser Targets**: Google Chrome (Chromium), Microsoft Edge, Mozilla Firefox.
*   **Verification Method**: Playwright assertions checking selector visibility and layout positions on 1366px screen setups.

---

## 3. Ingestion Source Degradation Testing
*   **Simulated Latency**: Workers must gracefully handle request timeouts up to 10 seconds.
*   **Connection Drops**: System must maintain a **Last-Known-Good Cache** database to prevent map blanking during vendor outages.
*   **Invalid Payloads**: Parser failures must not crash background tasks. Invalid records are logged and discarded.

---

## 4. WebSocket & RBAC Security Verification
*   **Handshake Authentication**: WebSockets must validate the OIDC session token or single-use ticket in the handshake handler.
*   **Scope Redaction**: Verify that coordinates are dynamically redacted based on the connection session's role attributes.

---

## 5. Compliance & Safety Scanner Rules
*   **CI Execution**: The static safety scanner script (`verify_safety_guardrails.js`) runs on every commit.
*   **Banned Vocabulary Scanner**: Flags keyword violations (e.g., face detection, WebRTC video streaming, predictive policing).

---

## 6. UAT Signoff Checklist

Before any release candidate can be signed off for customer deployment, the Quality Lead and Security Architect must verify the following items:

- [ ] **Static Verification**: `npm run build` and `npm run typecheck` complete with zero errors.
- [ ] **Safety Compliance**: Safety scanner reports zero violations.
- [ ] **RBAC Enforcement**: Auditor is locked out of operational maps; Operator is blocked from compliance logs.
- [ ] **Resilience Verification**: Ingestion tasks degrade gracefully during simulated API outages.
- [ ] **Evidence Security**: Coordinates and credentials are omitted from all exported packages.
- [ ] **Rollback Capability**: Rollback script recovers staging environment to a healthy state.
- [ ] **Tenancy Isolation**: Multi-tenant database checks confirm no cross-tenant leakage.
