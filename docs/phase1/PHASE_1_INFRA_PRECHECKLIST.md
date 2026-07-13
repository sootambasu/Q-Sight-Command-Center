# PHASE 1 INFRASTRUCTURE PRE-CHECKLIST
## Q-Sight Command Center

**Document ID:** PHASE_1_INFRA_PRECHECKLIST  
**Status:** DRAFT — AWAITING ADR WORKSHOP COMPLETION  

---

> [!IMPORTANT]
> The items on this list represent the critical path to unblocking Milestone 1.0 and Milestone 1.1. Procurement, provisioning, and networking for these resources must begin immediately following the ADR Workshop.

---

## 1. Database Infrastructure (Driven by ADR-003)

| Task | Description | Assigned To | Status |
| :--- | :--- | :--- | :--- |
| **Provision Staging DB** | Deploy the selected HA PostgreSQL cluster (RDS/CloudSQL/Patroni) in the staging environment. | _[Name]_ | ☐ Pending |
| **Enable PostGIS** | Ensure the PostGIS extension is installed and enabled on the new staging cluster. | _[Name]_ | ☐ Pending |
| **Network Access** | Configure VPC / Firewall rules so staging worker and API containers can access the DB. | _[Name]_ | ☐ Pending |
| **Secrets** | Store the new HA connection string in the staging secret manager. | _[Name]_ | ☐ Pending |

## 2. Message Broker (Driven by ADR-001)

| Task | Description | Assigned To | Status |
| :--- | :--- | :--- | :--- |
| **Provision Broker** | Deploy the selected broker (RabbitMQ/Kafka/Redis) to the staging environment. | _[Name]_ | ☐ Pending |
| **Network Access** | Ensure broker is accessible from staging API and worker subnets. | _[Name]_ | ☐ Pending |
| **Secrets** | Store broker connection credentials/URIs in the staging secret manager. | _[Name]_ | ☐ Pending |

## 3. Identity Provider (Driven by ADR-002)

| Task | Description | Assigned To | Status |
| :--- | :--- | :--- | :--- |
| **Provision Test Tenant** | Create the staging IDP realm/tenant (Auth0/Keycloak/Okta). | _[Name]_ | ☐ Pending |
| **Configure Claims** | Set up role claim mapping in the IDP to match Q-Sight requirements. | _[Name]_ | ☐ Pending |
| **Test Users** | Create test users representing the required roles (operator, auditor, admin). | _[Name]_ | ☐ Pending |
| **Provide Secrets** | Supply the `OIDC_JWKS_URL`, `OIDC_ISSUER_URL`, and `OIDC_AUDIENCE` to the development team. | _[Name]_ | ☐ Pending |

## 4. CI/CD & Security (Driven by ADR-004 & ADR-006)

| Task | Description | Assigned To | Status |
| :--- | :--- | :--- | :--- |
| **Audit Sink Target** | Provision the SIEM / log group destination and provide the endpoint/keys. | _[Name]_ | ☐ Pending |
| **CI Runner Capacity** | Ensure GitHub Actions (or equivalent) has sufficient capacity for Docker builds and integration tests. | _[Name]_ | ☐ Pending |

---

## Pre-Checklist Sign-off

When all items above are marked complete (or a local-fallback is officially approved by the Engineering Lead to unblock development), notify the Engineering Lead to update the `PHASE_1_KICKOFF_CHECKLIST.md`.
