import { SeismicEvent } from '@q-sight/shared';

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
