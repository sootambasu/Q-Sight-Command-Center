# Phase 1 Legacy Documentation Cleanup Report

## Files Inspected
- README.md
- docs/architecture.md
- docs/database-schema.md
- docs/product-requirements.md
- docs/data-sources.md
- docs/security-guardrails.md
- docs/CONTRIBUTING.md
- docs/decision-log.md
- Various runbooks and historical audit documents (docs/demo-runbook.md, docs/final-handover.md, docs/audit/*, etc.)

## Files Changed
- docs/database-schema.md
- docs/architecture.md
- docs/data-sources.md
- docs/product-requirements.md
- docs/security-guardrails.md
- README.md
- Historical and runbook files in docs/ and docs/audit/

## Search Terms Used
- enterprise-grade
- production-ready
- stream_url
- verification_hash
- live camera streams
- video streams
- WebRTC
- RTSP
- HLS
- fallback to mock
- fall back to local mock data
- mock fallback
- automatic emergency shutdown
- automated shutdown
- immutable audit
- x-q-sight-role
- Node.js >= v18
- v18 or later
- authorized_cameras
- camera feeds
- camera registry
- live operations video

## Corrections Applied
- **docs/database-schema.md**: Replaced uthorized_cameras with sensor_registry. Removed stream_url and erification_hash. Added note about video streaming exclusion. Renamed idx_cameras_location to idx_sensor_location.
- **docs/architecture.md**: Clarified mock fallback behaviors (disabled in production). Updated RBAC wording to indicate developer simulation headers are ignored/rejected in production. Cleaned up camera stream references.
- **docs/data-sources.md**: Rewrote camera-stream language, replacing it with sensor metadata. Added open-data feed advisory clarification (delays, rate limits). Re-iterated unsupported features (RTSP, WebRTC, facial recognition).
- **docs/product-requirements.md**: Ensured camera registry references were migrated to sensor registry. Validated safety guardrails and advisory-only wording.
- **docs/security-guardrails.md**: Clarified audit log append-only status and the requirement for external replication for enterprise-grade immutability. Updated RBAC simulation requirements.
- **README.md**: Updated Node.js requirement to 22. Added note that Phase 1 implementation remains unauthorized. Updated camera authorization references to sensor authorization.
- **Historical Docs/Runbooks**: Prepended the requested Historical note: caveat to 20 old audit, pilot, handover, and runbook documents to preserve context without full rewrites.

## Remaining Historical Caveats / Items Intentionally Not Changed
Remaining occurrences of risky terms were left intact because they fall into the following acceptable categories:
- **ACCEPTABLE safety prohibition**: E.g., CONTRIBUTING.md, decision-log.md, security-guardrails.md explicitly banning WebRTC, live camera streams, RTSP, stream_url.
- **ACCEPTABLE code/path reference**: Security scanner scripts checking for the absence of stream_url or erification_hash.
- **ACCEPTABLE historical reference with supersession note**: Documents like demo-script.md or old docs/audit/* reports now feature the historical top note.

## Confirmation
- **Product Code**: Confirmed that NO product code was modified.
- **Phase 1 Implementation**: Confirmed that implementation remains unauthorized until formal sign-off.
