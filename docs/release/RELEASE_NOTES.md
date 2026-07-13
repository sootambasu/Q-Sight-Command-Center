# Release Notes

## Version: 0.1.0

### Focus
Baseline stabilization and foundational architecture validation.

### Capabilities
- Initial integration of CesiumJS globe.
- Real-time telemetry ingestion stubs (Earthquakes, OpenSky, Satellites).
- Append-only audit logging for sensitive endpoints.

### Clarifications & Limitations
- **Advisory Only**: Q-Sight provides advisory decision support only. It does NOT autonomously trigger emergency shutdowns, issue control commands to equipment, or guarantee real-time data accuracy.
- **Authentication**: Current authentication is mocked for development purposes and is not secure for production.
- **Audit Logging**: The audit logging system currently relies on local database triggers to maintain an append-only state. This does not constitute an enterprise-grade immutable ledger.
