# Prioritized Backlog

This document organizes the expanded Q-Sight backlog into actionable categories based on criticality, engineering effort, and deployment dependency.

---

## 1. Top P0 Epics (Production Blockers)

These epics are mandatory to guarantee basic codebase stability, code quality, and security before any customer-facing staging deployment:

*   **PLAT-01: Git Branching & Release Discipline**: Establish branch protections (`main`, `staging`, `develop`) and merge rules.
*   **PLAT-02: CI Pipeline Baseline**: Build local check and automated testing baseline (syntax, types, unit tests, and safety scanner).
*   **SEC-01: Azure AD / Entra ID Authentication Architecture Spike**: Resolve enterprise authentication sequence.
*   **SEC-03: REST JWT Middleware**: Inject token validation to block unauthorized REST calls.
*   **SEC-04: WebSocket Auth Handshake**: Establish secure WebSocket ticketing.
*   **SEC-06: Tenant/Org Isolation Model**: Scaffold tenant-specific routing and scoping.
*   **ALERT-01: Persistent Alert Schema**: Setup target database tables for alerts.
*   **DATA-01: Source Adapter Framework**: Implement clean TypeScript contracts for data ingestors to prevent code duplication.

---

## 2. Top P1 Epics (Paid Pilot Requirements)

These epics are required to support a 30-day proof-of-concept (PoC) pilot with a paying customer:

*   **PROD-01: Admin Console Architecture**: Provide interface framework for managing configurations.
*   **PROD-02: Site Management**: Administrative CRUD operations for physical operational sites.
*   **PROD-04: Metadata-only Camera Registry**: Register camera endpoints with strict privacy metadata limitations.
*   **ALERT-03: Alert Lifecycle (Acknowledge & Resolve)**: Basic state workflow for operators.
*   **OBS-01: Structured Logging Standard**: Standardize JSON outputs for log routers.
*   **OBS-04: Ingestion Source Monitoring**: Track data freshness and throw visual alarms on worker failures.
*   **COM-01: Product One-Pager & Architecture Deck**: Basic commercial onboarding documents.
*   **UX-01: Admin Console UX Flows**: Clean layouts for site configurations.
*   **UX-04: Operator Onboarding Experience**: Interactive first-time walkthrough.

---

## 3. Quick Wins (High Value, Low Effort)

Implement these early to show immediate project maturity with minimal engineering risk:

*   **PLAT-05: Environment Profile Management (S)**: Standardize `.env.live`, `.env.staging`, and `.env.demo` templates.
*   **SEC-08: Production CORS/Security Headers (S)**: Set standard security headers (`Helmet` configuration in Fastify).
*   **SEC-09: API Rate Limiting (S)**: Integrate `@fastify/rate-limit` to prevent basic API abuse.
*   **UX-08: Empty/Degraded State Refinement (S)**: Ensure fallback views display friendly guidance rather than breaking.
*   **ALERT-11: False-Positive Tagging (S)**: Allow operators to tag alerts to optimize detection rules.

---

## 4. Architecture Spikes (Technical De-risking)

Execute these spikes to clarify implementation paths before committing major sprint resources:

*   **SEC-01: Azure AD Integration Spike**: Research OIDC, redirect URIs, and group-to-role mappings.
*   **PLAT-03: Dependency Upgrade Planning**: Analyze node-workspace hoisting issues to resolve CVEs.
*   **DATA-07: SGP4 Architecture Spike**: Test satellite footprint calculation limits.

---

## 5. Blocked Items (Awaiting Dependencies)

*   **ALERT-02 (Alert API)**: Blocked by **ALERT-01 (Alert Schema)**.
*   **SEC-02 (Frontend Login/Session)**: Blocked by **SEC-01 (Azure AD Spike)**.
*   **PROD-05 (Source Configuration UI)**: Blocked by **SEC-06 (Tenant Model)** and **PROD-01 (Admin Console)**.
*   **DATA-08 (Timeline Replay)**: Blocked by **ALERT-01 (Persistent Alerts)**.

---

## 6. Deferred P2/P3 Items (Future Enhancements)

These epics represent product maturity. They are deferred to Phase 5 and Phase 6 to ensure core system stability:

*   **DATA-07: SGP4 Architecture Spike (P3)**
*   **DATA-09: Geospatial Correlation Rules (P2)**
*   **ALERT-07: SLA Timers (P2)**
*   **ALERT-08: Escalation Policy (P2)**
*   **PLAT-10: Release Evidence Pack Automation (P2)**
*   **OBS-02: Centralized Log Sink (P2)**

---

## 7. Recommended Sprint Order

The recommended sequence for implementing the backlog is detailed below.

```
┌────────────────────────────────────────────────────────┐
│  Sprint 1: Phase 0 Stabilization (v1.1)                 │
│  - PLAT-01, PLAT-02, PLAT-03, PLAT-04, PLAT-05         │
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│  Sprint 2: Security Spike & Foundation (v1.2a)          │
│  - SEC-01 (Spike), SEC-02, SEC-07, SEC-08, SEC-09      │
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│  Sprint 3: Tenancy & REST/WS Security (v1.2b)          │
│  - SEC-03, SEC-04, SEC-05, SEC-06, SEC-10              │
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│  Sprint 4: Observability & Logging (v1.3)              │
│  - OBS-01, OBS-02, OBS-03, OBS-04, OBS-07              │
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│  Sprint 5: Admin Console & CRUD APIs (v1.4)            │
│  - PROD-01, PROD-02, PROD-03, PROD-04, UX-01           │
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│  Sprint 6: Alert persistence & Lifecycle (v1.5)        │
│  - ALERT-01, ALERT-02, ALERT-03, ALERT-10, UX-02       │
└────────────────────────────────────────────────────────┘
```
