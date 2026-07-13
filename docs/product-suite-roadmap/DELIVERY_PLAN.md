# Staffing & Delivery Plan

This document outlines staffing scenarios, delivery timelines, engineering weekly cadences, and parallelization strategies for the Q-Sight Product Suite.

---

## 1. Delivery Scenarios & Timelines

### A. Minimum Team (3 Engineers)
*   **Roles**: 1 Full-Stack Dev (UI + API), 1 Ingestion/DB Dev, 1 DevOps/Security Engineer.
*   **Timeline**: **5 Months**.
*   **Characteristics**: Sequential delivery of phases. Security is built first, followed by administration tools, then alerting.

### B. Ideal Team (6 Engineers)
*   **Roles**: 1 Product Owner, 1 Security Architect, 1 Frontend Dev, 1 Backend Dev, 1 Ingestion/DB Dev, 1 DevOps Engineer.
*   **Timeline**: **3 Months**.
*   **Characteristics**: Parallel development streams after Phase 1 security foundation is completed.

### C. Aggressive Timeline (Ideal Team, high concurrency)
*   **Duration**: **8 Weeks**.
*   **Risk**: High regression risk. Requires staging tests to run continuously.

### D. Realistic Timeline (Ideal Team, standard sprint pace)
*   **Duration**: **12 Weeks**.
*   **Breakdown**:
    *   *Phase 0 (Stabilization)*: Weeks 1–2
    *   *Phase 1 (Security)*: Weeks 3–6
    *   *Phase 2 (Observability)*: Weeks 7–8
    *   *Phase 3 (Admin Console)*: Weeks 9–10
    *   *Phase 4 (Alert Operations)*: Weeks 11–12
    *   *Phase 5 & 6 (Intel & Packaging)*: Weeks 13–14 (Post-pilot enhancements)

### E. Conservative Timeline (Minimum Team, buffer included)
*   **Duration**: **20 Weeks**.
*   **Characteristics**: Additional UAT gates and security reviews scheduled between each phase.

---

## 2. Parallelization Plan

After Phase 1 (Security Foundation) is deployed, engineering tasks can split into three parallel workstreams to optimize delivery speed:

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

## 3. Weekly Engineering Cadence

*   **Monday**: Sprint Planning & Backlog Alignment. (Review compliance safety logs).
*   **Wednesday**: Architecture Review & Technical Spikes. (Resolve blocker tickets).
*   **Friday**: Local Verification Run & Demo. (Run verification scripts locally).
