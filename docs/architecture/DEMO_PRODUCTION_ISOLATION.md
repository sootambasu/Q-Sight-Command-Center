# Demo and Production Isolation

## Purpose
To ensure that prototype simulation components do not accidentally activate in production environments, Q-Sight relies on `BUILD_PROFILE` environment boundaries.

## Boundary Enforcement
1. **API Layer**: Route handlers in `telemetry.ts` and `realtime.ts` evaluate `config.buildProfile`.
2. **Ingestor Layer**: Standalone worker scripts evaluating `BUILD_PROFILE` at runtime to decide between logging an error or inserting mock arrays.
3. **Infrastructure Layer**: Separate docker-compose files (`docker-compose.demo.yml` vs `docker-compose.production-like.yml`) bind different `.env` profiles. The demo compose mounts mock-friendly environment overrides.

## Developer Guardrails
The default `NODE_ENV=development` will activate the demo profile. However, if any environment strictly sets `NODE_ENV=production` or `BUILD_PROFILE=production`, all simulation capabilities are structurally halted.
