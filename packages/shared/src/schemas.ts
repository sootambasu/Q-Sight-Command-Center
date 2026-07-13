import { z } from 'zod';

// Schema for GeoJSON Polygon or similar geometry definitions
export const PolygonGeometrySchema = z.object({
  type: z.literal('Polygon'),
  coordinates: z.array(z.array(z.array(z.number())))
});

// Industrial Asset Schema
export const IndustrialAssetSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().nullable().optional(),
  type: z.string().min(1, 'Type is required'), // e.g., 'factory', 'pipeline', 'terminal'
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  boundary: PolygonGeometrySchema.nullable().optional(),
  created_at: z.union([z.string(), z.date()]).optional(),
  updated_at: z.union([z.string(), z.date()]).optional()
});

// Aircraft Position Schema (matches OpenSky vector and DB)
export const AircraftPositionSchema = z.object({
  icao24: z.string().min(1, 'ICAO24 code is required'),
  callsign: z.string().max(8).nullable().optional(),
  origin_country: z.string().min(1, 'Origin country is required'),
  altitude_meters: z.number().nullable().optional(),
  velocity_mps: z.number().nullable().optional(),
  heading_degrees: z.number().nullable().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  last_contact: z.union([z.string(), z.date(), z.number()]),
  updated_at: z.union([z.string(), z.date()]).optional()
});

// Satellite Orbit Point Schema (represents satellite cache record)
export const SatelliteOrbitPointSchema = z.object({
  norad_id: z.number().int().positive(),
  name: z.string().min(1, 'Satellite name is required'),
  tle_line1: z.string().min(1),
  tle_line2: z.string().min(1),
  footprint: PolygonGeometrySchema.nullable().optional(),
  updated_at: z.union([z.string(), z.date()]).optional()
});

// Seismic Event Schema (matches USGS reports)
export const SeismicEventSchema = z.object({
  usgs_id: z.string().min(1, 'USGS Event ID is required'),
  place: z.string().min(1, 'Location place description is required'),
  magnitude: z.number().min(-2).max(12),
  depth_km: z.number(),
  event_time: z.union([z.string(), z.date(), z.number()]),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  created_at: z.union([z.string(), z.date()]).optional()
});

// =============================================================================
// Sensor Registry Entry Schema
// Migrated from AuthorizedCameraRegistryEntrySchema (migration 005, 2026-07-13).
// Prohibited fields removed: stream_url, verification_hash
// Complies with Q-Sight P0 Scope Policy: no stream URLs, no access credentials,
// no API tokens, no cryptographic hashes presented as proof of ownership.
// Biometrics, facial recognition, and person tracking remain explicitly excluded.
// =============================================================================
export const SensorRegistryEntrySchema = z.object({
  id: z.string().uuid().optional(),
  asset_id: z.string().uuid().nullable().optional(),
  name: z.string().min(1, 'Sensor name is required'),
  sensor_category: z.string().min(1).default('camera'), // e.g., 'camera', 'environmental', 'seismic', 'thermal'
  status: z.enum(['online', 'offline', 'disabled']).default('offline'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  owner_id: z.string().min(1, 'Owner operator/company ID is required'),
  authorization_status: z.enum(['pending', 'verified', 'revoked']).default('pending'),
  registration_status: z.string().optional().default('registered'),
  authorized_at: z.union([z.string(), z.date()]).nullable().optional(),
  created_at: z.union([z.string(), z.date()]).optional(),
  updated_at: z.union([z.string(), z.date()]).optional()
  // PROHIBITED — the following fields must NEVER be added back:
  // stream_url        — secret access credential
  // verification_hash — cryptographic secret
  // access_token      — authentication credential
  // api_key           — authentication credential
  // playback_config   — stream configuration
});

/**
 * @deprecated Use SensorRegistryEntrySchema instead.
 * AuthorizedCameraRegistryEntrySchema is removed as of migration 005 (2026-07-13).
 * This alias is retained only for backward-compatible type references during the
 * migration window. It will be removed in a future cleanup pass.
 */
export const AuthorizedCameraRegistryEntrySchema = SensorRegistryEntrySchema;

// Access Audit Log Event Schema
export const AuditLogEventSchema = z.object({
  id: z.number().int().positive().optional(),
  operator_id: z.string().min(1, 'Operator ID is required'),
  role: z.string().min(1, 'Role is required'),
  action: z.string().min(1, 'Action is required'),
  target_type: z.string().nullable().optional(),
  target_id: z.string().nullable().optional(), // Sensor UUID, Asset UUID, etc.
  request_id: z.string().min(1, 'Request ID is required'),
  route: z.string().nullable().optional(),
  metadata: z.record(z.any()).nullable().optional(),
  zoom_level: z.number().nullable().optional(),
  view_bounds: PolygonGeometrySchema.nullable().optional(), // spatial viewport bounding box
  timestamp: z.union([z.string(), z.date()]).optional()
});

// =============================================================================
// V0.6 WebSocket Message Schemas
// SCOPE: Non-camera mechanical/geospatial telemetry only.
// EXCLUDED: camera streams, video, biometrics, person tracking, facial recognition.
// =============================================================================

/**
 * Allowed WebSocket message types.
 * Camera stream, video, biometric, or person-tracking types are explicitly excluded.
 */
export const WsMessageTypeSchema = z.enum([
  'telemetry.aircraft.delta',
  'telemetry.satellite.delta',
  'telemetry.seismic.delta',
  'alert.geofence.enter',
  'alert.geofence.exit',
  'alert.seismic.near_asset',
  'system.websocket.connected',
  'system.websocket.heartbeat',
  'system.websocket.error',
  'subscribe',
  'subscribe.ack',
]);

/**
 * Allowed subscription channels.
 * Camera feeds are explicitly excluded from WebSocket channels.
 */
export const WsChannelSchema = z.enum([
  'telemetry.aircraft',
  'telemetry.satellite',
  'telemetry.seismic',
  'alerts.geofence',
]);

/**
 * Base WebSocket message envelope.
 * All WS messages from server to client follow this structure.
 */
export const WsMessageEnvelopeSchema = z.object({
  type: WsMessageTypeSchema,
  timestamp: z.string(), // ISO 8601
  request_id: z.string().optional(),
  source: z.enum(['mock', 'database', 'system']),
  payload: z.record(z.any()),
});

/**
 * Client-to-server subscribe message.
 * Client sends this after connecting to subscribe to channels.
 */
export const WsSubscribeMessageSchema = z.object({
  type: z.literal('subscribe'),
  channels: z.array(WsChannelSchema),
});

/**
 * Safe Geofence Alert Schema.
 * Applies only to mechanical objects and industrial assets.
 * PROHIBITED: person alerts, crowd monitoring, facial recognition, biometric data,
 *             vehicle tracking tied to individuals, law enforcement scoring.
 */
export const WsGeofenceAlertSchema = z.object({
  alert_id: z.string(),
  alert_type: z.enum(['asset_boundary_enter', 'asset_boundary_exit', 'seismic_near_asset']),
  asset_id: z.string(),
  asset_name: z.string(),
  // Source type is a mechanical/geophysical object only — never a person or crowd
  source_type: z.enum(['aircraft', 'satellite', 'seismic']),
  source_id: z.string(),
  severity: z.enum(['info', 'watch', 'warning']),
  // Message uses industrial operations wording only
  message: z.string(),
  timestamp: z.string(),
});
