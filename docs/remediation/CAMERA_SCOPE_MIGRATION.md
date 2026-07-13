# Camera Scope Removal and Migration (005)

## Overview
Migration 005 renames the legacy `authorized_cameras` table to `sensor_registry` and permanently drops the prohibited `stream_url` and `verification_hash` columns.

## DB Changes
- `authorized_cameras` renamed to `sensor_registry`.
- Dropped: `stream_url`
- Dropped: `verification_hash`
- Added: `sensor_category` (default 'camera')
- Added: `registration_status` (default 'registered')

## API Changes
- `GET /api/cameras/authorized` deprecated and now returns HTTP 410 Gone.
- `GET /api/sensors/registry` created as the new endpoint for non-secret metadata.

## Rollback
This is a forward-only migration. Re-adding `stream_url` is strictly prohibited by Q-Sight safety guardrails.
