# PHASE 1 ADR DECISION SUMMARY
## Q-Sight Command Center

**Document ID:** PHASE_1_ADR_DECISION_SUMMARY  
**Workshop Date:** _[YYYY-MM-DD]_  

---

> [!NOTE]
> This template is to be filled out during or immediately following the ADR Workshop. Once completed, the decisions recorded here must be transcribed into the official `PHASE_1_ARCHITECTURE_DECISION_RECORDS.md` and `PHASE_1_SIGN_OFF_RECORD.md`.

---

## 1. ADR-003: PostgreSQL High-Availability & RTO

- **Selected Option:** _[Option A (RDS) / Option B (Patroni) / Option C (CloudSQL)]_
- **PATH Decision:** _[PATH 1 (≤ 30s) / PATH 2 (≤ 120s)]_
- **Revised RTO (If PATH 2):** _[e.g., ≤ 120 seconds]_
- **Rationale/Notes:** _[Brief explanation of why this was chosen]_
- **Sign-offs:**
  - Engineering Lead: _[Name / Initials]_
  - Infrastructure Lead: _[Name / Initials]_

## 2. ADR-001: Message Queue Choice

- **Selected Option:** _[RabbitMQ / Kafka / Redis Streams]_
- **Rationale/Notes:** _[Brief explanation of why this was chosen]_
- **Sign-offs:**
  - Engineering Lead: _[Name / Initials]_
  - Infrastructure Lead: _[Name / Initials]_

## 3. ADR-002: IDP/OIDC Provider Choice

- **Selected Option:** _[Auth0 / Keycloak / Okta]_
- **Rationale/Notes:** _[Brief explanation of why this was chosen]_
- **Sign-offs:**
  - Engineering Lead: _[Name / Initials]_
  - Security Lead: _[Name / Initials]_

## 4. ADR-005: Environment Promotion Model

- **Selected Option:** _[Linear 3-tier / GitOps]_
- **Rationale/Notes:** _[Brief explanation of why this was chosen]_
- **Sign-offs:**
  - Engineering Lead: _[Name / Initials]_
  - Infrastructure Lead: _[Name / Initials]_

## 5. ADR-006: CI/CD Quality Gates

- **Selected Option:** _[9-step blocking / Phased warning]_
- **Rationale/Notes:** _[Brief explanation of why this was chosen]_
- **Sign-offs:**
  - Engineering Lead: _[Name / Initials]_
  - DevOps Lead: _[Name / Initials]_

## 6. ADR-004: Audit Sink / SIEM Strategy

- **Selected Option:** _[CloudWatch / Splunk / Datadog]_
- **Rationale/Notes:** _[Brief explanation of why this was chosen]_
- **Sign-offs:**
  - Security Lead: _[Name / Initials]_
  - Infrastructure Lead: _[Name / Initials]_

---

## Next Steps Confirmation

- [ ] All 6 ADRs have a selected option above.
- [ ] If ADR-003 PATH 2 was selected, the GAP-003 target update is assigned to: _________
- [ ] Sign-offs transcribed to `PHASE_1_SIGN_OFF_RECORD.md`.
- [ ] `PHASE_1_INFRA_PRECHECKLIST.md` updated and assigned to Infrastructure team.
