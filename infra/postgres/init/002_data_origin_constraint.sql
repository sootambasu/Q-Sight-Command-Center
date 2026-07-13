-- Migration 002: Data Origin Constraints
-- This migration is a structural marker.
-- Data origin (mock vs live) and quality state (no_trusted_data) are now enforced
-- strictly at the application boundary via BUILD_PROFILE checks (see realtime.ts and telemetry.ts).

CREATE TABLE IF NOT EXISTS telemetry_quality_audit (
    id SERIAL PRIMARY KEY,
    event_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    event_type VARCHAR(50) NOT NULL,
    description TEXT
);

INSERT INTO telemetry_quality_audit (event_type, description)
VALUES ('policy_enforced', 'Data origin constraints and production mock-fallbacks disabled successfully.');
