import { FastifyInstance } from 'fastify';
import { pool } from '../db';
import { config } from '../config';
import { mockAircrafts, mockSatellites, mockSeismicEvents } from '../mock-data';
import {
  AircraftPositionSchema,
  SatelliteOrbitPointSchema,
  SeismicEventSchema
} from '@q-sight/shared';
import { requirePermission } from '../auth/requirePermission';


export async function telemetryRoutes(fastify: FastifyInstance) {
  // 1. GET /api/telemetry/aircraft
  fastify.get('/api/telemetry/aircraft', {
    preHandler: [requirePermission('telemetry:read')]
  }, async (request, reply) => {
    const timestamp = new Date().toISOString();
    const liveEnabled = config.liveIngestionEnabled && config.aircraftLiveEnabled;
    const ingestionStatus = {
      enabled: liveEnabled,
      write_to_db: process.env.LIVE_INGESTOR_WRITE_TO_DB === 'true',
      interval_ms: parseInt(process.env.INGESTION_INTERVAL_AIRCRAFT_MS || '30000', 10),
    };

    if (!pool) {
      return {
        source: 'mock',
        count: mockAircrafts.length,
        timestamp,
        items: mockAircrafts,
        ingestion_status: ingestionStatus
      };
    }

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
        FROM aircraft_positions;
      `;
      const res = await pool.query(query);

      if (res.rows.length === 0) {
        return {
          source: 'mock',
          count: mockAircrafts.length,
          timestamp,
          items: mockAircrafts,
          ingestion_status: ingestionStatus
        };
      }

      const items = res.rows.map(row => {
        const item = {
          icao24: row.icao24,
          callsign: row.callsign,
          origin_country: row.origin_country,
          altitude_meters: row.altitude_meters ? parseFloat(row.altitude_meters) : null,
          velocity_mps: row.velocity_mps ? parseFloat(row.velocity_mps) : null,
          heading_degrees: row.heading_degrees ? parseFloat(row.heading_degrees) : null,
          latitude: parseFloat(row.latitude),
          longitude: parseFloat(row.longitude),
          last_contact: row.last_contact,
          updated_at: row.updated_at
        };
        AircraftPositionSchema.parse(item);
        return item;
      });

      return {
        source: liveEnabled ? 'live' : 'database',
        count: items.length,
        timestamp,
        items,
        ingestion_status: ingestionStatus
      };
    } catch (err: any) {
      fastify.log.error('Database query failed for aircraft telemetry, falling back to mock:', err.message || err);
      return {
        source: 'mock',
        count: mockAircrafts.length,
        timestamp,
        items: mockAircrafts,
        ingestion_status: ingestionStatus
      };
    }
  });

  // 2. GET /api/telemetry/satellites
  fastify.get('/api/telemetry/satellites', {
    preHandler: [requirePermission('telemetry:read')]
  }, async (request, reply) => {
    const timestamp = new Date().toISOString();
    const liveEnabled = config.liveIngestionEnabled && config.satelliteLiveEnabled;
    const ingestionStatus = {
      enabled: liveEnabled,
      write_to_db: process.env.LIVE_INGESTOR_WRITE_TO_DB === 'true',
      interval_ms: parseInt(process.env.INGESTION_INTERVAL_SATELLITE_MS || '300000', 10),
    };

    if (!pool) {
      return {
        source: 'mock',
        count: mockSatellites.length,
        timestamp,
        items: mockSatellites,
        ingestion_status: ingestionStatus
      };
    }

    try {
      const query = `
        SELECT 
          norad_id, 
          name, 
          tle_line1, 
          tle_line2, 
          ST_AsGeoJSON(footprint) as footprint, 
          updated_at 
        FROM satellite_orbits;
      `;
      const res = await pool.query(query);

      if (res.rows.length === 0) {
        return {
          source: 'mock',
          count: mockSatellites.length,
          timestamp,
          items: mockSatellites,
          ingestion_status: ingestionStatus
        };
      }

      const items = res.rows.map(row => {
        const item = {
          norad_id: parseInt(row.norad_id, 10),
          name: row.name,
          tle_line1: row.tle_line1,
          tle_line2: row.tle_line2,
          footprint: row.footprint ? JSON.parse(row.footprint) : null,
          updated_at: row.updated_at
        };
        SatelliteOrbitPointSchema.parse(item);
        return item;
      });

      return {
        source: liveEnabled ? 'live' : 'database',
        count: items.length,
        timestamp,
        items,
        ingestion_status: ingestionStatus
      };
    } catch (err: any) {
      fastify.log.error('Database query failed for satellite telemetry, falling back to mock:', err.message || err);
      return {
        source: 'mock',
        count: mockSatellites.length,
        timestamp,
        items: mockSatellites,
        ingestion_status: ingestionStatus
      };
    }
  });

  // 3. GET /api/telemetry/seismic
  fastify.get('/api/telemetry/seismic', {
    preHandler: [requirePermission('telemetry:read')]
  }, async (request, reply) => {
    const timestamp = new Date().toISOString();
    const liveEnabled = config.liveIngestionEnabled && config.seismicLiveEnabled;
    const ingestionStatus = {
      enabled: liveEnabled,
      write_to_db: process.env.LIVE_INGESTOR_WRITE_TO_DB === 'true',
      interval_ms: parseInt(process.env.INGESTION_INTERVAL_SEISMIC_MS || '60000', 10),
    };

    if (!pool) {
      return {
        source: 'mock',
        count: mockSeismicEvents.length,
        timestamp,
        items: mockSeismicEvents,
        ingestion_status: ingestionStatus
      };
    }

    try {
      const query = `
        SELECT 
          usgs_id, 
          place, 
          magnitude, 
          depth_km, 
          event_time, 
          ST_Y(location) as latitude, 
          ST_X(location) as longitude, 
          created_at 
        FROM seismic_events;
      `;
      const res = await pool.query(query);

      if (res.rows.length === 0) {
        return {
          source: 'mock',
          count: mockSeismicEvents.length,
          timestamp,
          items: mockSeismicEvents,
          ingestion_status: ingestionStatus
        };
      }

      const items = res.rows.map(row => {
        const item = {
          usgs_id: row.usgs_id,
          place: row.place,
          magnitude: parseFloat(row.magnitude),
          depth_km: parseFloat(row.depth_km),
          event_time: row.event_time,
          latitude: parseFloat(row.latitude),
          longitude: parseFloat(row.longitude),
          created_at: row.created_at
        };
        SeismicEventSchema.parse(item);
        return item;
      });

      return {
        source: liveEnabled ? 'live' : 'database',
        count: items.length,
        timestamp,
        items,
        ingestion_status: ingestionStatus
      };
    } catch (err: any) {
      fastify.log.error('Database query failed for seismic telemetry, falling back to mock:', err.message || err);
      return {
        source: 'mock',
        count: mockSeismicEvents.length,
        timestamp,
        items: mockSeismicEvents,
        ingestion_status: ingestionStatus
      };
    }
  });
}


