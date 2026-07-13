/**
 * apps/web/src/hooks/useRealtime.ts
 * V0.6 — Frontend WebSocket client for real-time non-camera telemetry
 *
 * SCOPE: aircraft, satellite, seismic telemetry deltas and geofence alerts only.
 * EXCLUDED: camera streams, video, biometrics, person tracking.
 *
 * SECURITY NOTE: Browser WebSocket cannot reliably set custom headers.
 * Role is passed via query params for DEVELOPMENT ONLY.
 * Production must use proper token-based or cookie-based authentication.
 */

import { useEffect, useRef, useState, useCallback } from 'react';

// =============================================================================
// Types
// =============================================================================

export type WsConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface WsGeofenceAlertPayload {
  alert_id: string;
  alert_type: 'asset_boundary_enter' | 'asset_boundary_exit' | 'seismic_near_asset';
  asset_id: string;
  asset_name: string;
  source_type: 'aircraft' | 'satellite' | 'seismic';
  source_id: string;
  severity: 'info' | 'watch' | 'warning';
  message: string;
  timestamp: string;
}

export interface WsRealtimeEvent {
  id: string;
  type: string;
  timestamp: string;
  source: 'mock' | 'database' | 'system';
  payload: Record<string, any>;
}

/** Telemetry delta — aircraft position update from WebSocket */
export interface AircraftDelta {
  icao24: string;
  callsign?: string | null;
  origin_country?: string;
  latitude: number;
  longitude: number;
  altitude_meters?: number | null;
  velocity_mps?: number | null;
  heading_degrees?: number | null;
  last_contact?: string;
}

/** Telemetry delta — satellite position update from WebSocket */
export interface SatelliteDelta {
  norad_id: number;
  name: string;
  footprint_centroid?: { lat: number; lon: number } | null;
  updated_at?: string;
}

/** Telemetry delta — seismic event from WebSocket */
export interface SeismicDelta {
  usgs_id: string;
  place: string;
  magnitude: number;
  depth_km: number;
  latitude: number;
  longitude: number;
  event_time?: string;
}

// =============================================================================
// Configuration
// =============================================================================

const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:4000/ws/realtime';
const REALTIME_ENABLED = import.meta.env.VITE_REALTIME_ENABLED !== 'false';

const MAX_RECONNECT_ATTEMPTS = 5;
const INITIAL_RECONNECT_DELAY_MS = 1500;
const MAX_RECONNECT_DELAY_MS = 30000;
const MAX_EVENTS_BUFFER = 50; // Max realtime events kept in memory
const MAX_ALERTS_BUFFER = 30; // Max geofence alerts kept

// Operational channels for subscription
const OPERATIONAL_CHANNELS = [
  'telemetry.aircraft',
  'telemetry.satellite',
  'telemetry.seismic',
  'alerts.geofence',
];

// =============================================================================
// Hook
// =============================================================================

export function useRealtime(
  role: string,
  userId: string,
  realtimeEnabled: boolean = true
) {
  const [connectionStatus, setConnectionStatus] = useState<WsConnectionStatus>('disconnected');
  const [lastMessageAt, setLastMessageAt] = useState<string | null>(null);
  const [reconnectAttempt, setReconnectAttempt] = useState<number>(0);
  const [realtimeEvents, setRealtimeEvents] = useState<WsRealtimeEvent[]>([]);
  const [alerts, setAlerts] = useState<WsGeofenceAlertPayload[]>([]);
  const [aircraftDeltas, setAircraftDeltas] = useState<Map<string, AircraftDelta>>(new Map());
  const [satelliteDeltas, setSatelliteDeltas] = useState<Map<number, SatelliteDelta>>(new Map());
  const [seismicDeltas, setSeismicDeltas] = useState<Map<string, SeismicDelta>>(new Map());

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptRef = useRef<number>(0);
  const isUnmountingRef = useRef<boolean>(false);
  const enabledRef = useRef<boolean>(realtimeEnabled && REALTIME_ENABLED);

  // Keep enabled ref current
  useEffect(() => {
    enabledRef.current = realtimeEnabled && REALTIME_ENABLED;
  }, [realtimeEnabled]);

  // Auditor role does not subscribe to operational telemetry
  const shouldConnectForRole = useCallback((r: string) => {
    return r !== 'auditor' && REALTIME_ENABLED;
  }, []);

  const addRealtimeEvent = useCallback((event: WsRealtimeEvent) => {
    setRealtimeEvents(prev => {
      const updated = [event, ...prev];
      return updated.slice(0, MAX_EVENTS_BUFFER);
    });
  }, []);

  const addAlert = useCallback((alert: WsGeofenceAlertPayload) => {
    setAlerts(prev => {
      const updated = [alert, ...prev];
      return updated.slice(0, MAX_ALERTS_BUFFER);
    });
  }, []);

  const handleMessage = useCallback((raw: string) => {
    try {
      const msg = JSON.parse(raw) as {
        type: string;
        timestamp: string;
        source: 'mock' | 'database' | 'system';
        payload: Record<string, any>;
      };

      const now = new Date().toISOString();
      setLastMessageAt(now);

      const eventId = `rt_${msg.type}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

      // Route message by type
      switch (msg.type) {
        case 'telemetry.aircraft.delta': {
          const p = msg.payload as AircraftDelta;
          if (p.icao24) {
            setAircraftDeltas(prev => {
              const next = new Map(prev);
              next.set(p.icao24, { ...p, last_contact: p.last_contact || now });
              return next;
            });
            addRealtimeEvent({
              id: eventId,
              type: msg.type,
              timestamp: msg.timestamp || now,
              source: msg.source,
              payload: msg.payload,
            });
          }
          break;
        }

        case 'telemetry.satellite.delta': {
          const p = msg.payload as SatelliteDelta;
          if (p.norad_id) {
            setSatelliteDeltas(prev => {
              const next = new Map(prev);
              next.set(p.norad_id, p);
              return next;
            });
          }
          break;
        }

        case 'telemetry.seismic.delta': {
          const p = msg.payload as SeismicDelta;
          if (p.usgs_id) {
            setSeismicDeltas(prev => {
              const next = new Map(prev);
              next.set(p.usgs_id, p);
              return next;
            });
          }
          break;
        }

        case 'alert.geofence.enter':
        case 'alert.geofence.exit':
        case 'alert.seismic.near_asset': {
          const alertPayload = msg.payload as WsGeofenceAlertPayload;
          addAlert(alertPayload);
          addRealtimeEvent({
            id: eventId,
            type: msg.type,
            timestamp: msg.timestamp || now,
            source: msg.source,
            payload: msg.payload,
          });
          break;
        }

        case 'system.websocket.connected': {
          addRealtimeEvent({
            id: eventId,
            type: msg.type,
            timestamp: msg.timestamp || now,
            source: 'system',
            payload: { message: 'Realtime connection established.' },
          });
          break;
        }

        case 'system.websocket.heartbeat':
          // Heartbeat received — no action needed, timestamp already updated
          break;

        case 'system.websocket.error': {
          addRealtimeEvent({
            id: eventId,
            type: msg.type,
            timestamp: msg.timestamp || now,
            source: 'system',
            payload: msg.payload,
          });
          break;
        }

        case 'subscribe.ack':
          // Subscription acknowledgment — optionally log
          if (import.meta.env.MODE === 'development') {
            console.info('[WS] Subscribe ack:', msg.payload);
          }
          break;

        default:
          // Unknown message type — ignore silently in production
          if (import.meta.env.MODE === 'development') {
            console.debug('[WS] Unknown message type:', msg.type);
          }
      }
    } catch (err) {
      if (import.meta.env.MODE === 'development') {
        console.warn('[WS] Failed to parse message:', err);
      }
    }
  }, [addRealtimeEvent, addAlert]);

  const connect = useCallback(() => {
    if (!shouldConnectForRole(role)) {
      setConnectionStatus('disconnected');
      return;
    }
    if (!enabledRef.current) {
      setConnectionStatus('disconnected');
      return;
    }
    if (wsRef.current && wsRef.current.readyState <= WebSocket.OPEN) {
      return; // Already connecting or connected
    }

    // Build WebSocket URL with dev-only role query param
    // DEVELOPMENT-ONLY: Role via query param is NOT production auth
    const wsUrl = `${WS_BASE_URL}?role=${encodeURIComponent(role)}&user_id=${encodeURIComponent(userId)}`;

    setConnectionStatus('connecting');

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      if (isUnmountingRef.current) { ws.close(); return; }
      setConnectionStatus('connected');
      reconnectAttemptRef.current = 0;
      setReconnectAttempt(0);

      // Subscribe to operational channels (auditor is blocked server-side too, but we gate client-side)
      if (shouldConnectForRole(role)) {
        const subscribeMsg = JSON.stringify({
          type: 'subscribe',
          channels: OPERATIONAL_CHANNELS,
        });
        ws.send(subscribeMsg);
      }
    };

    ws.onmessage = (event) => {
      if (isUnmountingRef.current) return;
      handleMessage(event.data);
    };

    ws.onclose = (event) => {
      if (isUnmountingRef.current) return;
      wsRef.current = null;
      setConnectionStatus('disconnected');

      // Add disconnection event
      const now = new Date().toISOString();
      addRealtimeEvent({
        id: `rt_disconn_${Date.now()}`,
        type: 'system.websocket.error',
        timestamp: now,
        source: 'system',
        payload: {
          message: 'Realtime connection lost; polling fallback active.',
          code: event.code,
        },
      });

      // Auto-reconnect with exponential backoff
      if (!isUnmountingRef.current && enabledRef.current && shouldConnectForRole(role)) {
        const attempts = reconnectAttemptRef.current;
        if (attempts < MAX_RECONNECT_ATTEMPTS) {
          const delay = Math.min(
            INITIAL_RECONNECT_DELAY_MS * Math.pow(2, attempts),
            MAX_RECONNECT_DELAY_MS
          );
          reconnectAttemptRef.current += 1;
          setReconnectAttempt(reconnectAttemptRef.current);

          if (import.meta.env.MODE === 'development') {
            console.info(`[WS] Reconnecting in ${delay}ms (attempt ${reconnectAttemptRef.current}/${MAX_RECONNECT_ATTEMPTS})...`);
          }

          reconnectTimerRef.current = setTimeout(() => {
            if (!isUnmountingRef.current) connect();
          }, delay);
        } else {
          setConnectionStatus('error');
          addRealtimeEvent({
            id: `rt_maxretry_${Date.now()}`,
            type: 'system.websocket.error',
            timestamp: new Date().toISOString(),
            source: 'system',
            payload: {
              message: `Realtime reconnection failed after ${MAX_RECONNECT_ATTEMPTS} attempts. REST polling continues.`,
            },
          });
        }
      }
    };

    ws.onerror = () => {
      if (import.meta.env.MODE === 'development') {
        console.warn('[WS] WebSocket error occurred.');
      }
      // onclose will handle reconnect
    };
  }, [role, userId, shouldConnectForRole, handleMessage, addRealtimeEvent]);

  const disconnect = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setConnectionStatus('disconnected');
  }, []);

  const manualReconnect = useCallback(() => {
    reconnectAttemptRef.current = 0;
    setReconnectAttempt(0);
    disconnect();
    setTimeout(() => connect(), 200);
  }, [connect, disconnect]);

  // Connect on mount / when role changes
  useEffect(() => {
    isUnmountingRef.current = false;

    if (realtimeEnabled && REALTIME_ENABLED && shouldConnectForRole(role)) {
      connect();
    } else {
      setConnectionStatus('disconnected');
    }

    return () => {
      isUnmountingRef.current = true;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [role, realtimeEnabled]); // Re-run when role changes

  const clearAlerts = useCallback(() => setAlerts([]), []);

  return {
    connectionStatus,
    lastMessageAt,
    reconnectAttempt,
    maxReconnectAttempts: MAX_RECONNECT_ATTEMPTS,
    realtimeEvents,
    alerts,
    aircraftDeltas,
    satelliteDeltas,
    seismicDeltas,
    manualReconnect,
    disconnect,
    clearAlerts,
    isEnabled: realtimeEnabled && REALTIME_ENABLED,
  };
}
