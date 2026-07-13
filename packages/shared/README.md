# Shared Package (packages/shared)

A shared package for utilities, TypeScript type definitions, validation schemas, and database interface helpers.

## Contents
- **Types**: Shared TypeScript interfaces for telemetry data (aircraft, satellite footprints, seismic logs), camera registry configurations, and audit events.
- **Validation**: Zod/Ajv schemas to validate inputs at the API gateway and workers (e.g., verifying camera registry entries).
- **PostGIS Helpers**: Common utilities for converting GeoJSON coordinates to WKT (Well-Known Text) geometries.
- **Security Checkers**: Helper functions to confirm feed registration hashes and audit logging signatures.
