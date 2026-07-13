import { z } from 'zod';
import {
  IndustrialAssetSchema,
  AircraftPositionSchema,
  SatelliteOrbitPointSchema,
  SeismicEventSchema,
  SensorRegistryEntrySchema,
  AuthorizedCameraRegistryEntrySchema,
  AuditLogEventSchema,
  PolygonGeometrySchema,
  WsMessageEnvelopeSchema,
  WsSubscribeMessageSchema,
  WsGeofenceAlertSchema,
  WsChannelSchema,
  WsMessageTypeSchema,
  AlertSchema,
} from './schemas';

export type PolygonGeometry = z.infer<typeof PolygonGeometrySchema>;
export type IndustrialAsset = z.infer<typeof IndustrialAssetSchema>;
export type AircraftPosition = z.infer<typeof AircraftPositionSchema>;
export type SatelliteOrbitPoint = z.infer<typeof SatelliteOrbitPointSchema>;
export type SeismicEvent = z.infer<typeof SeismicEventSchema>;

/**
 * Primary sensor registry type (as of migration 005, 2026-07-13).
 * Replaces AuthorizedCameraRegistryEntry.
 * Does NOT include stream_url or verification_hash.
 */
export type SensorRegistryEntry = z.infer<typeof SensorRegistryEntrySchema>;

/**
 * @deprecated Use SensorRegistryEntry instead.
 * Retained as backward-compatible alias during migration window only.
 */
export type AuthorizedCameraRegistryEntry = z.infer<typeof AuthorizedCameraRegistryEntrySchema>;

export type AuditLogEvent = z.infer<typeof AuditLogEventSchema>;

// V0.6 WebSocket types
export type WsMessageEnvelope = z.infer<typeof WsMessageEnvelopeSchema>;
export type WsSubscribeMessage = z.infer<typeof WsSubscribeMessageSchema>;
export type WsGeofenceAlert = z.infer<typeof WsGeofenceAlertSchema>;
export type WsChannel = z.infer<typeof WsChannelSchema>;
export type WsMessageType = z.infer<typeof WsMessageTypeSchema>;

export type Alert = z.infer<typeof AlertSchema>;

