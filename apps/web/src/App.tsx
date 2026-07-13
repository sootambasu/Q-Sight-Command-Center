import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import * as Cesium from 'cesium';
import 'cesium/Source/Widgets/widgets.css';
import { useDashboardData } from './hooks/useDashboardData';
import { usePolling } from './hooks/usePolling';
import { useRealtime } from './hooks/useRealtime';
import { formatCoordinate, formatVelocity, formatAltitude, formatUTC } from './utils/formatting';
import { isValidCoordinate, toPolygonHierarchy } from './utils/cesiumGeometry';
import { useDemoScenario } from './hooks/useDemoScenario';
import { useAlertInbox } from './hooks/useAlertInbox';
import { exportPilotEvidence } from './utils/exportEvidence';

import { OperatingModeBanner } from './components/OperatingModeBanner';
import { CommandBar } from './components/CommandBar';
import { MissionRail, RailTab } from './components/MissionRail';
import { TimelineStrip } from './components/TimelineStrip';
import { SourceHealthPanel } from './components/SourceHealthPanel';
import { AlertInbox } from './components/AlertInbox';
import { EntityDetailPanel } from './components/EntityDetailPanel';
import { ExecutiveOverlay } from './components/ExecutiveOverlay';
import { SafetyFooter } from './components/SafetyFooter';

export default function App() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);

  // Hook state management
  const data = useDashboardData();
  const polling = usePolling(data.refreshAll);
  
  // V0.8 Demo Scenario hook
  const demoScenario = useDemoScenario(data.simulatedRole);


  // V0.6: Real-time WebSocket feature toggle
  const [realtimeEnabled, setRealtimeEnabled] = useState<boolean>(true);

  // V0.6: Real-time WebSocket hook
  const realtime = useRealtime(
    data.simulatedRole,
    `dev_${data.simulatedRole}`,
    realtimeEnabled
  );

  // V0.6: Show alerts panel state
  const [showAlertsPanel, setShowAlertsPanel] = useState<boolean>(false);

  // Connection & Env states
  const [hasCesiumToken, setHasCesiumToken] = useState<boolean>(false);
  const envMode = import.meta.env.MODE || 'development';

  // Selected object ID state to keep the detail panel dynamic with polling
  const [selectedEntityInfo, setSelectedEntityInfo] = useState<{
    type: 'asset' | 'aircraft' | 'satellite' | 'seismic' | 'camera';
    id: string;
  } | null>(null);

  const [skippedGeometryCount, setSkippedGeometryCount] = useState<number>(0);

  // Tab selector state for auditor / admin
  const [activeTab, setActiveTab] = useState<RailTab>('globe');
  const [executiveView, setExecutiveView] = useState<boolean>(false);
  const [showPilotChecklist, setShowPilotChecklist] = useState<boolean>(false);
  const [timelineFilter, setTimelineFilter] = useState<string>('All');
  const alertInbox = useAlertInbox();

  // Automatically switch tab based on selected role
  useEffect(() => {
    if (data.simulatedRole === 'auditor') {
      setActiveTab('audit');
    } else {
      setActiveTab('globe');
    }
  }, [data.simulatedRole]);


  // V0.8 overrides for Demo Scenario Mode
  const activeAssets = useMemo(() => demoScenario.demoModeActive ? demoScenario.currentStep.assets : data.assets, [demoScenario.demoModeActive, demoScenario.currentStep.assets, data.assets]);
  const activeAircrafts = useMemo(() => demoScenario.demoModeActive ? demoScenario.currentStep.aircrafts : data.aircrafts, [demoScenario.demoModeActive, demoScenario.currentStep.aircrafts, data.aircrafts]);
  const activeSatellites = useMemo(() => demoScenario.demoModeActive ? demoScenario.currentStep.satellites : data.satellites, [demoScenario.demoModeActive, demoScenario.currentStep.satellites, data.satellites]);
  const activeSeismicEvents = useMemo(() => demoScenario.demoModeActive ? demoScenario.currentStep.seismicEvents : data.seismicEvents, [demoScenario.demoModeActive, demoScenario.currentStep.seismicEvents, data.seismicEvents]);
  const activeAlerts = useMemo(() => demoScenario.demoModeActive ? demoScenario.currentStep.alerts : realtime.alerts, [demoScenario.demoModeActive, demoScenario.currentStep.alerts, realtime.alerts]);
  const activeTimelineEvents = useMemo(() => demoScenario.demoModeActive ? demoScenario.currentStep.timeline : data.timelineEvents, [demoScenario.demoModeActive, demoScenario.currentStep.timeline, data.timelineEvents]);

  // Dynamically resolve selected object attributes from refreshed telemetry collections
  const selectedObject = useMemo(() => {
    if (!selectedEntityInfo) return null;
    const { type, id } = selectedEntityInfo;
    if (type === 'asset') {
      const found = activeAssets.find(x => x.id === id);
      return found ? { type, data: found } : null;
    }
    if (type === 'aircraft') {
      const found = activeAircrafts.find(x => x.icao24 === id);
      return found ? { type, data: found } : null;
    }
    if (type === 'satellite') {
      const found = activeSatellites.find(x => x.norad_id === parseInt(id, 10));
      return found ? { type, data: found } : null;
    }
    if (type === 'seismic') {
      const found = activeSeismicEvents.find(x => x.usgs_id === id);
      return found ? { type, data: found } : null;
    }
    if (type === 'camera') {
      const found = data.cameras.find(x => x.id === id);
      return found ? { type, data: found } : null;
    }
    return null;
  }, [selectedEntityInfo, activeAssets, activeAircrafts, activeSatellites, activeSeismicEvents, data.cameras]);

  
  // Sync alerts to inbox
  useEffect(() => {
    activeAlerts.forEach(alert => {
      const exists = alertInbox.alerts.some(a => a.id === alert.alert_id || a.message === alert.message);
      if (!exists) {
        alertInbox.addAlert({
          timestamp: alert.timestamp,
          severity: alert.severity,
          sourceType: alert.source_type,
          message: alert.message,
          assetName: alert.asset_name,
          sourceId: alert.source_id,
          source: demoScenario.demoModeActive ? 'demo' : 'realtime'
        });
      }
    });
  }, [activeAlerts, demoScenario.demoModeActive]);

  // Initial load
  useEffect(() => {
    data.refreshAll();

    // Check environment variables for Cesium Token
    const token = import.meta.env.VITE_CESIUM_ION_TOKEN;
    setHasCesiumToken(!!token && token !== 'your_cesium_ion_token_here');
  }, []);

  // Initialize Cesium Globe
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const token = import.meta.env.VITE_CESIUM_ION_TOKEN;
    const hasToken = !!token && token !== 'your_cesium_ion_token_here';

    if (hasToken) {
      Cesium.Ion.defaultAccessToken = token;
    }

    // Configure no-key OpenStreetMap provider
    const imageryFallback = new Cesium.OpenStreetMapImageryProvider({
      url: 'https://a.tile.openstreetmap.org/'
    });

    const viewer = new Cesium.Viewer(mapContainerRef.current, {
      geocoder: false,
      homeButton: true,
      sceneModePicker: true,
      baseLayerPicker: true,
      navigationHelpButton: false,
      animation: false,
      timeline: false,
      fullscreenButton: false,
      infoBox: false,
      selectionIndicator: false,
      baseLayer: hasToken ? undefined : new Cesium.ImageryLayer(imageryFallback)
    });

    // Disable default Cesium Ion warning overlay if no token exists
    if (!hasToken) {
      const creditContainer = viewer.bottomContainer as HTMLElement;
      if (creditContainer) {
        creditContainer.style.display = 'none';
      }
    }

    // Set initial view centered on North America / Atlantic view
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(-98.0, 39.0, 10000000.0)
    });

    viewerRef.current = viewer;

    // Listen to mouse clicks to select entities
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((click: any) => {
      const pickedObject = viewer.scene.pick(click.position);
      if (Cesium.defined(pickedObject) && pickedObject.id) {
        const entity = pickedObject.id;
        const props = entity.properties?.getValue(Cesium.JulianDate.now());
        if (props && props.type) {
          let id = '';
          if (props.type === 'asset') id = props.data.id;
          else if (props.type === 'aircraft') id = props.data.icao24;
          else if (props.type === 'satellite') id = String(props.data.norad_id);
          else if (props.type === 'seismic') id = props.data.usgs_id;
          else if (props.type === 'camera') id = props.data.id;

          if (id) {
            setSelectedEntityInfo({ type: props.type, id });
          }
        }
      } else {
        setSelectedEntityInfo(null);
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    return () => {
      handler.destroy();
      viewer.destroy();
      viewerRef.current = null;
    };
  }, []);

  // Sync Cesium entities stably in place
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    const activeIds = new Set<string>();
    let skippedCount = 0;

    // 1. Render Industrial Assets
    if (data.layerVisibility.assets) {
      activeAssets.forEach(asset => {
        const entityId = `asset_${asset.id}`;
        
        // Validate coordinates
        if (!isValidCoordinate(asset.latitude, asset.longitude)) {
          skippedCount++;
          if (envMode === 'development') {
            console.warn(`[Cesium Geometry] Skipping invalid asset coordinates: ${asset.name} (ID: ${asset.id})`);
          }
          // Remove if existed previously
          if (viewer.entities.getById(entityId)) {
            viewer.entities.removeById(entityId);
          }
          return;
        }

        const position = Cesium.Cartesian3.fromDegrees(asset.longitude, asset.latitude);
        activeIds.add(entityId);

        let entity = viewer.entities.getById(entityId);
        // Defensive type check: if entity exists but is not a point, recreate it
        if (entity && !entity.point) {
          viewer.entities.removeById(entityId);
          entity = undefined;
        }

        if (!entity) {
          viewer.entities.add({
            id: entityId,
            position,
            point: {
              pixelSize: 12,
              color: Cesium.Color.CYAN,
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 2
            },
            label: {
              text: asset.name,
              font: '11px JetBrains Mono, monospace',
              fillColor: Cesium.Color.WHITE,
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 2,
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              pixelOffset: new Cesium.Cartesian2(0, -9)
            },
            properties: new Cesium.PropertyBag({
              type: 'asset',
              data: asset
            })
          });
        } else {
          entity.position = position as any;
          entity.properties = new Cesium.PropertyBag({
            type: 'asset',
            data: asset
          }) as any;
        }

        // Boundary Polygon geofence if configured
        const boundaryId = `asset_boundary_${asset.id}`;
        const hasBoundary = asset.boundary && asset.boundary.coordinates && asset.boundary.coordinates[0];
        if (hasBoundary) {
          const points = asset.boundary!.coordinates[0];
          const hierarchy = toPolygonHierarchy(points);
          if (hierarchy) {
            activeIds.add(boundaryId);

            let boundEntity = viewer.entities.getById(boundaryId);
            // Defensive type check: if exists but is not a polygon, recreate
            if (boundEntity && !boundEntity.polygon) {
              viewer.entities.removeById(boundaryId);
              boundEntity = undefined;
            }

            if (!boundEntity) {
              viewer.entities.add({
                id: boundaryId,
                polygon: {
                  hierarchy,
                  material: Cesium.Color.CYAN.withAlpha(0.1),
                  outline: true,
                  outlineColor: Cesium.Color.CYAN,
                  outlineWidth: 1.5
                },
                properties: new Cesium.PropertyBag({
                  type: 'boundary',
                  assetId: asset.id
                })
              });
            } else {
              boundEntity.polygon!.hierarchy = new Cesium.ConstantProperty(hierarchy) as any;
            }
          } else {
            skippedCount++;
            if (envMode === 'development') {
              console.warn(`[Cesium Geometry] Skipping malformed boundary polygon for asset: ${asset.name} (ID: ${asset.id})`);
            }
            if (viewer.entities.getById(boundaryId)) {
              viewer.entities.removeById(boundaryId);
            }
          }
        } else {
          // Clean up boundary entity if it is absent in current data
          if (viewer.entities.getById(boundaryId)) {
            viewer.entities.removeById(boundaryId);
          }
        }
      });
    }

    // 2. Render Aircraft
    if (data.layerVisibility.aircraft) {
      activeAircrafts.forEach(plane => {
        const entityId = `aircraft_${plane.icao24}`;

        if (!isValidCoordinate(plane.latitude, plane.longitude)) {
          skippedCount++;
          if (envMode === 'development') {
            console.warn(`[Cesium Geometry] Skipping invalid aircraft: ${plane.callsign || plane.icao24}`);
          }
          if (viewer.entities.getById(entityId)) {
            viewer.entities.removeById(entityId);
          }
          return;
        }

        const position = Cesium.Cartesian3.fromDegrees(
          plane.longitude,
          plane.latitude,
          plane.altitude_meters || 0
        );
        activeIds.add(entityId);

        let entity = viewer.entities.getById(entityId);
        // Defensive type check: if entity exists but is not a point, recreate
        if (entity && !entity.point) {
          viewer.entities.removeById(entityId);
          entity = undefined;
        }

        if (!entity) {
          viewer.entities.add({
            id: entityId,
            position,
            point: {
              pixelSize: 8,
              color: Cesium.Color.fromCssColorString('#10b981'),
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 1.5
            },
            label: {
              text: plane.callsign || plane.icao24,
              font: '10px JetBrains Mono, monospace',
              fillColor: Cesium.Color.fromCssColorString('#cbd5e1'),
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 2,
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              verticalOrigin: Cesium.VerticalOrigin.TOP,
              pixelOffset: new Cesium.Cartesian2(0, 8)
            },
            properties: new Cesium.PropertyBag({
              type: 'aircraft',
              data: plane
            })
          });
        } else {
          entity.position = position as any;
          entity.properties = new Cesium.PropertyBag({
            type: 'aircraft',
            data: plane
          }) as any;
          if (entity.label) {
            entity.label.text = new Cesium.ConstantProperty(plane.callsign || plane.icao24) as any;
          }
        }
      });
    }

    // 3. Render Satellites (Point-markers only for v0.4)
    if (data.layerVisibility.satellites) {
      activeSatellites.forEach(sat => {
        const entityId = `satellite_${sat.norad_id}`;
        
        let lon = NaN;
        let lat = NaN;
        const hasFootprint = sat.footprint && sat.footprint.coordinates && sat.footprint.coordinates[0];
        
        if (hasFootprint) {
          const coords = sat.footprint!.coordinates[0];
          let validCount = 0;
          let sumLon = 0;
          let sumLat = 0;
          coords.forEach((pt: any) => {
            if (Array.isArray(pt) && pt.length >= 2 && typeof pt[0] === 'number' && typeof pt[1] === 'number') {
              if (isValidCoordinate(pt[1], pt[0])) {
                sumLon += pt[0];
                sumLat += pt[1];
                validCount++;
              }
            }
          });
          if (validCount > 0) {
            lon = sumLon / validCount;
            lat = sumLat / validCount;
          }
        }

        if (!isValidCoordinate(lat, lon)) {
          skippedCount++;
          if (envMode === 'development') {
            console.warn(`[Cesium Geometry] Skipping satellite: ${sat.name} (NORAD: ${sat.norad_id}) due to missing/invalid footprint coordinates.`);
          }
          if (viewer.entities.getById(entityId)) {
            viewer.entities.removeById(entityId);
          }
          return;
        }

        const position = Cesium.Cartesian3.fromDegrees(lon, lat, 400000); // 400km LEO orbit altitude placeholder
        activeIds.add(entityId);

        let entity = viewer.entities.getById(entityId);
        // Defensive type check: if entity exists but is not a point, recreate
        if (entity && !entity.point) {
          viewer.entities.removeById(entityId);
          entity = undefined;
        }

        if (!entity) {
          viewer.entities.add({
            id: entityId,
            position,
            point: {
              pixelSize: 10,
              color: Cesium.Color.fromCssColorString('#a855f7'),
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 1.5
            },
            label: {
              text: sat.name,
              font: '10px JetBrains Mono, monospace',
              fillColor: Cesium.Color.fromCssColorString('#e2e8f0'),
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 2,
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              pixelOffset: new Cesium.Cartesian2(0, -9)
            },
            properties: new Cesium.PropertyBag({
              type: 'satellite',
              data: sat
            })
          });
        } else {
          entity.position = position as any;
          entity.properties = new Cesium.PropertyBag({
            type: 'satellite',
            data: sat
          }) as any;
        }

        // TODO: v0.5/v0.6 orbit path & footprint polygon rendering (disabled in v0.4 to prevent rendering instability)
        // Clean up footprint polygon if it exists in the viewer from a previous render
        const footprintId = `satellite_footprint_${sat.norad_id}`;
        if (viewer.entities.getById(footprintId)) {
          viewer.entities.removeById(footprintId);
        }
      });
    }

    // 4. Render Seismic Events
    if (data.layerVisibility.seismic) {
      activeSeismicEvents.forEach(event => {
        const entityId = `seismic_${event.usgs_id}`;

        if (!isValidCoordinate(event.latitude, event.longitude)) {
          skippedCount++;
          if (envMode === 'development') {
            console.warn(`[Cesium Geometry] Skipping invalid seismic event: ${event.place} (ID: ${event.usgs_id})`);
          }
          if (viewer.entities.getById(entityId)) {
            viewer.entities.removeById(entityId);
          }
          return;
        }

        const position = Cesium.Cartesian3.fromDegrees(event.longitude, event.latitude);
        const radius = Math.max(8, event.magnitude * 4);
        activeIds.add(entityId);

        let entity = viewer.entities.getById(entityId);
        // Defensive type check: if entity exists but is not a point, recreate
        if (entity && !entity.point) {
          viewer.entities.removeById(entityId);
          entity = undefined;
        }

        if (!entity) {
          viewer.entities.add({
            id: entityId,
            position,
            point: {
              pixelSize: radius,
              color: Cesium.Color.fromCssColorString('#f97316').withAlpha(0.7),
              outlineColor: Cesium.Color.fromCssColorString('#ef4444'),
              outlineWidth: 2
            },
            label: {
              text: `M${event.magnitude}`,
              font: '10px JetBrains Mono, monospace',
              fillColor: Cesium.Color.WHITE,
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 2,
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              pixelOffset: new Cesium.Cartesian2(0, -(radius / 2 + 3))
            },
            properties: new Cesium.PropertyBag({
              type: 'seismic',
              data: event
            })
          });
        } else {
          entity.position = position as any;
          entity.properties = new Cesium.PropertyBag({
            type: 'seismic',
            data: event
          }) as any;
        }
      });
    }

    // 5. Render Camera Registry Markers
    if (data.layerVisibility.cameras) {
      data.cameras.forEach(cam => {
        const entityId = `camera_${cam.id}`;

        if (!isValidCoordinate(cam.latitude, cam.longitude)) {
          skippedCount++;
          if (envMode === 'development') {
            console.warn(`[Cesium Geometry] Skipping invalid camera coordinates: ${cam.name} (ID: ${cam.id})`);
          }
          if (viewer.entities.getById(entityId)) {
            viewer.entities.removeById(entityId);
          }
          return;
        }

        const position = Cesium.Cartesian3.fromDegrees(cam.longitude!, cam.latitude!);
        activeIds.add(entityId);

        let entity = viewer.entities.getById(entityId);
        // Defensive type check: if entity exists but is not a point, recreate
        if (entity && !entity.point) {
          viewer.entities.removeById(entityId);
          entity = undefined;
        }

        if (!entity) {
          viewer.entities.add({
            id: entityId,
            position,
            point: {
              pixelSize: 10,
              color: Cesium.Color.fromCssColorString('#eab308'),
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 1.5
            },
            label: {
              text: `📷 ${cam.name}`,
              font: '10px JetBrains Mono, monospace',
              fillColor: Cesium.Color.fromCssColorString('#cbd5e1'),
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 2,
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              pixelOffset: new Cesium.Cartesian2(0, -9)
            },
            properties: new Cesium.PropertyBag({
              type: 'camera',
              data: cam
            })
          });
        } else {
          entity.position = position as any;
          entity.properties = new Cesium.PropertyBag({
            type: 'camera',
            data: cam
          }) as any;
        }
      });
    }

    // Clean up old entities that are no longer in the active layers or datasets
    const allEntityIds: string[] = [];
    for (let i = 0; i < viewer.entities.values.length; i++) {
      allEntityIds.push(viewer.entities.values[i].id);
    }
    allEntityIds.forEach(id => {
      if (!activeIds.has(id)) {
        viewer.entities.removeById(id);
      }
    });

    setSkippedGeometryCount(skippedCount);
  }, [data.layerVisibility, activeAssets, activeAircrafts, activeSatellites, activeSeismicEvents, data.cameras]);

  
    const handleExportEvidence = () => {
      exportPilotEvidence({
        role: data.simulatedRole,
        operatingMode: demoScenario.demoModeActive ? 'demo' : 'live/database',
        demoModeActive: demoScenario.demoModeActive,
        webSocketStatus: realtime.connectionStatus,
        apiStatus: data.apiOnline,
        dbStatus: data.dbConnected,
        sourceHealth: data.sources,
        counts: {
          assets: activeAssets.length,
          aircraft: activeAircrafts.length,
          satellites: activeSatellites.length,
          seismic: activeSeismicEvents.length,
          cameras: data.cameras.length
        },
        activeAlertCount: activeAlerts.length,
        lastSyncTime: data.lastUpdated,
        appVersion: 'v0.8.0-prototype',
        auditSummaryCount: data.auditLogs.length
      });
    };

  // Zoom helper
  const flyToCoords = (lon: number, lat: number, height: number = 5000) => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(lon, lat, height),
      duration: 1.5
    });
  };

  // Check if a layer should be disabled because no data is available
  const isLayerDisabled = (layer: keyof typeof data.layerVisibility) => {
    if (layer === 'assets') return data.assets.length === 0;
    if (layer === 'aircraft') return data.aircrafts.length === 0;
    if (layer === 'satellites') return data.satellites.length === 0;
    if (layer === 'seismic') return data.seismicEvents.length === 0;
    if (layer === 'cameras') return data.cameras.length === 0;
    return false;
  };

  // Helper to map layer modes to uppercase display
  const getSourceDisplay = (source: string, isSatellite: boolean = false) => {
    if (source === 'offline') return 'OFFLINE';
    if (source === 'live') return isSatellite ? 'LIVE TLE / POINT FALLBACK' : 'LIVE';
    if (source === 'live_disabled') return 'LIVE DISABLED';
    if (source === 'live_fallback') return isSatellite ? 'LIVE UNAVAILABLE (MOCK)' : 'LIVE UNAVAILABLE (MOCK)';
    if (source === 'database') return isSatellite ? 'DATABASE TLE' : 'DATABASE';
    return isSatellite ? 'MOCK ORBITAL DATA' : 'MOCK';
  };


  const getSelectedTitle = () => {
    if (!selectedObject) return '';
    const { type, data } = selectedObject;
    if (type === 'asset') return data.name;
    if (type === 'aircraft') return data.callsign || data.icao24;
    if (type === 'satellite') return data.name;
    if (type === 'seismic') return data.usgs_id;
    if (type === 'camera') return data.name;
    return '';
  };

  return (
    <div className={`cc-container ${executiveView ? 'executive-mode' : ''}`}>
      <OperatingModeBanner 
        demoModeActive={demoScenario.demoModeActive}
        simulatedRole={data.simulatedRole}
        realtimeConnectionStatus={realtime.connectionStatus}
        realtimeEnabled={realtimeEnabled}
        sources={data.sources as unknown as Record<string, string>}
      />
      <CommandBar 
        executiveView={executiveView}
        setExecutiveView={setExecutiveView}
        showPilotChecklist={showPilotChecklist}
        setShowPilotChecklist={setShowPilotChecklist}
        demoModeActive={demoScenario.demoModeActive}
        setDemoModeActive={demoScenario.setDemoModeActive}
        resetScenario={demoScenario.resetScenario}
        apiOnline={data.apiOnline}
        dbConnected={data.dbConnected}
        simulatedRole={data.simulatedRole}
        changeSimulatedRole={data.changeSimulatedRole}
        hasCesiumToken={hasCesiumToken}
        envMode={envMode}
        realtimeConnectionStatus={realtime.connectionStatus}
        realtimeEnabled={realtimeEnabled}
        setRealtimeEnabled={setRealtimeEnabled}
        realtimeReconnectAttempt={realtime.reconnectAttempt}
        manualReconnect={realtime.manualReconnect}
        activeAlertsCount={activeAlerts.length}
        setShowAlertsPanel={setShowAlertsPanel}
      />
      <MissionRail 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        simulatedRole={data.simulatedRole}
      />
      <main className="cc-map-container" style={{ position: 'relative', gridRow: '3', gridColumn: '2' }}>
        {!hasCesiumToken && (
          <div className="map-notification-overlay">
            <span>ℹ️ Map Keyless: Fallback OpenStreetMap Tiles enabled</span>
          </div>
        )}
        {demoScenario.demoModeActive && (
          <div className="map-notification-overlay demo-mode-indicator" style={{ color: 'var(--color-seismic)', border: '1px solid var(--color-seismic)', background: 'rgba(249, 115, 22, 0.15)', top: '50px' }}>
            <span>⚠️ Demo Mode: Simulated non-camera telemetry (Not live operational data)</span>
          </div>
        )}
        <div ref={mapContainerRef} className="cesium-viewer-container" />
        {showAlertsPanel && data.simulatedRole !== 'auditor' && (
          <AlertInbox 
            alerts={alertInbox.alerts}
            clearAll={alertInbox.clearAll}
            markViewed={alertInbox.markViewed}
            onClose={() => setShowAlertsPanel(false)}
          />
        )}
        {executiveView && (
          <ExecutiveOverlay 
            assetCount={activeAssets.length}
            aircraftCount={activeAircrafts.length}
            satelliteCount={activeSatellites.length}
            seismicCount={activeSeismicEvents.length}
            cameraCount={data.cameras.length}
            alertCount={activeAlerts.length}
            onClose={() => setExecutiveView(false)}
          />
        )}
      </main>
      
      {activeTab === 'globe' && !executiveView && (
        <EntityDetailPanel 
          selectedObject={selectedObject}
          getSelectedTitle={getSelectedTitle}
          setSelectedEntityInfo={setSelectedEntityInfo}
        />
      )}
      
      {activeTab === 'sources' && !executiveView && (
        <aside className="cc-details-panel">
          <SourceHealthPanel 
            data={data}
            realtime={realtime}
            simulatedRole={data.simulatedRole}
          />
        </aside>
      )}

      {activeTab === 'alerts' && !executiveView && (
        <aside className="cc-details-panel">
          <AlertInbox 
            alerts={alertInbox.alerts}
            clearAll={alertInbox.clearAll}
            markViewed={alertInbox.markViewed}
            onClose={() => setActiveTab('globe')}
          />
        </aside>
      )}

      {activeTab === 'timeline' && !executiveView && (
        <aside className="cc-details-panel">
          <div style={{ padding: '16px' }}>Timeline events full view (WIP)</div>
        </aside>
      )}

      {!executiveView && (
        <TimelineStrip 
          demoModeActive={demoScenario.demoModeActive}
          realtimeConnectionStatus={realtime.connectionStatus}
          simulatedRole={data.simulatedRole}
          timelineFilter={timelineFilter}
          setTimelineFilter={setTimelineFilter}
          skippedGeometryCount={skippedGeometryCount}
          realtimeEvents={realtime.realtimeEvents}
          activeTimelineEvents={activeTimelineEvents}
          getSourceDisplay={getSourceDisplay}
        />
      )}

      <SafetyFooter 
        demoModeActive={demoScenario.demoModeActive}
      />
    </div>
  );
}
