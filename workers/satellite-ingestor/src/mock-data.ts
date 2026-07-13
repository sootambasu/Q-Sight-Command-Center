import { SatelliteOrbitPoint } from '@q-sight/shared';

export const mockSatellites: SatelliteOrbitPoint[] = [
  {
    norad_id: 25544,
    name: 'ISS (ZARYA) - MOCK',
    // TLE lines must be exactly 69 characters
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
