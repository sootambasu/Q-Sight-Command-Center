# Roadmap Dependency Map

This document outlines the release sequence, technical blockages, parallelization options, and key decision triggers across the Q-Sight productization lifecycle.

---

## 1. Release Dependency Graph

The Mermaid diagram below visualizes the execution sequence. Phase 0 is the prerequisite for all coding work. Phase 1 unlocks the core backend and frontend security layers, which are prerequisites for the administrative interfaces, alerting workflows, and deployment setups.

```mermaid
graph TD
    classDef p0 fill:#d43f3a,stroke:#d43f3a,color:#fff;
    classDef p1 fill:#ee802f,stroke:#ee802f,color:#fff;
    classDef p2 fill:#4b9cd3,stroke:#4b9cd3,color:#fff;
    classDef spike fill:#7e3f98,stroke:#7e3f98,color:#fff;

    %% Phase 0 - Stabilization
    P0_STAB["Phase 0: Baseline Stabilization (v1.1)"]
    click P0_STAB "file:///d:/Q-Sight%20Command%20Center/docs/product-suite-roadmap/PHASED_ROADMAP.md#phase-0--baseline-stabilization"
    P0_STAB_EPICS["PLAT-01 to PLAT-05 <br/> Git, CI Baseline, Deps"]

    %% Phase 1 - Security
    P1_SEC["Phase 1: Production Security (v1.2)"]
    click P1_SEC "file:///d:/Q-Sight%20Command%20Center/docs/product-suite-roadmap/PHASED_ROADMAP.md#phase-1--production-security-foundation"
    P1_SPIKE["SEC-01: Azure AD Spike"]:::spike
    P1_AUTH["SEC-02 to SEC-04 <br/> REST/WS Auth Middleware"]
    P1_TENANT["SEC-06: Tenant Boundary"]
    P1_SECRETS["SEC-07: Secrets Vault"]
    P1_RATE["SEC-08 to SEC-09 <br/> CORS & Rate Limiting"]
    P1_AUDIT["SEC-10: Audit Immutability"]

    %% Phase 2 - Observability
    P2_OBS["Phase 2: Observability & Operations (v1.3)"]
    click P2_OBS "file:///d:/Q-Sight%20Command%20Center/docs/product-suite-roadmap/PHASED_ROADMAP.md#phase-2--operations--observability"
    P2_LOGS["OBS-01 to OBS-03 <br/> Logs, Health Dash"]
    P2_FEED["OBS-04 to OBS-06 <br/> Feed Monitor, Alerts"]
    P2_OPS["OBS-07 to OBS-08 <br/> L1 Runbook, Metrics API"]

    %% Phase 3 - Admin
    P3_ADM["Phase 3: Admin & Config (v1.4)"]
    click P3_ADM "file:///d:/Q-Sight%20Command%20Center/docs/product-suite-roadmap/PHASED_ROADMAP.md#phase-3--admin--configuration-suite"
    P3_UI["PROD-01 to PROD-07 <br/> Site & Asset Admin UI"]
    P3_RULES["PROD-08 to PROD-10 <br/> Rules & Audit UI"]
    P3_UX["UX-01 & UX-04 <br/> Admin UX & Onboarding"]

    %% Phase 4 - Alerts
    P4_ALT["Phase 4: Alert Workflow (v1.5)"]
    click P4_ALT "file:///d:/Q-Sight%20Command%20Center/docs/product-suite-roadmap/PHASED_ROADMAP.md#phase-4--alert-workflow--evidence-operations"
    P4_SCHEMA["ALERT-01: Alert DB Schema"]
    P4_LIFE["ALERT-02 to ALERT-06 <br/> Alert Lifecycle APIs & UX"]
    P4_SLA["ALERT-07 to ALERT-09 <br/> SLA, Escalate, Notify"]
    P4_EV["ALERT-10 to ALERT-11 <br/> Evidence Export & FP Tag"]
    P4_UX_FLOWS["UX-02 & UX-03 <br/> Alert Workflow & Evidence UX"]

    %% Phase 5 - Advanced
    P5_ADV["Phase 5: Advanced Intelligence (v2.0-alpha)"]
    click P5_ADV "file:///d:/Q-Sight%20Command%20Center/docs/product-suite-roadmap/PHASED_ROADMAP.md#phase-5--advanced-intelligence-layer"
    P5_INGEST["DATA-01 to DATA-06 <br/> Source Cache & Reliability"]
    P5_SGP4["DATA-07: SGP4 Spike"]:::spike
    P5_MAP["DATA-08 to DATA-09 <br/> Replay & Geo-Correlation"]

    %% Phase 6 - Commercial
    P6_COM["Phase 6: Deployment & Commercial (v2.0)"]
    click P6_COM "file:///d:/Q-Sight%20Command%20Center/docs/product-suite-roadmap/PHASED_ROADMAP.md#phase-6--enterprise-deployment--commercial-packaging"
    P6_DEPLOY["PLAT-06 to PLAT-10 <br/> Helm, Rollback, Backups"]
    P6_PACK["COM-01 to COM-10 <br/> Pricing, Support, FAQs"]

    %% Dependencies
    P0_STAB --> P0_STAB_EPICS
    P0_STAB_EPICS --> P1_SPIKE
    P1_SPIKE --> P1_AUTH
    P0_STAB_EPICS --> P1_SECRETS
    P1_AUTH --> P1_TENANT
    P1_AUTH --> P1_RATE
    P1_AUTH --> P1_AUDIT
    
    %% Phase 1 blocks Phase 2/3/4/5
    P1_AUTH --> P2_LOGS
    P1_TENANT --> P3_UI
    P1_AUTH --> P4_SCHEMA
    
    %% Observability can run in parallel with Admin
    P2_LOGS --> P2_FEED
    P2_FEED --> P2_OPS
    
    P3_UI --> P3_RULES
    P3_UI --> P3_UX
    P3_RULES --> P4_SCHEMA
    
    P4_SCHEMA --> P4_LIFE
    P4_LIFE --> P4_SLA
    P4_LIFE --> P4_EV
    P4_LIFE --> P4_UX_FLOWS
    
    %% Phase 5 and 6 details
    P4_EV --> P5_INGEST
    P5_INGEST --> P5_SGP4
    P5_SGP4 --> P5_MAP
    
    P4_EV --> P6_DEPLOY
    P6_DEPLOY --> P6_PACK
```

---

## 2. Epics Blocking Staging & Production Releases (P0 Blockers)

These epics must be fully implemented, tested, and audited before the platform can transition out of a simulated staging environment:

1. **SEC-01 (Azure AD Spike) & SEC-02 (Frontend Login)**: Block all user-facing access. Simulated headers (`x-q-sight-role`) represent a critical exploit vector.
2. **SEC-03 (REST JWT Middleware) & SEC-04 (WebSocket Auth Handshake)**: Block backend deployment. Without these, the API accepts unauthorized data queries and WebSocket telemetry subscriptions.
3. **SEC-06 (Tenant/Org Isolation)**: Blocks multi-tenant enterprise pilots. Tenancy isolation middleware must be implemented at the router level.
4. **PLAT-01 (Git Branching) & PLAT-02 (CI Pipeline)**: Block active multi-developer sprints. Code stabilization cannot be maintained manually.
5. **PLAT-06 (Migration Strategy)**: Blocks database updates. Schema evolution must be automated and backward-compatible.

---

## 3. Parallel Workstream Analysis

Once Phase 1 (Security Foundation) is deployed, engineering tasks can split into three parallel workstreams to optimize delivery speed:

*   **Workstream A: Core Operations & Alerting (Backend + UX)**
    *   *Epics*: ALERT-01 to ALERT-11, UX-02, UX-03.
    *   *Focus*: Building persistent database alert tables, state-transition REST controllers, and operator alert management dashboards.
*   **Workstream B: Administration & Tenant Controls (Frontend + API)**
    *   *Epics*: PROD-01 to PROD-10, UX-01.
    *   *Focus*: Developing site, asset, and camera CRUD interfaces and restricting configurations to Supervisor/Admin roles.
*   **Workstream C: Infrastructure, Observability & Platform (DevOps)**
    *   *Epics*: OBS-01 to OBS-08, PLAT-07 to PLAT-10.
    *   *Focus*: Centralizing logs, setting up Prometheus metric exporters, writing backup/restore bash/powershell tasks, and drafting staging verification gates.

---

## 4. Key Technical Spikes and Decision Points

The team must execute the following spikes and capture administrative decisions before Phase 3 and Phase 5 engineering:

*   **SEC-01 (Azure AD Integration Spike)**: 
    *   *Objective*: Verify OIDC discovery endpoints, configure client redirection configurations in Azure Portal, and confirm scope-mapping to internal database roles.
    *   *Trigger*: Blocks Phase 1 start.
*   **DATA-07 (SGP4 Orbital Propagation Spike)**:
    *   *Objective*: Benchmarking the CPU overhead of running satellite.js in Node worker processes vs. client-side JS rendering.
    *   *Trigger*: Blocks Phase 5 (Advanced Intelligence).
*   **D-03 Revisit (Docker Compose vs. Kubernetes)**:
    *   *Objective*: Operational review of pilot scale. If a customer demands deployment across a clustered environment rather than a single virtual machine, we must pivot from Docker Compose to Helm-managed Kubernetes.
    *   *Trigger*: Standard exit gate of Phase 5.
