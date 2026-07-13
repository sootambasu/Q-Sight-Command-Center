import { AircraftPosition } from '@q-sight/shared';

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
