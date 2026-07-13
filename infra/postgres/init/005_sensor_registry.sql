-- =============================================================================
-- Migration 005: Rename authorized_cameras → sensor_registry
-- Remove prohibited secret columns: stream_url, verification_hash
-- Add sensor_category and registration_status columns
-- Applied: 2026-07-13
-- Author: Agent A6 — Camera Scope Removal (Q-Sight P0 Hardening)
-- Rollback: See docs/remediation/CAMERA_SCOPE_MIGRATION.md
-- =============================================================================
-- NOTE: 001_init.sql is NOT modified. This migration is forward-only.
-- PREREQUISITE: infra/postgres/init/001_init.sql must have been applied.
-- =============================================================================

BEGIN;

-- --------------------------------------------------------
-- Step 0: Audit pre-migration state (values NOT exposed)
-- --------------------------------------------------------
DO $$
DECLARE
  rec_count    INTEGER := 0;
  stream_count INTEGER := 0;
  hash_count   INTEGER := 0;
BEGIN
  -- Count total records
  SELECT COUNT(*) INTO rec_count FROM authorized_cameras;

  -- Count records with non-null/non-empty stream_url
  SELECT COUNT(*) INTO stream_count
    FROM authorized_cameras
    WHERE stream_url IS NOT NULL AND stream_url <> '';

  -- Count records with non-null/non-empty verification_hash
  SELECT COUNT(*) INTO hash_count
    FROM authorized_cameras
    WHERE verification_hash IS NOT NULL AND verification_hash <> '';

  RAISE NOTICE '=== Migration 005 Pre-Flight Audit ===';
  RAISE NOTICE 'authorized_cameras: % total record(s)', rec_count;
  RAISE NOTICE 'Records with non-empty stream_url:       %', stream_count;
  RAISE NOTICE 'Records with non-empty verification_hash: %', hash_count;

  IF stream_count > 0 THEN
    RAISE NOTICE 'WARNING: % record(s) contain stream_url values. These will be permanently deleted.', stream_count;
    RAISE NOTICE 'ACTION REQUIRED: Ensure all stream credentials are rotated/revoked before applying in production. Confirm a full database backup exists.';
  END IF;

  IF hash_count > 0 THEN
    RAISE NOTICE 'WARNING: % record(s) contain verification_hash values. These will be permanently deleted.', hash_count;
  END IF;

  RAISE NOTICE '======================================';
END $$;

-- --------------------------------------------------------
-- Step 1: Rename the table
-- --------------------------------------------------------
ALTER TABLE authorized_cameras RENAME TO sensor_registry;

-- --------------------------------------------------------
-- Step 2: Drop prohibited secret columns
-- --------------------------------------------------------
ALTER TABLE sensor_registry DROP COLUMN IF EXISTS stream_url;
ALTER TABLE sensor_registry DROP COLUMN IF EXISTS verification_hash;

-- --------------------------------------------------------
-- Step 3: Rename spatial index
-- --------------------------------------------------------
ALTER INDEX IF EXISTS idx_cameras_location RENAME TO idx_sensor_registry_location;

-- --------------------------------------------------------
-- Step 4: Add new metadata columns
-- --------------------------------------------------------

-- sensor_category: generalises "camera" to any sensor type
ALTER TABLE sensor_registry
  ADD COLUMN IF NOT EXISTS sensor_category VARCHAR(50) NOT NULL DEFAULT 'camera';

-- registration_status: administrative lifecycle state
ALTER TABLE sensor_registry
  ADD COLUMN IF NOT EXISTS registration_status VARCHAR(50) NOT NULL DEFAULT 'registered';

-- --------------------------------------------------------
-- Step 5: Table documentation
-- --------------------------------------------------------
COMMENT ON TABLE sensor_registry IS
  'Authorized Sensor Metadata Registry (migrated from authorized_cameras via migration 005). '
  'Stores non-secret operational metadata for authorized industrial sensors. '
  'Stream URLs and access credentials are strictly prohibited per Q-Sight P0 scope policy.';

COMMENT ON COLUMN sensor_registry.sensor_category IS
  'Category of sensor: camera, environmental, seismic, thermal, etc.';

COMMENT ON COLUMN sensor_registry.registration_status IS
  'Administrative registration lifecycle: registered, suspended, decommissioned.';

COMMENT ON COLUMN sensor_registry.owner_id IS
  'Custodian organisation or operator ID. Not a personal identifier.';

COMMIT;
