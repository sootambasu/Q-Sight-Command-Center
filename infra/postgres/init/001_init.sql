-- Ensure PostGIS extension is active
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Industrial Assets Table (stores metadata & spatial boundaries of registered industrial facilities)
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

-- 2. Aircraft Positions Table (populated/updated by OpenSky ingestor worker)
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

-- 3. Satellite Orbits Table (caches TLE parameters and ground coverage footprints)
CREATE TABLE satellite_orbits (
    norad_id INTEGER PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    tle_line1 VARCHAR(70) NOT NULL,
    tle_line2 VARCHAR(70) NOT NULL,
    footprint GEOMETRY(Polygon, 4326), -- Geographical coverage range polygon
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_satellite_footprint ON satellite_orbits USING GIST(footprint);

-- 4. Seismic Events Table (logs hazard events from USGS)
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

-- 5. Authorized Camera Registry Table
-- Represents only owned/authorized industrial feeds. 
-- Strictly excludes face recognition, biometrics, public scraping, and person tracking.
CREATE TABLE authorized_cameras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES industrial_assets(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    stream_url VARCHAR(500) NOT NULL, -- Secret authorized stream address
    status VARCHAR(20) DEFAULT 'offline', -- 'online', 'offline', 'disabled'
    verification_hash VARCHAR(64) NOT NULL, -- Cryptographic signature check (SHA-256)
    location GEOMETRY(Point, 4326) NOT NULL, -- Location coordinate
    owner_id VARCHAR(100) NOT NULL, -- Identification of authorized owner/operator
    authorization_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'verified', 'revoked'
    authorized_at TIMESTAMP WITH TIME ZONE, -- When the stream was verified/authorized
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cameras_location ON authorized_cameras USING GIST(location);

-- 6. Access Audit Logs Table (append-only logs tracking view histories of sensitive assets & feeds)
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    operator_id VARCHAR(100) NOT NULL, -- Logged-in operator ID
    action VARCHAR(50) NOT NULL, -- 'camera_view', 'data_export', 'boundary_zoom'
    target_id VARCHAR(100), -- ID of the camera or asset accessed
    zoom_level NUMERIC(4, 2), -- Zoom level indicator if applicable
    view_bounds GEOMETRY(Polygon, 4326), -- Spatial viewport bounding box of operator
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_operator ON audit_logs(operator_id);
CREATE INDEX idx_audit_view_bounds ON audit_logs USING GIST(view_bounds);

-- Preventative Database Trigger (blocks deletion/updates on audit_logs)
CREATE OR REPLACE FUNCTION prevent_audit_deletion()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Deleting or updating audit logs is strictly forbidden by system policy.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_protect_audit_logs
BEFORE UPDATE OR DELETE ON audit_logs
FOR EACH ROW EXECUTE FUNCTION prevent_audit_deletion();
