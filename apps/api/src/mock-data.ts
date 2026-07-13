import {
  IndustrialAsset,
  AircraftPosition,
  SatelliteOrbitPoint,
  SeismicEvent,
  AuthorizedCameraRegistryEntry
} from '@q-sight/shared';

export const mockAssets: IndustrialAsset[] = [
  {
    id: "3e5a525f-22f3-42e1-85b4-f3c5f55de068",
    name: "Oakridge Refinery",
    description: "Petroleum processing refinery and distribution hub.",
    type: "refinery",
    latitude: 37.935,
    longitude: -122.347,
    boundary: {
      type: "Polygon",
      coordinates: [
        [
          [-122.352, 37.932],
          [-122.352, 37.938],
          [-122.342, 37.938],
          [-122.342, 37.932],
          [-122.352, 37.932]
        ]
      ]
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "7b4c6e94-3995-4da2-8b43-264d8a1f6a1e",
    name: "Elkhorn Power Station",
    description: "Natural gas power generation facility.",
    type: "power_station",
    latitude: 36.808,
    longitude: -121.786,
    boundary: {
      type: "Polygon",
      coordinates: [
        [
          [-121.791, 36.805],
          [-121.791, 36.811],
          [-121.781, 36.811],
          [-121.781, 36.805],
          [-121.791, 36.805]
        ]
      ]
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "2c1d3e4f-5678-490a-bcde-f1234567890a",
    name: "Pacific Pipeline Terminal",
    description: "Crude oil terminal and pipeline control junction.",
    type: "terminal",
    latitude: 33.743,
    longitude: -118.261,
    boundary: {
      type: "Polygon",
      coordinates: [
        [
          [-118.266, 33.740],
          [-118.266, 33.746],
          [-118.256, 33.746],
          [-118.256, 33.740],
          [-118.266, 33.740]
        ]
      ]
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const mockAircrafts: AircraftPosition[] = [
  {
    icao24: 'a804ff',
    callsign: 'LOG782',
    origin_country: 'United States',
    altitude_meters: 10668.00,
    velocity_mps: 230.50,
    heading_degrees: 185.50,
    latitude: 37.7749,
    longitude: -122.4194,
    last_contact: new Date().toISOString()
  },
  {
    icao24: 'c051a3',
    callsign: 'CARGO88',
    origin_country: 'Canada',
    altitude_meters: 11277.60,
    velocity_mps: 245.00,
    heading_degrees: 92.30,
    latitude: 45.4215,
    longitude: -75.6972,
    last_contact: new Date().toISOString()
  },
  {
    icao24: '400a12',
    callsign: 'QSIGHT1',
    origin_country: 'United Kingdom',
    altitude_meters: 8534.40,
    velocity_mps: 210.20,
    heading_degrees: 270.00,
    latitude: 51.5074,
    longitude: -0.1278,
    last_contact: new Date().toISOString()
  },
  {
    icao24: '3c65a9',
    callsign: 'SAFE202',
    origin_country: 'Germany',
    altitude_meters: 9753.60,
    velocity_mps: 222.80,
    heading_degrees: 45.00,
    latitude: 50.1109,
    longitude: 8.6821,
    last_contact: new Date().toISOString()
  }
];

export const mockSatellites: SatelliteOrbitPoint[] = [
  {
    norad_id: 25544,
    name: 'ISS (ZARYA) - MOCK',
    tle_line1: '1 25544U 98067A   23318.91666667  .00016717  00000-0  30000-3 0  9997',
    tle_line2: '2 25544  51.6416 247.4627 0006732  48.5759 311.6147 15.49864321423456',
    footprint: {
      type: 'Polygon',
      coordinates: [
        [
          [-125.0, 35.0],
          [-125.0, 45.0],
          [-115.0, 45.0],
          [-115.0, 35.0],
          [-125.0, 35.0]
        ]
      ]
    },
    updated_at: new Date().toISOString()
  },
  {
    norad_id: 49260,
    name: 'LANDSAT 9 - MOCK',
    tle_line1: '1 49260U 21088A   23318.82528741  .00000125  00000-0  38827-4 0  9995',
    tle_line2: '2 49260  98.2145 120.4532 0001124  85.2341 274.9123 14.58245367112345',
    footprint: {
      type: 'Polygon',
      coordinates: [
        [
          [-80.0, 40.0],
          [-80.0, 50.0],
          [-70.0, 50.0],
          [-70.0, 40.0],
          [-80.0, 40.0]
        ]
      ]
    },
    updated_at: new Date().toISOString()
  },
  {
    norad_id: 40697,
    name: 'SENTINEL-2A - MOCK',
    tle_line1: '1 40697U 15028A   23318.51249530  .00000085  00000-0  18239-4 0  9992',
    tle_line2: '2 40697  98.5684  45.8923 0001150  92.1245 268.0124 14.30825346452341',
    footprint: {
      type: 'Polygon',
      coordinates: [
        [
          [5.0, 45.0],
          [5.0, 55.0],
          [15.0, 55.0],
          [15.0, 45.0],
          [5.0, 45.0]
        ]
      ]
    },
    updated_at: new Date().toISOString()
  }
];

export const mockSeismicEvents: SeismicEvent[] = [
  {
    usgs_id: 'nc73948271_mock',
    place: '12km NE of San Jose, CA - MOCK',
    magnitude: 5.4,
    depth_km: 10.2,
    event_time: new Date().toISOString(),
    latitude: 37.4042,
    longitude: -121.8493
  },
  {
    usgs_id: 'ak02627918_mock',
    place: '50km S of Anchorage, AK - MOCK',
    magnitude: 6.1,
    depth_km: 25.0,
    event_time: new Date().toISOString(),
    latitude: 60.7281,
    longitude: -149.8974
  },
  {
    usgs_id: 'tx2026_003_mock',
    place: '8km W of Port Arthur, TX - MOCK',
    magnitude: 4.2,
    depth_km: 5.4,
    event_time: new Date().toISOString(),
    latitude: 29.8732,
    longitude: -94.0125
  },
  {
    usgs_id: 'uw61942718_mock',
    place: '3km N of Seattle, WA - MOCK',
    magnitude: 3.5,
    depth_km: 8.1,
    event_time: new Date().toISOString(),
    latitude: 47.6205,
    longitude: -122.3493
  }
];

export const mockCameras: AuthorizedCameraRegistryEntry[] = [
  {
    id: "1c2d3e4f-5678-490a-bcde-f12345678901",
    asset_id: "3e5a525f-22f3-42e1-85b4-f3c5f55de068",
    name: "Refinery Perimeter North",
    stream_url: "https://secure-stream.q-sight.local/refinery/north",
    status: "online",
    verification_hash: "8f4e1c2d3e4f567890abcdef1234567890abcdef1234567890abcdef12345678",
    latitude: 37.937,
    longitude: -122.348,
    owner_id: "Chevron",
    authorization_status: "verified",
    authorized_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "1c2d3e4f-5678-490a-bcde-f12345678902",
    asset_id: "3e5a525f-22f3-42e1-85b4-f3c5f55de068",
    name: "Refinery Tank Farm East",
    stream_url: "https://secure-stream.q-sight.local/refinery/tank_east",
    status: "online",
    verification_hash: "7f4e1c2d3e4f567890abcdef1234567890abcdef1234567890abcdef12345678",
    latitude: 37.934,
    longitude: -122.343,
    owner_id: "Chevron",
    authorization_status: "verified",
    authorized_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "2c2d3e4f-5678-490a-bcde-f12345678903",
    asset_id: "7b4c6e94-3995-4da2-8b43-264d8a1f6a1e",
    name: "Power Station Main Gate",
    stream_url: "https://secure-stream.q-sight.local/elkhorn/gate",
    status: "online",
    verification_hash: "6f4e1c2d3e4f567890abcdef1234567890abcdef1234567890abcdef12345678",
    latitude: 36.809,
    longitude: -121.787,
    owner_id: "PG&E",
    authorization_status: "verified",
    authorized_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "3c2d3e4f-5678-490a-bcde-f12345678904",
    asset_id: "2c1d3e4f-5678-490a-bcde-f1234567890a",
    name: "Pipeline Valve 12 Intake",
    stream_url: "https://secure-stream.q-sight.local/pipeline/valve12",
    status: "offline",
    verification_hash: "5f4e1c2d3e4f567890abcdef1234567890abcdef1234567890abcdef12345678",
    latitude: 33.742,
    longitude: -118.262,
    owner_id: "PacificGas",
    authorization_status: "pending",
    authorized_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];
