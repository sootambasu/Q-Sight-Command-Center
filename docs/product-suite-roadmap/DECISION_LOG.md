# Decision Log

This log captures key architectural and product decisions, their rationales, and the triggers that would require them to be revisited.

---

| Decision ID | Decision Summary | Rationale | Alternatives Considered | Impact | Revisit Trigger |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **D-01** | **Camera Metadata-only Rule** | Compliance with strict privacy and safety mandates. Prevents surveillance liabilities. | Live RTSP streaming, HLS streaming. | Reduces infrastructure costs, ensures compliance. | **Never** |
| **D-02** | **Azure AD / Entra ID Auth** | Alignment with B2B customer ecosystems and enterprise security requirements. | Custom database authentication, Auth0. | Standardizes token validation; reduces auth code size. | Customer request |
| **D-03** | **Docker Compose for Staging** | Kubernetes is too complex for single-node pilot staging. | Helm charts / Kubernetes clusters. | Simplifies deployment for initial proof of concepts. | Multi-node scaling requirements |
| **D-04** | **No AI Assistant before v2.0** | Focus engineering resources on core pipeline stability and security first. | LLM Copilot integration, chat windows. | Saves development time for core features. | Post-v2.0 roadmap |
| **D-05** | **SGP4 Deferral to Phase 5** | Static database coordinates are sufficient for pilot verification runs. | Immediate SGP4 integration. | Accelerates the initial release schedule. | Operator accuracy complaints |
| **D-06** | **Alert Persistence Model** | Write alerts to a dedicated database table with state histories instead of keeping them client-side. | localStorage replication, file logs. | Enables audit trailing and SLA reporting. | Performance degradation |
| **D-07** | **Observability Stack (Prom/Datadog)**| Use Prometheus for metrics and standard JSON logs (Filebeat-compatible) for sinks. | OpenTelemetry metrics, custom log databases. | Minimizes memory overhead on staging VMs. | Customer infrastructure mandates |
| **D-08** | **Tenant Isolation Model** | Implement database-level logical separation using a tenant discriminator column. | Separate databases, separate schemas. | Reduces hosting costs for staging. | Enterprise compliance requirements |
