/**
 * apps/api/src/routes/realtime.ts
 * V0.6 — Real-time WebSocket Telemetry & Safe Geofence Alerts
 *
 * SCOPE: Non-camera mechanical/geospatial telemetry only.
 * EXCLUDED: camera streams, video, biometrics, person tracking, facial recognition.
 *
 * NOTE: Role simulation via query params is DEVELOPMENT-ONLY.
 * Production must use proper JWT/session-based auth.
 */

import { FastifyInstance } from 'fastify';
import type { SocketStream } from '@fastify/websocket';
import { UserRole, ROLE_PERMISSIONS, Permission } from '../auth/roles';
import { logAuditEvent } from '../audit/auditLogger';
import { mockAircrafts, mockSatellites, mockSeismicEvents, mockAssets } from '../mock-data';
import { AircraftPosition, SatelliteOrbitPoint, SeismicEvent } from '@q-sight/shared';
import { pool } from '../db';


// =============================================================================
// Configuration
// =============================================================================

const HEARTBEAT_MS = parseInt(process.env.WS_HEARTBEAT_MS || '25000', 10);
const AIRCRAFT_BROADCAST_MS = parseInt(process.env.WS_MOCK_BROADCAST_MS || '7000', 10);
const SATELLITE_BROADCAST_MS = AIRCRAFT_BROADCAST_MS * 2; // ~14s
const SEISMIC_BROADCAST_MS = AIRCRAFT_BROADCAST_MS * 5;  // ~35s

// Audit log throttle for WS heartbeats (do not spam audit log on every heartbeat)
const wsAuditThrottle = new Map<string, number>();
const WS_AUDIT_COOLDOWN_MS = 120000; // 2 minutes

// =============================================================================
// Channel-to-Permission mapping
// Each subscription channel requires a specific RBAC permission.
// Camera channels are explicitly absent.
// =============================================================================

const CHANNEL_PERMISSIONS: Record<string, Permission> = {
  'telemetry.aircraft':  'telemetry:read',
  'telemetry.satellite': 'telemetry:read',
  'telemetry.seismic':   'telemetry:read',
  'alerts.geofence':     'assets:read',
};

// Auditor is blocked from all operational channels
const AUDITOR_BLOCKED_CHANNELS = new Set([
  'telemetry.aircraft',
  'telemetry.satellite',
  'telemetry.seismic',
  'alerts.geofence',
]);

// =============================================================================
// Mock broadcaster state — slightly mutates coordinates to simulate motion.
// Does NOT write to the database.
// =============================================================================

let liveAircrafts: AircraftPosition[] = mockAircrafts.map(a => ({ ...a }));
let liveSatellites: SatelliteOrbitPoint[] = mockSatellites.map(s => ({ ...s }));
let liveSeismic: SeismicEvent[] = mockSeismicEvents.map(e => ({ ...e }));

/** Apply a tiny coordinate drift to simulate aircraft motion */
function driftAircraft(plane: AircraftPosition): AircraftPosition {
  const latDelta = (Math.random() - 0.5) * 0.04;
  const lonDelta = (Math.random() - 0.5) * 0.06;
  const altDelta = (Math.random() - 0.5) * 200;
  const headingDelta = (Math.random() - 0.5) * 5;

  return {
    ...plane,
    latitude: Math.max(-89.9, Math.min(89.9, plane.latitude + latDelta)),
    longitude: Math.max(-179.9, Math.min(179.9, plane.longitude + lonDelta)),
    altitude_meters: plane.altitude_meters != null
      ? Math.max(1000, plane.altitude_meters + altDelta)
      : plane.altitude_meters,
    heading_degrees: plane.heading_degrees != null
      ? ((plane.heading_degrees + headingDelta + 360) % 360)
      : plane.heading_degrees,
    last_contact: new Date().toISOString(),
  };
}

/** Slightly shift a satellite footprint centroid to simulate orbital motion */
function driftSatellite(sat: SatelliteOrbitPoint): SatelliteOrbitPoint {
  if (!sat.footprint?.coordinates?.[0]) return { ...sat, updated_at: new Date().toISOString() };

  const lonDelta = (Math.random() - 0.5) * 2.0;
  const latDelta = (Math.random() - 0.5) * 0.5;

  const shifted = sat.footprint.coordinates[0].map(([lon, lat]) => [
    Math.max(-179.9, Math.min(179.9, lon + lonDelta)),
    Math.max(-89.9, Math.min(89.9, lat + latDelta)),
  ]);

  return {
    ...sat,
    footprint: { type: 'Polygon', coordinates: [shifted] },
    updated_at: new Date().toISOString(),
  };
}

// =============================================================================
// Geofence check helpers — mechanical objects only
// PROHIBITED: person tracking, crowd alerts, facial recognition, biometric checks
// =============================================================================

/**
 * Check if a point (lat/lon) is within a rectangular bounding box.
 * This is a safe, simplified check for demonstration purposes.
 */
function isPointInAssetBoundary(
  lat: number,
  lon: number,
  coords: number[][]
): boolean {
  if (coords.length < 4) return false;
  const lons = coords.map(c => c[0]);
  const lats = coords.map(c => c[1]);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  return lon >= minLon && lon <= maxLon && lat >= minLat && lat <= maxLat;
}

/**
 * Haversine distance in km between two points.
 */
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// =============================================================================
// Build WS message envelope — safe, no credentials/secrets/camera data
// =============================================================================

function buildMessage(
  type: string,
  payload: Record<string, any>,
  source: 'mock' | 'database' | 'system' = 'mock'
): string {
  return JSON.stringify({
    type,
    timestamp: new Date().toISOString(),
    source,
    payload,
  });
}

// =============================================================================
// WebSocket Route
// =============================================================================

export async function realtimeRoutes(fastify: FastifyInstance) {
  /**
   * GET /ws/realtime
   *
   * WebSocket endpoint for non-camera real-time telemetry.
   * Dev-only: role resolved from query params ?role=...&user_id=...
   * Production: replace with JWT/session validation.
   */
  fastify.get('/ws/realtime', { websocket: true }, async (connection: SocketStream, request) => {
    const socket = connection.socket; // ws WebSocket instance
    const query = request.query as Record<string, string>;

    // --- Dev-only role resolution from query params ---
    // IMPORTANT: This is DEVELOPMENT-ONLY. Query-param roles are NOT secure.
    // Production must validate via JWT/session cookies, never query params.
    const roleParam = (query.role || 'operator').toLowerCase();
    const userIdParam = query.user_id || `dev_${roleParam}`;
    const requestId = `ws_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const validRoles: UserRole[] = ['operator', 'supervisor', 'auditor', 'admin'];
    const role: UserRole = validRoles.includes(roleParam as UserRole)
      ? roleParam as UserRole
      : 'operator';

    const permissions = ROLE_PERMISSIONS[role] || [];

    fastify.log.info(
      `[WS] Connection opened — user: ${userIdParam}, role: ${role}, ip: ${request.ip}`
    );

    // Audit: WebSocket connection opened (throttled)
    const connectKey = `ws_connect:${userIdParam}`;
    const lastConnectLog = wsAuditThrottle.get(connectKey) || 0;
    if (Date.now() - lastConnectLog > WS_AUDIT_COOLDOWN_MS) {
      wsAuditThrottle.set(connectKey, Date.now());
      logAuditEvent({
        operator_id: userIdParam,
        role,
        action: 'ws_connection_opened',
        target_type: 'websocket',
        target_id: '/ws/realtime',
        request_id: requestId,
        route: '/ws/realtime',
        metadata: {
          message: 'WebSocket connection established.',
          dev_note: 'Role from query param — development only.',
        },
      }).catch(() => {}); // fire-and-forget
    }

    // Subscribed channels for this connection
    const subscribedChannels = new Set<string>();

    // Send initial connected event
    socket.send(buildMessage('system.websocket.connected', {
      message: 'Connected to Q-Sight real-time telemetry feed.',
      role,
      user_id: userIdParam,
      // DEV NOTE: Query-param role is dev-only. Production uses JWT auth.
      dev_note: 'Role simulation via query param is DEVELOPMENT-ONLY.',
      allowed_channels: Object.keys(CHANNEL_PERMISSIONS).filter(ch => {
        if (role === 'auditor') return false;
        const perm = CHANNEL_PERMISSIONS[ch];
        return perm ? permissions.includes(perm) : false;
      }),
    }, 'system'));

    // --- Heartbeat timer ---
    const heartbeatTimer = setInterval(() => {
      if (socket.readyState === socket.OPEN) {
        socket.send(buildMessage('system.websocket.heartbeat', {
          uptime_seconds: Math.floor(process.uptime()),
        }, 'system'));
      }
    }, HEARTBEAT_MS);

    // --- Mock broadcaster: aircraft deltas ---
    const aircraftTimer = setInterval(async () => {
      if (socket.readyState !== socket.OPEN) return;
      if (!subscribedChannels.has('telemetry.aircraft')) return;

      let planesToStream: AircraftPosition[] = [];
      let source: 'mock' | 'database' = 'mock';

      if (pool) {
        try {
          const query = `
            SELECT 
              icao24, 
              callsign, 
              origin_country, 
              altitude_meters, 
              velocity_mps, 
              heading_degrees, 
              ST_Y(coordinates) as latitude, 
              ST_X(coordinates) as longitude, 
              last_contact, 
              updated_at 
            FROM aircraft_positions
            WHERE updated_at >= NOW() - INTERVAL '1 minute';
          `;
          const res = await pool.query(query);
          if (res.rows.length > 0) {
            planesToStream = res.rows.map(row => ({
              icao24: row.icao24,
              callsign: row.callsign ? row.callsign.trim() : null,
              origin_country: row.origin_country,
              altitude_meters: row.altitude_meters ? parseFloat(row.altitude_meters) : null,
              velocity_mps: row.velocity_mps ? parseFloat(row.velocity_mps) : null,
              heading_degrees: row.heading_degrees ? parseFloat(row.heading_degrees) : null,
              latitude: parseFloat(row.latitude),
              longitude: parseFloat(row.longitude),
              last_contact: row.last_contact,
            }));
            source = 'database';
          }
        } catch (err: any) {
          fastify.log.error(err, 'WebSocket aircraft database query failed');
        }
      }

      if (planesToStream.length === 0) {
        // Fallback to mock drift simulation
        liveAircrafts = liveAircrafts.map(driftAircraft);
        planesToStream = liveAircrafts;
        source = 'mock';
      }

      for (const plane of planesToStream) {
        socket.send(buildMessage('telemetry.aircraft.delta', {
          icao24: plane.icao24,
          callsign: plane.callsign,
          origin_country: plane.origin_country,
          latitude: plane.latitude,
          longitude: plane.longitude,
          altitude_meters: plane.altitude_meters,
          velocity_mps: plane.velocity_mps,
          heading_degrees: plane.heading_degrees,
          last_contact: plane.last_contact,
        }, source));

        // Geofence check for aircraft crossing asset boundaries
        if (subscribedChannels.has('alerts.geofence')) {
          for (const asset of mockAssets) {
            if (!asset.boundary?.coordinates?.[0]) continue;
            const inBoundary = isPointInAssetBoundary(
              plane.latitude,
              plane.longitude,
              asset.boundary.coordinates[0]
            );
            if (inBoundary) {
              const alert = {
                alert_id: `alert_${plane.icao24}_${asset.id}_${Date.now()}`,
                alert_type: 'asset_boundary_enter' as const,
                asset_id: asset.id || 'unknown',
                asset_name: asset.name,
                source_type: 'aircraft' as const,
                source_id: plane.icao24,
                severity: 'watch' as const,
                message: `Aircraft ${plane.callsign || plane.icao24} entered monitored asset boundary: ${asset.name}.`,
                timestamp: new Date().toISOString(),
              };
              socket.send(buildMessage('alert.geofence.enter', alert, source));

              // Audit geofence alert (throttled)
              const alertKey = `geofence:${plane.icao24}:${asset.id}`;
              const lastAlertLog = wsAuditThrottle.get(alertKey) || 0;
              if (Date.now() - lastAlertLog > WS_AUDIT_COOLDOWN_MS) {
                wsAuditThrottle.set(alertKey, Date.now());
                logAuditEvent({
                  operator_id: userIdParam,
                  role,
                  action: 'geofence_alert_emitted',
                  target_type: 'industrial_asset',
                  target_id: asset.id || 'unknown',
                  request_id: requestId,
                  route: '/ws/realtime',
                  metadata: {
                    alert_type: 'asset_boundary_enter',
                    source_type: 'aircraft',
                    source_id: plane.icao24,
                    asset_name: asset.name,
                  },
                }).catch(() => {});
              }
            }
          }
        }
      }
    }, AIRCRAFT_BROADCAST_MS);

    // --- Mock broadcaster: satellite deltas ---
    const satelliteTimer = setInterval(async () => {
      if (socket.readyState !== socket.OPEN) return;
      if (!subscribedChannels.has('telemetry.satellite')) return;

      let satsToStream: SatelliteOrbitPoint[] = [];
      let source: 'mock' | 'database' = 'mock';

      if (pool) {
        try {
          const query = `
            SELECT 
              norad_id, 
              name, 
              updated_at 
            FROM satellite_orbits
            WHERE updated_at >= NOW() - INTERVAL '24 hours';
          `;
          const res = await pool.query(query);
          if (res.rows.length > 0) {
            satsToStream = res.rows.map(row => ({
              norad_id: parseInt(row.norad_id, 10),
              name: row.name,
              updated_at: row.updated_at,
              tle_line1: '',
              tle_line2: '',
            }));
            source = 'database';
          }
        } catch (err: any) {
          fastify.log.error(err, 'WebSocket satellite database query failed');
        }
      }

      if (satsToStream.length === 0) {
        liveSatellites = liveSatellites.map(driftSatellite);
        satsToStream = liveSatellites;
        source = 'mock';
      }

      for (const sat of satsToStream) {
        let centroid = null;
        if (sat.footprint?.coordinates?.[0]) {
          const pts = sat.footprint.coordinates[0];
          const lon = pts.reduce((s: number, p: number[]) => s + p[0], 0) / pts.length;
          const lat = pts.reduce((s: number, p: number[]) => s + p[1], 0) / pts.length;
          centroid = { lat, lon };
        } else {
          // If reading from DB (no footprint), let's lookup in mockSatellites or drift
          const mockSat = mockSatellites.find(s => s.norad_id === sat.norad_id);
          if (mockSat?.footprint?.coordinates?.[0]) {
            const pts = mockSat.footprint.coordinates[0];
            const lonDelta = (Math.random() - 0.5) * 2.0;
            const latDelta = (Math.random() - 0.5) * 0.5;
            const lon = pts.reduce((s: number, p: number[]) => s + p[0], 0) / pts.length + lonDelta;
            const lat = pts.reduce((s: number, p: number[]) => s + p[1], 0) / pts.length + latDelta;
            centroid = { lat, lon };
          } else {
            centroid = { lat: 0, lon: 0 };
          }
        }

        socket.send(buildMessage('telemetry.satellite.delta', {
          norad_id: sat.norad_id,
          name: sat.name,
          footprint_centroid: centroid,
          updated_at: sat.updated_at || new Date().toISOString(),
        }, source));
      }
    }, SATELLITE_BROADCAST_MS);

    // --- Mock broadcaster: seismic events (less frequent) ---
    const seismicTimer = setInterval(async () => {
      if (socket.readyState !== socket.OPEN) return;
      if (!subscribedChannels.has('telemetry.seismic')) return;

      let events: SeismicEvent[] = [];
      let source: 'mock' | 'database' = 'mock';

      if (pool) {
        try {
          const query = `
            SELECT 
              usgs_id, 
              place, 
              magnitude, 
              depth_km, 
              event_time, 
              ST_Y(location) as latitude, 
              ST_X(location) as longitude 
            FROM seismic_events
            WHERE created_at >= NOW() - INTERVAL '24 hours';
          `;
          const res = await pool.query(query);
          if (res.rows.length > 0) {
            events = res.rows.map(row => ({
              usgs_id: row.usgs_id,
              place: row.place,
              magnitude: parseFloat(row.magnitude),
              depth_km: parseFloat(row.depth_km),
              latitude: parseFloat(row.latitude),
              longitude: parseFloat(row.longitude),
              event_time: row.event_time,
            }));
            source = 'database';
          }
        } catch (err: any) {
          fastify.log.error(err, 'WebSocket seismic database query failed');
        }
      }

      if (events.length === 0) {
        events = liveSeismic;
        source = 'mock';
      }

      const randomEvent = events[Math.floor(Math.random() * events.length)];
      if (!randomEvent) return;

      socket.send(buildMessage('telemetry.seismic.delta', {
        usgs_id: randomEvent.usgs_id,
        place: randomEvent.place,
        magnitude: randomEvent.magnitude,
        depth_km: randomEvent.depth_km,
        latitude: randomEvent.latitude,
        longitude: randomEvent.longitude,
        event_time: randomEvent.event_time,
      }, source));

      // Check if seismic event is near any industrial asset boundary
      if (subscribedChannels.has('alerts.geofence')) {

        for (const asset of mockAssets) {
          const dist = haversineKm(
            randomEvent.latitude,
            randomEvent.longitude,
            asset.latitude,
            asset.longitude
          );
          const PROXIMITY_RADIUS_KM = 100;
          if (dist <= PROXIMITY_RADIUS_KM) {
            const alert = {
              alert_id: `seismic_alert_${randomEvent.usgs_id}_${asset.id}_${Date.now()}`,
              alert_type: 'seismic_near_asset' as const,
              asset_id: asset.id || 'unknown',
              asset_name: asset.name,
              source_type: 'seismic' as const,
              source_id: randomEvent.usgs_id,
              severity: randomEvent.magnitude >= 5.0 ? 'warning' as const : 'info' as const,
              message: `Seismic event M${randomEvent.magnitude.toFixed(1)} detected within ${dist.toFixed(0)} km of industrial asset: ${asset.name}.`,
              timestamp: new Date().toISOString(),
            };
            socket.send(buildMessage('alert.seismic.near_asset', alert, source));
          }
        }
      }
    }, SEISMIC_BROADCAST_MS);


    // --- Handle incoming client messages ---
    socket.on('message', (rawData: any) => {
      try {
        const msg = JSON.parse(rawData.toString());

        if (msg.type === 'subscribe' && Array.isArray(msg.channels)) {
          const requestedChannels: string[] = msg.channels;
          const granted: string[] = [];
          const denied: string[] = [];

          for (const ch of requestedChannels) {
            // Reject auditor from all operational channels
            if (role === 'auditor' && AUDITOR_BLOCKED_CHANNELS.has(ch)) {
              denied.push(ch);
              continue;
            }

            // Check if channel is valid
            const requiredPermission = CHANNEL_PERMISSIONS[ch];
            if (!requiredPermission) {
              denied.push(ch);
              continue;
            }

            // Check RBAC permission
            if (permissions.includes(requiredPermission)) {
              subscribedChannels.add(ch);
              granted.push(ch);
            } else {
              denied.push(ch);
            }
          }

          // Send subscribe acknowledgment
          socket.send(buildMessage('subscribe.ack', {
            granted,
            denied: denied.map(ch => ({
              channel: ch,
              reason: role === 'auditor' && AUDITOR_BLOCKED_CHANNELS.has(ch)
                ? 'Operational telemetry channels are not permitted for the auditor role.'
                : 'Channel not permitted for current role.',
            })),
          }, 'system'));

          // Send individual error messages for denied channels (per spec)
          for (const ch of denied) {
            socket.send(buildMessage('system.websocket.error', {
              message: role === 'auditor' && AUDITOR_BLOCKED_CHANNELS.has(ch)
                ? 'Operational telemetry channels are not permitted for the auditor role.'
                : 'Channel not permitted for role.',
              channel: ch,
            }, 'system'));
          }

          // Audit: subscription attempt
          const subKey = `ws_sub:${userIdParam}:${requestedChannels.sort().join(',')}`;
          const lastSubLog = wsAuditThrottle.get(subKey) || 0;
          if (Date.now() - lastSubLog > WS_AUDIT_COOLDOWN_MS) {
            wsAuditThrottle.set(subKey, Date.now());

            if (granted.length > 0) {
              logAuditEvent({
                operator_id: userIdParam,
                role,
                action: 'ws_subscription_accepted',
                target_type: 'websocket_channels',
                target_id: granted.join(','),
                request_id: requestId,
                route: '/ws/realtime',
                metadata: { granted, denied_count: denied.length },
              }).catch(() => {});
            }

            if (denied.length > 0) {
              logAuditEvent({
                operator_id: userIdParam,
                role,
                action: 'ws_subscription_denied',
                target_type: 'websocket_channels',
                target_id: denied.join(','),
                request_id: requestId,
                route: '/ws/realtime',
                metadata: { denied, reason: 'Insufficient role permissions for requested channels.' },
              }).catch(() => {});
            }
          }

          fastify.log.info(
            `[WS] Subscription — user: ${userIdParam}, role: ${role} | granted: [${granted}] | denied: [${denied}]`
          );
        }
      } catch (err: any) {
        fastify.log.error(`[WS] Message parse error for user ${userIdParam}:`, err.message);
        if (socket.readyState === socket.OPEN) {
          socket.send(buildMessage('system.websocket.error', {
            message: 'Invalid message format. Expected JSON with type and channels fields.',
          }, 'system'));
        }
      }
    });

    // --- Cleanup on disconnect ---
    socket.on('close', () => {
      clearInterval(heartbeatTimer);
      clearInterval(aircraftTimer);
      clearInterval(satelliteTimer);
      clearInterval(seismicTimer);

      fastify.log.info(`[WS] Connection closed — user: ${userIdParam}, role: ${role}`);

      // Audit: disconnected (throttled, non-spammy)
      const disconnKey = `ws_disconn:${userIdParam}`;
      const lastDisconn = wsAuditThrottle.get(disconnKey) || 0;
      if (Date.now() - lastDisconn > WS_AUDIT_COOLDOWN_MS) {
        wsAuditThrottle.set(disconnKey, Date.now());
        logAuditEvent({
          operator_id: userIdParam,
          role,
          action: 'ws_connection_closed',
          target_type: 'websocket',
          target_id: '/ws/realtime',
          request_id: requestId,
          route: '/ws/realtime',
          metadata: {
            subscribed_channels: Array.from(subscribedChannels),
          },
        }).catch(() => {});
      }
    });

    socket.on('error', (err: Error) => {
      fastify.log.error(`[WS] Socket error for user ${userIdParam}: ${err.message}`);
      clearInterval(heartbeatTimer);
      clearInterval(aircraftTimer);
      clearInterval(satelliteTimer);
      clearInterval(seismicTimer);
    });
  });
}
