# Findings Register

**Finding ID**: FND-001
**Title**: Application is not tracked in Git (or .git is missing)
**Area**: DevOps
**Severity**: Informational
**Type**: DevOps
**Evidence**: `git status --short` returned "fatal: not a git repository"
**Impact**: May hinder rollback and deployment tracking if this folder is the deployment target.
**Recommendation**: Initialize git repository or confirm this is an intentional deployment export.
**Owner**: DevOps Team
**Pilot blocking**: No
**Deferred acceptable**: Yes

**Finding ID**: FND-002
**Title**: CelesTrak endpoint occasionally returns 503 Service Unavailable
**Area**: Reliability
**Severity**: Low
**Type**: Reliability
**Evidence**: `verify_live_sources.js` showed `[DEGRADED] Satellite fetch failed: HTTP error! Status: 503. Falling back to mock.`
**Impact**: Live satellite data might fall back to mock data intermittently.
**Recommendation**: Increase resilience, maybe cache previous successful fetches. The system correctly degraded gracefully, so impact is minimal.
**Owner**: Backend Team
**Pilot blocking**: No
**Deferred acceptable**: Yes

**Finding ID**: FND-003
**Title**: Missing production observability
**Area**: DevOps
**Severity**: Medium
**Type**: DevOps
**Evidence**: No external log sink for audit logs configured.
**Impact**: Audit logs remain in local console or DB without external shipping (e.g., Datadog, ELK).
**Recommendation**: Add OpenTelemetry or filebeat for shipping logs.
**Owner**: DevOps Team
**Pilot blocking**: No
**Deferred acceptable**: Yes

**Finding ID**: FND-004
**Title**: No full SGP4 rendering for satellites
**Area**: UX
**Severity**: Informational
**Type**: UX
**Evidence**: Walkthrough and hooks specify point fallback instead of SGP4 path generation.
**Impact**: Visual fidelity of satellite tracks is lower than possible.
**Recommendation**: Integrate satellite.js for real orbit paths.
**Owner**: Frontend Team
**Pilot blocking**: No
**Deferred acceptable**: Yes

**Finding ID**: FND-005
**Title**: Mock verification scripts execute live mode
**Area**: Reliability / Test Correctness
**Severity**: Medium
**Type**: Reliability / Test Correctness
**Evidence**: `worker:opensky:mock` logs showed `mode:"live"` during static verification and `ECONNREFUSED` for DB.
**Impact**: False positive results during verification or unintended external network access.
**Recommendation**: Use `cross-env` to strictly enforce mock execution regardless of `.env`.
**Owner**: DevOps Team
**Pilot blocking**: Yes (Resolved via Remediations)
**Deferred acceptable**: No

**Finding ID**: FND-006
**Title**: Docker Compose uses aggressive live ingestion intervals
**Area**: Reliability / DevOps
**Severity**: Medium
**Type**: Reliability / DevOps
**Evidence**: Default interval in templates was set to 30000ms for aircraft.
**Impact**: Risk of aggressive rate-limiting or accidental DDoS on third-party providers.
**Recommendation**: Increase intervals to conservative defaults (120000ms for aircraft, 300000ms for seismic, 86400000ms for satellite).
**Owner**: DevOps Team
**Pilot blocking**: Yes (Resolved via Remediations)
**Deferred acceptable**: No

**Finding ID**: FND-007
**Title**: Docker build uses Node 20 while Cesium dependency requires Node >=22
**Area**: Dependency / DevOps
**Severity**: Medium
**Type**: Dependency / DevOps
**Evidence**: Build logs show EBADENGINE warnings for Cesium packages.
**Impact**: Build instability or runtime crashes.
**Recommendation**: Upgrade Docker base images to `node:22-alpine`.
**Owner**: DevOps Team
**Pilot blocking**: Yes (Resolved via Remediations)
**Deferred acceptable**: No

**Finding ID**: FND-008
**Title**: Docker/npm install reports vulnerabilities
**Area**: Security / Dependency
**Severity**: Medium
**Type**: Security / Dependency
**Evidence**: `npm audit` showed 7 vulnerabilities (6 high).
**Impact**: Potential supply-chain risk.
**Recommendation**: Run safe `npm audit fix` and document remaining dev-only issues.
**Owner**: Security Team
**Pilot blocking**: Conditional (Resolved via Remediations & Documentation)
**Deferred acceptable**: No

**Finding ID**: FND-009
**Title**: Cesium asset copy warning/failure during web Docker build
**Area**: Frontend / Docker
**Severity**: Medium
**Type**: Frontend / Docker
**Evidence**: Docker build no longer shows the Cesium asset-copy failure. The Docker web app responds successfully on http://localhost:5173 with HTTP 200. Final visual globe validation is completed during the controlled pilot rehearsal.
**Impact**: Silent failures in 3D rendering.
**Recommendation**: Resolved.
**Owner**: Frontend Team
**Pilot blocking**: Yes (Resolved with evidence)
**Deferred acceptable**: No

**Finding ID**: FND-010
**Title**: Command evidence log incomplete
**Area**: Documentation / Evidence
**Severity**: Low
**Type**: Documentation / Evidence
**Evidence**: Log lists Docker config only, while logs show build/up/down were executed.
**Impact**: Audit trail gaps.
**Recommendation**: Thoroughly document all pilot, node, and docker commands in the log.
**Owner**: Compliance Team
**Pilot blocking**: No (Resolved via Remediations)
**Deferred acceptable**: No

**Finding ID**: FND-011
**Title**: Docker compose obsolete version key warning
**Area**: DevOps hygiene
**Severity**: Low
**Type**: DevOps hygiene
**Evidence**: `version: '3.8'` in compose file.
**Impact**: Warning noise during compose operations.
**Recommendation**: Remove the top-level version key.
**Owner**: DevOps Team
**Pilot blocking**: No (Resolved via Remediations)
**Deferred acceptable**: Yes

**Finding ID**: FND-012
**Title**: Dockerfile casing warning
**Area**: DevOps hygiene
**Severity**: Low
**Type**: DevOps hygiene
**Evidence**: `FROM ... as ...` syntax instead of `AS`.
**Impact**: Style warning.
**Recommendation**: Use standard uppercase syntax.
**Owner**: DevOps Team
**Pilot blocking**: No (Resolved via Remediations)
**Deferred acceptable**: Yes
