# Database Schema Specification

This document provides the DDL (Data Definition Language) schema definitions for the **Q-Sight Command Center** PostgreSQL database with the **PostGIS** extension.

---

## 1. Extensions Setup
Ensure PostGIS is active in the database:
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

---

## 2. DDL Tables

### A. Industrial Assets Table (`industrial_assets`)
Stores metadata and spatial locations of registered industrial facilities (e.g., factories, pipelines, power plants).
```sql
CREATE TABLE industrial_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL, -- 'factory', 'pipeline', 'terminal', etc.
    location GEOMETRY(Point, 4326) NOT NULL, -- Point location (SRID 4326 WGS84)
    boundary GEOMETRY(Polygon, 4326), -- Optional boundary geofence polygon
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_assets_location ON industrial_assets USING GIST(location);
CREATE INDEX idx_assets_boundary ON industrial_assets USING GIST(boundary);
```

### B. Aircraft Positions Table (`aircraft_positions`)
Updated in real-time by the OpenSky ingestor worker.
```sql
CREATE TABLE aircraft_positions (
    icao24 VARCHAR(24) PRIMARY KEY,
    callsign VARCHAR(8),
    origin_country VARCHAR(100),
    altitude_meters NUMERIC(8, 2),
    velocity_mps NUMERIC(6, 2),
    heading_degrees NUMERIC(5, 2),
    coordinates GEOMETRY(PointZ, 4326) NOT NULL, -- 3D coordinate (Lat, Lon, Alt)
    last_contact TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_aircraft_coordinates ON aircraft_positions USING GIST(coordinates);
```

### C. Satellite Orbits Table (`satellite_orbits`)
Stores cached Two-Line Element parameters and calculated footprints.
```sql
CREATE TABLE satellite_orbits (
    norad_id INTEGER PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    tle_line1 VARCHAR(70) NOT NULL,
    tle_line2 VARCHAR(70) NOT NULL,
    footprint GEOMETRY(Polygon, 4326), -- Geographical coverage range polygon
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_satellite_footprint ON satellite_orbits USING GIST(footprint);
```

### D. Seismic Events Table (`seismic_events`)
Logs USGS hazard detections.
```sql
CREATE TABLE seismic_events (
    usgs_id VARCHAR(50) PRIMARY KEY,
    place VARCHAR(255) NOT NULL,
    magnitude NUMERIC(3, 1) NOT NULL,
    depth_km NUMERIC(6, 2) NOT NULL,
    event_time TIMESTAMP WITH TIME ZONE NOT NULL,
    location GEOMETRY(Point, 4326) NOT NULL, -- Spatial epicenter
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_seismic_location ON seismic_events USING GIST(location);
CREATE INDEX idx_seismic_time ON seismic_events(event_time DESC);
```

### E. Sensor Registry Table (`sensor_registry`)
Registry of verified sensors on industrial assets.
```sql
CREATE TABLE sensor_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES industrial_assets(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'offline', -- 'online', 'offline', 'disabled'
    location GEOMETRY(Point, 4326) NOT NULL, -- Location coordinate
    owner_id VARCHAR(100) NOT NULL, -- Identification of authorized owner/operator
    authorization_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'verified', 'revoked'
    authorized_at TIMESTAMP WITH TIME ZONE, -- When the sensor was verified/authorized
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sensor_location ON sensor_registry USING GIST(location);
```

> **Note:** Video streaming, RTSP, HLS, WebRTC, biometric processing, and person tracking are not part of the accepted Phase 0 baseline and require a separate future security review if ever proposed.

```

### F. Access Audit Logs Table (`audit_logs`)
Append-only logs for tracking view histories of sensitive assets and sensor metadata. Expanded in v0.5 via startup migrations.
```sql
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    operator_id VARCHAR(100) NOT NULL, -- Logged-in operator ID
    role VARCHAR(50),                  -- Simulated user access role (added in v0.5)
    action VARCHAR(50) NOT NULL,       -- Action logged (e.g. 'camera_metadata_view_redacted')
    target_type VARCHAR(50),           -- Resource category accessed (added in v0.5)
    target_id VARCHAR(100),            -- ID of the sensor or asset accessed
    request_id VARCHAR(100),           -- Correlation ID of the HTTP request (added in v0.5)
    route VARCHAR(255),                -- HTTP request path (added in v0.5)
    metadata JSONB,                    -- Structured metadata context (added in v0.5)
    zoom_level NUMERIC(4, 2),          -- Zoom level indicator if applicable
    view_bounds GEOMETRY(Polygon, 4326), -- Spatial viewport bounding box of operator
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_operator ON audit_logs(operator_id);
```

---

## 3. Preventative DB Policies
To enforce security, database triggers can be configured to prevent raw deletions from audit logs:
```sql
CREATE OR REPLACE FUNCTION prevent_audit_deletion()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Deleting or updating audit logs is strictly forbidden by system policy.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_protect_audit_logs
BEFORE UPDATE OR DELETE ON audit_logs
FOR EACH ROW EXECUTE FUNCTION prevent_audit_deletion();
```
