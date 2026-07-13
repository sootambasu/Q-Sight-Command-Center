import { useState, useMemo, useEffect } from 'react';
import {
  IndustrialAsset,
  AircraftPosition,
  SatelliteOrbitPoint,
  SeismicEvent
} from '@q-sight/shared';
import { TimelineItem } from './useDashboardData';
import { WsGeofenceAlertPayload } from './useRealtime';

export interface DemoScenarioStep {
  title: string;
  description: string;
  assets: IndustrialAsset[];
  aircrafts: AircraftPosition[];
  satellites: SatelliteOrbitPoint[];
  seismicEvents: SeismicEvent[];
  alerts: WsGeofenceAlertPayload[];
  timeline: TimelineItem[];
  roleRecommendation?: string; // e.g. "supervisor", "auditor"
}

export interface DemoScenario {
  id: string;
  name: string;
  description: string;
  steps: DemoScenarioStep[];
}

export function useDemoScenario(activeRole: string) {
  const [demoModeActive, setDemoModeActive] = useState<boolean>(false);
  const [currentScenarioId, setCurrentScenarioId] = useState<string>('asset-monitoring');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Define deterministic scenarios
  const scenarios: DemoScenario[] = useMemo(() => [
    {
      id: 'asset-monitoring',
      name: 'Industrial Asset Monitoring',
      description: 'Aircraft telemetry passes near/through monitored asset boundary.',
      steps: [
        {
          title: 'Normal Operations',
          description: 'Operations View active. Monitored assets showing normal status. Boundaries visible for supervisor/admin.',
          assets: [
            {
              id: 'asset-north',
              name: 'North Refinery Complex',
              description: 'Primary refining facility',
              type: 'refinery',
              latitude: 37.618,
              longitude: -122.375,
              boundary: {
                type: 'Polygon',
                coordinates: [
                  [
                    [-122.385, 37.625],
                    [-122.365, 37.625],
                    [-122.365, 37.610],
                    [-122.385, 37.610],
                    [-122.385, 37.625]
                  ]
                ]
              },
              created_at: '2026-06-29T10:00:00Z',
              updated_at: '2026-06-29T10:00:00Z'
            }
          ],
          aircrafts: [
            {
              icao24: 'demo-ac-1',
              callsign: 'QS-AER1',
              origin_country: 'United States',
              latitude: 37.650,
              longitude: -122.400,
              altitude_meters: 2500,
              velocity_mps: 120,
              heading_degrees: 135,
              last_contact: Math.floor(Date.now() / 1000)
            }
          ],
          satellites: [],
          seismicEvents: [],
          alerts: [],
          timeline: [
            {
              id: 'tl-1',
              category: 'asset',
              title: 'Asset Registry: North Refinery Complex',
              timestamp: new Date().toISOString(),
              description: 'Industrial refinery online. Status: nominal.',
              source: 'mock'
            }
          ]
        },
        {
          title: 'Geofence Entry',
          description: 'Aviation transponder telemetry indicates aircraft heading towards asset boundary.',
          assets: [
            {
              id: 'asset-north',
              name: 'North Refinery Complex',
              description: 'Primary refining facility',
              type: 'refinery',
              latitude: 37.618,
              longitude: -122.375,
              boundary: {
                type: 'Polygon',
                coordinates: [
                  [
                    [-122.385, 37.625],
                    [-122.365, 37.625],
                    [-122.365, 37.610],
                    [-122.385, 37.610],
                    [-122.385, 37.625]
                  ]
                ]
              },
              created_at: '2026-06-29T10:00:00Z',
              updated_at: '2026-06-29T10:00:00Z'
            }
          ],
          aircrafts: [
            {
              icao24: 'demo-ac-1',
              callsign: 'QS-AER1',
              origin_country: 'United States',
              latitude: 37.620,
              longitude: -122.378,
              altitude_meters: 1500,
              velocity_mps: 110,
              heading_degrees: 135,
              last_contact: Math.floor(Date.now() / 1000)
            }
          ],
          satellites: [],
          seismicEvents: [],
          alerts: [
            {
              alert_id: 'alert-geo-1',
              alert_type: 'asset_boundary_enter',
              asset_id: 'asset-north',
              asset_name: 'North Refinery Complex',
              source_type: 'aircraft',
              source_id: 'demo-ac-1',
              severity: 'warning',
              message: 'Aircraft transponder contact within North Refinery Complex restricted airspace boundary.',
              timestamp: new Date().toISOString()
            }
          ],
          timeline: [
            {
              id: 'tl-alert-1',
              category: 'aircraft',
              title: 'Aviation Tracker: Airspace Warning',
              timestamp: new Date().toISOString(),
              description: 'Aircraft QS-AER1 entered restricted asset boundary at 1500m.',
              source: 'mock'
            },
            {
              id: 'tl-1',
              category: 'asset',
              title: 'Asset Registry: North Refinery Complex',
              timestamp: new Date().toISOString(),
              description: 'Industrial refinery online. Status: nominal.',
              source: 'mock'
            }
          ]
        },
        {
          title: 'Geofence Exit',
          description: 'Aircraft has cleared the restricted refinery airspace. Safety warning resolved.',
          assets: [
            {
              id: 'asset-north',
              name: 'North Refinery Complex',
              description: 'Primary refining facility',
              type: 'refinery',
              latitude: 37.618,
              longitude: -122.375,
              boundary: {
                type: 'Polygon',
                coordinates: [
                  [
                    [-122.385, 37.625],
                    [-122.365, 37.625],
                    [-122.365, 37.610],
                    [-122.385, 37.610],
                    [-122.385, 37.625]
                  ]
                ]
              },
              created_at: '2026-06-29T10:00:00Z',
              updated_at: '2026-06-29T10:00:00Z'
            }
          ],
          aircrafts: [
            {
              icao24: 'demo-ac-1',
              callsign: 'QS-AER1',
              origin_country: 'United States',
              latitude: 37.590,
              longitude: -122.350,
              altitude_meters: 1800,
              velocity_mps: 130,
              heading_degrees: 135,
              last_contact: Math.floor(Date.now() / 1000)
            }
          ],
          satellites: [],
          seismicEvents: [],
          alerts: [],
          timeline: [
            {
              id: 'tl-exit-1',
              category: 'aircraft',
              title: 'Aviation Tracker: Airspace Cleared',
              timestamp: new Date().toISOString(),
              description: 'Aircraft QS-AER1 exited North Refinery airspace boundary.',
              source: 'mock'
            },
            {
              id: 'tl-1',
              category: 'asset',
              title: 'Asset Registry: North Refinery Complex',
              timestamp: new Date().toISOString(),
              description: 'Industrial refinery online. Status: nominal.',
              source: 'mock'
            }
          ]
        }
      ]
    },
    {
      id: 'seismic-proximity',
      name: 'Seismic Proximity Awareness',
      description: 'Seismic event occurs near an industrial asset.',
      steps: [
        {
          title: 'Sensors Online',
          description: 'USGS API endpoint listening. Local seismic sensors online with normal readings.',
          assets: [
            {
              id: 'asset-west',
              name: 'West Storage Field',
              description: 'LNG storage tanks',
              type: 'storage',
              latitude: 34.052,
              longitude: -118.243,
              boundary: null,
              created_at: '2026-06-29T10:00:00Z',
              updated_at: '2026-06-29T10:00:00Z'
            }
          ],
          aircrafts: [],
          satellites: [],
          seismicEvents: [],
          alerts: [],
          timeline: [
            {
              id: 'tl-seis-1',
              category: 'asset',
              title: 'Asset Registry: West Storage Field',
              timestamp: new Date().toISOString(),
              description: 'LNG facility status: online.',
              source: 'mock'
            }
          ]
        },
        {
          title: 'Seismic Activity Detected',
          description: 'A 5.4 magnitude earthquake is recorded near the LNG storage facility. Warning generated.',
          assets: [
            {
              id: 'asset-west',
              name: 'West Storage Field',
              description: 'LNG storage tanks',
              type: 'storage',
              latitude: 34.052,
              longitude: -118.243,
              boundary: null,
              created_at: '2026-06-29T10:00:00Z',
              updated_at: '2026-06-29T10:00:00Z'
            }
          ],
          aircrafts: [],
          satellites: [],
          seismicEvents: [
            {
              usgs_id: 'demo-seis-1',
              place: '12km NW of Los Angeles, CA',
              magnitude: 5.4,
              depth_km: 10,
              latitude: 34.120,
              longitude: -118.300,
              event_time: Date.now(),
              created_at: new Date().toISOString()
            }
          ],
          alerts: [
            {
              alert_id: 'alert-seis-1',
              alert_type: 'seismic_near_asset',
              asset_id: 'asset-west',
              asset_name: 'West Storage Field',
              source_type: 'seismic',
              source_id: 'demo-seis-1',
              severity: 'warning',
              message: 'Seismic event detected near industrial asset West Storage Field. Magnitude: 5.4. Proximity: 10.1 km.',
              timestamp: new Date().toISOString()
            }
          ],
          timeline: [
            {
              id: 'tl-seis-alert',
              category: 'seismic',
              title: 'Seismic Alert: M5.4 near West Storage Field',
              timestamp: new Date().toISOString(),
              description: 'USGS registered M5.4 earthquake. Proximity warning activated.',
              source: 'mock'
            },
            {
              id: 'tl-seis-1',
              category: 'asset',
              title: 'Asset Registry: West Storage Field',
              timestamp: new Date().toISOString(),
              description: 'LNG facility status: online.',
              source: 'mock'
            }
          ]
        }
      ]
    },
    {
      id: 'compliance-review',
      name: 'Compliance Review',
      description: 'Audit logs tracking and role simulation for compliance.',
      steps: [
        {
          title: 'Switch to Auditor',
          description: 'To begin the compliance review, switch to the "auditor" role using the simulator in the top-right.',
          assets: [],
          aircrafts: [],
          satellites: [],
          seismicEvents: [],
          alerts: [],
          timeline: [],
          roleRecommendation: 'auditor'
        },
        {
          title: 'Review Audit Ledger',
          description: 'Audit tab is active. View recorded camera metadata queries, failed boundary attempts, and compliance checks.',
          assets: [],
          aircrafts: [],
          satellites: [],
          seismicEvents: [],
          alerts: [],
          timeline: [],
          roleRecommendation: 'auditor'
        }
      ]
    }
  ], []);

  const currentScenario = useMemo(() => {
    return scenarios.find(s => s.id === currentScenarioId) || scenarios[0];
  }, [scenarios, currentScenarioId]);

  const currentStep = useMemo(() => {
    return currentScenario.steps[currentStepIndex] || currentScenario.steps[0];
  }, [currentScenario, currentStepIndex]);

  // Handle auto playback
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentStepIndex(prev => {
          if (prev < currentScenario.steps.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, currentScenario]);

  const startScenario = (id: string) => {
    setCurrentScenarioId(id);
    setCurrentStepIndex(0);
    setIsPlaying(true);
    setDemoModeActive(true);
  };

  const pauseScenario = () => {
    setIsPlaying(false);
  };

  const nextStep = () => {
    setCurrentStepIndex(prev => Math.min(prev + 1, currentScenario.steps.length - 1));
  };

  const prevStep = () => {
    setCurrentStepIndex(prev => Math.max(prev - 1, 0));
  };

  const resetScenario = () => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
  };

  return {
    demoModeActive,
    setDemoModeActive,
    currentScenarioId,
    setCurrentScenarioId,
    currentScenario,
    currentStepIndex,
    currentStep,
    isPlaying,
    scenarios,
    startScenario,
    pauseScenario,
    nextStep,
    prevStep,
    resetScenario
  };
}
