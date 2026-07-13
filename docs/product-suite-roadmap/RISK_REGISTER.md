# Risk Register

This risk register outlines the technical, compliance, and delivery risks identified for the Q-Sight Product Suite.

---

| Risk ID | Risk Title | Phase | Likelihood | Impact | Mitigation Strategy | Owner | Blocking? |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **R-01** | Azure AD Integration delays | 1 | Medium | High | Start the security spike early in Phase 1; establish local mock JWT configuration templates for developers. | Security Architect | **Yes** (Staging exit) |
| **R-02** | WebSocket performance at scale | 1 | Low | Medium | Implement connection pooling; plan load testing during Phase 2; enforce single-use ticket timeouts. | Lead Backend | No |
| **R-03** | Upstream API connection blockages | 5 | High | Medium | Enforce conservative minimum polling intervals; deploy a local cache fallback database. | Lead Ingestion | No |
| **R-04** | Surveillance scope creep | All | High | Critical | Execute automated safety scans in CI; reject feature additions that violate the metadata camera rule. | Product Owner | **Yes** (Release exit) |
| **R-05** | CesiumJS client memory leaks | All | Medium | Medium | Track component mount cycles; perform memory profile checkouts during frontend UAT checks. | Lead Frontend | No |
| **R-06** | Database connection pool exhaustion | 4 | Medium | High | Use connection pool managers (e.g., pg-pool); adjust Fastify pool sizes; log execution times. | Lead Backend | **Yes** (Prod entry) |
| **R-07** | Staging migration data loss | 6 | Low | High | Require SQL rollback scripts for every database change; back up before executing staging builds. | DevOps Engineer | **Yes** (Deploy gate) |
| **R-08** | Keyboard accessibility failures | 3 | Medium | Medium | Perform regular WCAG audits on Admin UI pages during Phase 3; integrate tab-index tests. | Lead Frontend | No |
| **R-09** | Multi-tenant query leak | 1 | Low | Critical | Implement row-level security (RLS) in PostgreSQL; enforce tenant filters in backend query builders. | Security Architect | **Yes** (Prod entry) |
| **R-10** | Workspace hoisting compilation errors | 0 | Medium | Medium | Lock workspace dependencies in package.json; resolve esbuild vulnerabilities during Phase 0. | DevOps Engineer | **Yes** (Stab entry) |
