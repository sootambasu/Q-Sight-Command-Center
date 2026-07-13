# Sensor Metadata Registry Architecture

## Introduction
The Sensor Metadata Registry replaces the legacy Camera System. It tracks basic operational metadata for industrial sensors across the fleet without storing connection credentials.

## Schema Changes
The 'authorized_cameras' table was migrated to 'sensor_registry'.
- **Removed**: stream_url, verification_hash
- **Added**: sensor_category (e.g., 'camera'), registration_status (e.g., 'registered', 'suspended', 'decommissioned')

## API
- **Endpoint**: GET /api/sensors/registry
- **Security**: 
  - Authenticated route requiring 'cameras:summary:read' (to be renamed to 'sensors:summary:read' in a future iteration).
  - RBAC redaction strips 'latitude', 'longitude', 'owner_id', etc. for basic operators.
  - Hardened against unauthorized metadata exfiltration.
