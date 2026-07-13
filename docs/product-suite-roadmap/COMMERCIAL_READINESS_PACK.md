# Commercial Readiness Pack

This document outlines the commercial onboarding requirements, support models, pricing assumptions, and FAQs needed to transition Q-Sight from a pilot deployment to a commercial offering.

---

## 1. Commercial Collateral Artifact Outlines

### A. Product One-Pager Outline
*   **Header**: Q-Sight: Industrial Spatial Intelligence Cockpit.
*   **Value Statement**: Real-time telemetry, geofence, and compliance monitoring for industrial assets.
*   **Key Features**: CesiumJS visualizer, multi-feed integration, secure RBAC audit trail.
*   **Exclusions Sidebar**: Explicitly state: "Metadata-only camera logs. No surveillance, video streams, or biometric tracking."

### B. Security & Privacy Brief Outline
*   **Abstract**: Privacy-by-design architecture overview.
*   **Tenancy**: Logical isolation model using tenant ID discriminator variables.
*   **Safety Scanner**: Automated static analysis preventing code leaks.
*   **Audit Trail**: Immutable compliance ledger tracking query logs.

---

## 2. Onboarding Implementation Checklist

The customer onboarding process follows these steps:

- [ ] **Infrastructure Provisioning**: Verify that the staging virtual machine (4 vCPU, 8GB RAM minimum) is online.
- [ ] **Network Ports**: Whitelist port `80` (Web UI), `443` (SSO redirect), and port `4000` (Fastify REST/WS API).
- [ ] **Azure AD Registration**: Create an App Registration in the customer's tenant and share client configurations.
- [ ] **Data Credentials**: Configure API tokens for CelesTrak and OpenSky.
- [ ] **Environment Seeding**: Load site polygon boundaries into the PostgreSQL DB using migration runner.
- [ ] **UAT Run**: Execute verification scripts and log outputs.

---

## 3. Support & SLA Model

*   **Triage Levels**:
    *   *L1 Support*: General map loading errors and UI questions. (Target response: 4 hours).
    *   *L2 Support*: API timeouts, DB locks, and ingestion worker errors. (Target response: 8 hours).
    *   *L3 Support*: Critical security exploits, tenant data leakage, or VM downtime. (Target response: 1 hour).
*   **Escalation Path**: Support ticket -> Operations Engineer -> Lead Developer -> Security Architect.

---

## 4. Pricing Model Assumptions

*   **Tier 1: Single Site Pilot**: Standard docker compose setup, local mock mode enabled, 30-day support. (Flat fee: $10,000).
*   **Tier 2: Enterprise Command Center**: Multi-site configuration, Azure AD SSO integration, 5 telemetry feeds, 9x5 L2 SLA. ($5,000 / month / site).
*   **Tier 3: Mission Critical High-Availability**: Multi-region databases, WORM compliant logs, 24/7 support SLA. (Custom quote).

---

## 5. Customer Pilot FAQ

*   **Q: Does Q-Sight store live video feeds from security cameras?**
    *   *A*: No. Q-Sight operates under a strict metadata-only rule. It registers physical assets and status logs, but does not capture, store, or stream video files.
*   **Q: Is individual pedestrian movement tracked on the map?**
    *   *A*: No. The platform tracks inanimate industrial assets (planes, satellites) and environmental anomalies (earthquakes). Tracking humans or crowds is prohibited.
*   **Q: Can Q-Sight run inside air-gapped networks?**
    *   *A*: Yes. The Docker Compose staging setup can operate completely offline using mock data generators or internal telemetry feeds.

---

## 6. Pilot-to-Paid Conversion Checklist

To successfully convert a pilot customer to a paid subscription, the following criteria must be met:

- [ ] **100% UAT Success**: All role-based test cases completed.
- [ ] **Safety Certification**: Safety scanner logs verified by client compliance officer.
- [ ] **Tenant Isolation Signoff**: Security review confirms tenant boundaries hold.
- [ ] **Performance Validation**: Map view runs at 30+ FPS during telemetry streams.
- [ ] **Commercial Agreement**: Pricing tier selected and signed.
