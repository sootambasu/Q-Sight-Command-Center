# Capability Status Matrix

| Capability | Status | Notes |
|------------|--------|-------|
| Authentication & AuthZ | WIP | Currently uses insecure mocked headers. Full auth system pending integration. |
| Audit Logging | Basic | Implemented as local append-only database triggers. Not yet "immutable" or anchored to external SIEM. |
| Telemetry Ingestion | Basic | Supports basic simulated parsing (earthquakes, planes, satellites). |
| Real-time Updates | Basic | Basic WebSocket integration functional. |
| Automated Shutdowns | OUT OF SCOPE | Q-Sight is strictly an advisory-only tool. It does not and will not autonomously trigger emergency shutdowns. |
