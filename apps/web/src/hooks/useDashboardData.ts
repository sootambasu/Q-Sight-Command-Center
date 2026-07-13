import { useState, useCallback, useMemo } from 'react';
import {
  fetchHealth,
  fetchDbHealth,
  fetchAssets,
  fetchAircrafts,
  fetchSatellites,
  fetchSeismicEvents,
  fetchSensors,
  fetchAuditLogs,
  fetchAuditSummary,
  ApiResponse,
  AuditSummaryItem
} from '../api';
import {
  IndustrialAsset,
  AircraftPosition,
  SatelliteOrbitPoint,
  SeismicEvent,
  AuditLogEvent,
  SensorRegistryEntry
} from '@q-sight/shared';

export interface TimelineItem {
  id: string;
  category: 'aircraft' | 'satellite' | 'seismic' | 'camera' | 'asset';
  title: string;
  timestamp: string; // ISO string
  description: string;
  source: 'database' | 'mock' | 'live' | 'offline' | 'live_disabled' | 'live_fallback';
}

export type SourceMode = 'database' | 'mock' | 'offline' | 'live' | 'live_disabled' | 'live_fallback';

export interface SourceModes {
  assets: SourceMode;
  aircraft: SourceMode;
  satellites: SourceMode;
  seismic: SourceMode;
  cameras: SourceMode;
}


export interface LastSuccessTimeouts {
  assets: string | null;
  aircraft: string | null;
  satellites: string | null;
  seismic: string | null;
  cameras: string | null;
  health: string | null;
}

export function useDashboardData() {
  // Data states (stale data is preserved if updates fail)
  const [assets, setAssets] = useState<IndustrialAsset[]>([]);
  const [aircrafts, setAircrafts] = useState<AircraftPosition[]>([]);
  const [satellites, setSatellites] = useState<SatelliteOrbitPoint[]>([]);
  const [seismicEvents, setSeismicEvents] = useState<SeismicEvent[]>([]);
  const [cameras, setCameras] = useState<SensorRegistryEntry[]>([]);

  // Compliance Audit states
  const [auditLogs, setAuditLogs] = useState<AuditLogEvent[]>([]);
  const [auditSummary, setAuditSummary] = useState<AuditSummaryItem[]>([]);
  const [auditLoading, setAuditLoading] = useState<boolean>(false);
  const [auditError, setAuditError] = useState<string | null>(null);

  // Active simulated role
  const [simulatedRole, setSimulatedRole] = useState<string>(
    localStorage.getItem('q-sight-simulated-role') || 'operator'
  );

  // Connectivity states
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  const [dbPostgis, setDbPostgis] = useState<string>('');

  // Source modes per endpoint: 'database' | 'mock' | 'offline'
  const [sources, setSources] = useState<SourceModes>({
    assets: 'offline',
    aircraft: 'offline',
    satellites: 'offline',
    seismic: 'offline',
    cameras: 'offline'
  });

  // Last successful sync timestamps per endpoint
  const [lastSuccess, setLastSuccess] = useState<LastSuccessTimeouts>({
    assets: null,
    aircraft: null,
    satellites: null,
    seismic: null,
    cameras: null,
    health: null
  });

  // Error states per source
  const [errors, setErrors] = useState<{ [key: string]: string | null }>({
    assets: null,
    aircraft: null,
    satellites: null,
    seismic: null,
    cameras: null,
    health: null
  });

  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [lastRefreshResult, setLastRefreshResult] = useState<'success' | 'partial_failure' | 'failure' | null>(null);

  // Layer toggles
  const [layerVisibility, setLayerVisibility] = useState({
    assets: true,
    aircraft: true,
    satellites: true,
    seismic: true,
    cameras: true
  });

  // Fetch compliance audit logs manually (not on polling loop to prevent recursion/runaway records)
  const refreshAuditData = useCallback(async () => {
    const role = localStorage.getItem('q-sight-simulated-role') || 'operator';
    if (role !== 'auditor' && role !== 'admin') {
      return;
    }
    setAuditLoading(true);
    setAuditError(null);
    try {
      const [logsRes, summaryRes] = await Promise.all([
        fetchAuditLogs({ limit: 50 }),
        fetchAuditSummary()
      ]);
      setAuditLogs(logsRes.items);
      setAuditSummary(summaryRes.items);
    } catch (err: any) {
      setAuditError(err.message || 'Failed to fetch compliance audit records.');
    } finally {
      setAuditLoading(false);
    }
  }, []);

  // Unified load callback
  const refreshAll = useCallback(async () => {
    setIsRefreshing(true);
    const nowStr = new Date().toISOString();
    let apiSuccess = false;
    let hasError = false;

    // 1. Health check
    try {
      const health = await fetchHealth();
      setApiOnline(true);
      apiSuccess = true;
      setLastSuccess(prev => ({ ...prev, health: nowStr }));
      setErrors(prev => ({ ...prev, health: null }));
    } catch (err: any) {
      setApiOnline(false);
      setErrors(prev => ({ ...prev, health: err.message || 'API offline' }));
      hasError = true;
    }

    // 2. DB Health check
    if (apiSuccess) {
      try {
        const dbHealth = await fetchDbHealth();
        if (dbHealth.database === 'connected') {
          setDbConnected(true);
          setDbPostgis(dbHealth.postgis || 'Active');
          setErrors(prev => ({ ...prev, db: null }));
        } else {
          setDbConnected(false);
          setErrors(prev => ({ ...prev, db: dbHealth.reason || 'Disconnected' }));
        }
      } catch (err: any) {
        setDbConnected(false);
        setErrors(prev => ({ ...prev, db: err.message || 'Failed to check DB health' }));
      }
    } else {
      setDbConnected(false);
    }

    // Check current role to restrict network calls (Amendment 4 & 8)
    const role = localStorage.getItem('q-sight-simulated-role') || 'operator';

    // Define individual resource fetcher helper to preserve stale data on failure
    const fetchResource = async <T>(
      fetchFn: () => Promise<ApiResponse<T>>,
      setterFn: (data: T[]) => void,
      key: keyof SourceModes
    ) => {
      try {
        const res = await fetchFn();
        setterFn(res.items);
        
        let mappedSource: SourceMode = res.source;
        if (res.ingestion_status) {
          if (!res.ingestion_status.enabled) {
            mappedSource = 'live_disabled';
          } else if (res.ingestion_status.enabled && res.source === 'mock') {
            mappedSource = 'live_fallback';
          }
        }
        
        setSources(prev => ({ ...prev, [key]: mappedSource }));
        setLastSuccess(prev => ({ ...prev, [key]: res.timestamp || nowStr }));
        setErrors(prev => ({ ...prev, [key]: null }));
      } catch (err: any) {
        setErrors(prev => ({ ...prev, [key]: err.message || 'Fetch failed' }));
        setSources(prev => ({ ...prev, [key]: 'offline' }));
        hasError = true;
      }
    };


    // Auditor role does not poll operational telemetry to respect RBAC limits and avoid denials spam
    if (role === 'auditor') {
      // Do not fetch operational endpoints
      setSources({
        assets: 'offline',
        aircraft: 'offline',
        satellites: 'offline',
        seismic: 'offline',
        cameras: 'offline'
      });
      // Optionally load/refresh audit data if empty, but do not poll it continuously
      if (auditLogs.length === 0) {
        refreshAuditData().catch(err => console.error('Initial audit load failed:', err));
      }
    } else {
      // Operator, Supervisor, and Admin poll operational telemetry
      await Promise.all([
        fetchResource(fetchAssets, setAssets, 'assets'),
        fetchResource(fetchAircrafts, setAircrafts, 'aircraft'),
        fetchResource(fetchSatellites, setSatellites, 'satellites'),
        fetchResource(fetchSeismicEvents, setSeismicEvents, 'seismic'),
        fetchResource(fetchSensors, setCameras, 'cameras')
      ]);
    }

    setLastUpdated(nowStr);
    setIsRefreshing(false);

    if (apiSuccess) {
      setLastRefreshResult(hasError ? 'partial_failure' : 'success');
    } else {
      setLastRefreshResult('failure');
    }
  }, [auditLogs.length, refreshAuditData]);

  // Handle role switches from the selector
  const changeSimulatedRole = useCallback((newRole: string) => {
    localStorage.setItem('q-sight-simulated-role', newRole);
    localStorage.setItem('q-sight-simulated-user-id', `dev_${newRole}`);
    setSimulatedRole(newRole);

    if (newRole === 'auditor') {
      // Hide operational map layers by default for auditor (Amendment 8)
      setLayerVisibility({
        assets: false,
        aircraft: false,
        satellites: false,
        seismic: false,
        cameras: false
      });
      // Clear operational telemetry state so we don't display old paths
      setAssets([]);
      setAircrafts([]);
      setSatellites([]);
      setSeismicEvents([]);
      setCameras([]);
      // Load audit logs immediately
      refreshAuditData().catch(err => console.error('Audit data load failed:', err));
    } else {
      // Reset layer visibility for operators/supervisors/admins
      setLayerVisibility({
        assets: true,
        aircraft: true,
        satellites: true,
        seismic: true,
        cameras: true
      });
      // Clear audit states when leaving auditor views
      setAuditLogs([]);
      setAuditSummary([]);
      // Sync operational telemetry immediately
      refreshAll().catch(err => console.error('Refreshed operational layers failed:', err));
    }
  }, [refreshAll, refreshAuditData]);

  // Simple, deterministic timeline items construction sorted descending by time
  const timelineEvents = useMemo<TimelineItem[]>(() => {
    const items: TimelineItem[] = [];

    // Map Assets
    assets.forEach(asset => {
      const time = asset.updated_at || asset.created_at || lastSuccess.assets || new Date().toISOString();
      items.push({
        id: `timeline_asset_${asset.id}`,
        category: 'asset',
        title: `Asset Registry: ${asset.name}`,
        timestamp: typeof time === 'string' ? time : new Date(time).toISOString(),
        description: `Industrial ${asset.type} online. Location: Lat ${asset.latitude.toFixed(4)}, Lon ${asset.longitude.toFixed(4)}.`,
        source: sources.assets
      });
    });

    // Map Aircraft
    aircrafts.forEach(plane => {
      const time = plane.last_contact || lastSuccess.aircraft || new Date().toISOString();
      const timeStr = typeof time === 'number' 
        ? new Date(time * 1000).toISOString() 
        : typeof time === 'string' ? time : new Date(time).toISOString();
      
      items.push({
        id: `timeline_aircraft_${plane.icao24}`,
        category: 'aircraft',
        title: `Aviation Tracker: Callsign ${plane.callsign || plane.icao24}`,
        timestamp: timeStr,
        description: `Transponder contact ${plane.icao24} origin ${plane.origin_country}. Altitude: ${plane.altitude_meters ? Math.round(plane.altitude_meters) + 'm' : 'N/A'}. Velocity: ${plane.velocity_mps ? Math.round(plane.velocity_mps * 3.6) + 'km/h' : 'N/A'}.`,
        source: sources.aircraft
      });
    });

    // Map Satellites
    satellites.forEach(sat => {
      const time = sat.updated_at || lastSuccess.satellites || new Date().toISOString();
      items.push({
        id: `timeline_satellite_${sat.norad_id}`,
        category: 'satellite',
        title: `Orbital Satellites: ${sat.name}`,
        timestamp: typeof time === 'string' ? time : new Date(time).toISOString(),
        description: `NORAD satellite orbit check. ID: ${sat.norad_id}. Line orbit tracking active.`,
        source: sources.satellites
      });
    });

    // Map Seismic
    seismicEvents.forEach(event => {
      const time = event.event_time || event.created_at || lastSuccess.seismic || new Date().toISOString();
      const timeStr = typeof time === 'number'
        ? new Date(time).toISOString()
        : typeof time === 'string' ? time : new Date(time).toISOString();

      items.push({
        id: `timeline_seismic_${event.usgs_id}`,
        category: 'seismic',
        title: `Seismic Activity: M${event.magnitude.toFixed(1)} - ${event.place}`,
        timestamp: timeStr,
        description: `USGS detected seismic event. Richter: ${event.magnitude} Mw. Depth: ${event.depth_km} km. ID: ${event.usgs_id}.`,
        source: sources.seismic
      });
    });

    // Map Cameras
    cameras.forEach(cam => {
      const time = cam.authorized_at || cam.updated_at || cam.created_at || lastSuccess.cameras || new Date().toISOString();
      items.push({
        id: `timeline_camera_${cam.id}`,
        category: 'camera',
        title: `Camera Feed Registry: ${cam.name}`,
        timestamp: typeof time === 'string' ? time : new Date(time).toISOString(),
        description: `Metadata checked for ${cam.name}. Status: ${cam.status}. Registry: ${cam.authorization_status.toUpperCase()}.`,
        source: sources.cameras
      });
    });

    // Sort descending by timestamp
    return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [assets, aircrafts, satellites, seismicEvents, cameras, sources, lastSuccess]);

  const handleToggleLayer = useCallback((layer: keyof typeof layerVisibility) => {
    setLayerVisibility(prev => ({
      ...prev,
      [layer]: !prev[layer]
    }));
  }, []);

  const handleShowAllLayers = useCallback(() => {
    setLayerVisibility({
      assets: true,
      aircraft: true,
      satellites: true,
      seismic: true,
      cameras: true
    });
  }, []);

  const handleHideAllLayers = useCallback(() => {
    setLayerVisibility({
      assets: false,
      aircraft: false,
      satellites: false,
      seismic: false,
      cameras: false
    });
  }, []);

  return {
    assets,
    aircrafts,
    satellites,
    seismicEvents,
    cameras,
    auditLogs,
    auditSummary,
    auditLoading,
    auditError,
    simulatedRole,
    apiOnline,
    dbConnected,
    dbPostgis,
    sources,
    lastSuccess,
    errors,
    isRefreshing,
    lastUpdated,
    lastRefreshResult,
    layerVisibility,
    timelineEvents,
    handleToggleLayer,
    handleShowAllLayers,
    handleHideAllLayers,
    refreshAll,
    refreshAuditData,
    changeSimulatedRole
  };
}
