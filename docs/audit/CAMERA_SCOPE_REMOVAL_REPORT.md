Historical note: This document predates Phase 0 acceptance. Where this document conflicts with docs/audit/PHASE_0_ACCEPTANCE_NOTE.md, docs/phase1/PHASE_1_PLANNING_BRIEF.md, or docs/phase1/PHASE_1_DOCUMENTATION_CONSISTENCY_PREFLIGHT.md, the newer Phase 0/Phase 1 governance documents take precedence.

# Camera Scope Removal Report

## Overview
This document records the removal of the camera streaming scope and its replacement with a secure sensor metadata registry.

## Actions Taken
1. Removed prohibited 'stream_url' and 'verification_hash' columns from the database (Migration 005).
2. Deprecated the '/api/cameras/authorized' endpoint, modifying it to return HTTP 410 Gone.
3. Created a new '/api/sensors/registry' endpoint returning safe, non-secret metadata only.
4. Updated all mock data to strip prohibited camera credentials.
5. Adapted the frontend to consume the new sensor registry API.

## Security Validation
- No stream credentials remain in the schema.
- Role-based redaction continues to secure location and ownership metadata for basic operators.
- Validated via database schema inspection and API response parsing.

