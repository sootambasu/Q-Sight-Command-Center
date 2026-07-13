# Risk Register

| Risk | Likelihood | Impact | Mitigation | Owner | Target Phase | Pilot Blocking |
|---|---|---|---|---|---|---|
| Simulated auth / no JWT yet | High | Medium | Currently using deterministic mock auth. Need real SSO (Azure AD) before production. | Security | Production | No |
| OpenSky rate limits | High | Medium | Implemented 120s minimum interval in scheduler. | Backend | Pilot | No |
| Keyless map fallback | High | Low | Cesium ION token may be needed for higher resolution imagery. | Frontend | Pilot | No |
| No production observability | Medium | High | Audit logs stay local/in DB. Need external sink. | DevOps | Staging | No |
| TLE point fallback (no full SGP4) | High | Low | UI displays points instead of projected paths. | Frontend | Post-Pilot | No |
| Local Docker only, no Kubernetes/Helm | High | Medium | Operations rely on docker-compose prototype. | DevOps | Production | No |
| Lack of external log sink for audit logs | High | High | If database is corrupted, audit logs might be lost. | Security | Staging | No |
| Dependency/version risk | Medium | Medium | 7 known npm vulnerabilities exist. Classified as pilot-safe since they require direct API exposure without WAF. | DevOps | Ongoing | No |
| Manual demo fallback dependency | High | Low | UI relies on mock toggle for offline scenarios. | Product | Pilot | No |
