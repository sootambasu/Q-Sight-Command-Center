Historical note: This document predates Phase 0 acceptance. Where this document conflicts with docs/audit/PHASE_0_ACCEPTANCE_NOTE.md, docs/phase1/PHASE_1_PLANNING_BRIEF.md, or docs/phase1/PHASE_1_DOCUMENTATION_CONSISTENCY_PREFLIGHT.md, the newer Phase 0/Phase 1 governance documents take precedence.

# Pilot Freeze Note

- **Freeze Timestamp:** 2026-06-30T14:30:00+05:30
- **Final Verdict:** GO WITH CONDITIONS
- **Current Operating Mode:** Docker workflow (via `infra/docker-compose.prototype.yml`)
- **Fallback Mode:** Native npm workflow (running services locally using `npm run dev`)

## Remaining Post-Pilot Conditions
1. **Production JWT / Azure AD Integration:** Transition from mock token-based / simulated auth to standard enterprise authentication providers.
2. **Observability / External Log Sink:** Set up full metrics/APM agents (e.g., Prometheus, Grafana, OpenTelemetry, Datadog) instead of plain JSON console logging.
3. **Dependency Upgrade Sprint:** Address the remaining hoisted package warnings and perform a comprehensive dependency update.
4. **SGP4 Orbit Rendering:** Transition from rendering 3D satellites as static coordinates to full orbital propagation using SGP4 library dynamics.

## Strict Safety Exclusions
The following capabilities are explicitly omitted and forbidden from this staging candidate:
- Live camera video/image streams, RTSP/HLS player integration, and public CCTV integrations.
- Biometric identification, facial recognition, and person tracking.
- Predictive policing logic or telemetry modeling.
- All spatial camera records remain metadata-only attributes.

## Command Checklist
To spin up the frozen staging release:
1. `npm run verify:static`
2. `npm run safety:verify`
3. `npm run pilot:docker:build`
4. `docker compose -f infra/docker-compose.prototype.yml up -d postgres api web`
5. Verify health check on `http://localhost:4000/health`
6. Verify app on `http://localhost:5173`
7. Tear down: `docker compose -f infra/docker-compose.prototype.yml down`

