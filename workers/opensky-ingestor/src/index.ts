import * as path from 'path';
import * as dotenv from 'dotenv';
import { Client } from 'pg';
import {
  AircraftPositionSchema,
  fetchWithTimeout,
  AircraftPosition,
  IngestionResult
} from '@q-sight/shared';
let mockAircrafts : any[] = [];
if (process.env.BUILD_PROFILE !== 'production') {
  mockAircrafts = require('./mock-data').mockAircrafts;
}

// Load environment variables from possible parent directories
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const LIVE_INGESTION_ENABLED = process.env.LIVE_INGESTION_ENABLED === 'true';
const AIRCRAFT_LIVE_ENABLED = process.env.AIRCRAFT_LIVE_ENABLED === 'true';
const isLive = LIVE_INGESTION_ENABLED && AIRCRAFT_LIVE_ENABLED;

const dbUrl = process.env.DATABASE_URL;
const writeToDbEnabled = isLive
  ? process.env.LIVE_INGESTOR_WRITE_TO_DB === 'true'
  : process.env.MOCK_INGESTOR_WRITE_TO_DB === 'true';

const sourceUrl = process.env.AIRCRAFT_SOURCE_URL;
const username = process.env.AIRCRAFT_SOURCE_USERNAME || process.env.OPENSKY_USERNAME;
const password = process.env.AIRCRAFT_SOURCE_PASSWORD || process.env.OPENSKY_PASSWORD;

const timeoutMs = parseInt(process.env.INGESTION_REQUEST_TIMEOUT_MS || '10000', 10);
const maxRecords = parseInt(process.env.INGESTION_MAX_RECORDS_PER_RUN || '500', 10);

async function run() {
  const timestamp = new Date().toISOString();
  console.log(JSON.stringify({ event: 'ingestion_run_started', type: 'aircraft', mode: isLive ? 'live' : 'mock', timestamp }));

  let result: IngestionResult<AircraftPosition> = {
    source: isLive ? 'live' : 'mock',
    count: 0,
    records: [],
    errors: [],
    timestamp
  };

  if (isLive) {
    if (!sourceUrl) {
      const errMsg = 'AIRCRAFT_SOURCE_URL is missing.';
      result.errors.push(errMsg);
      if (process.env.BUILD_PROFILE === 'production') {
        console.warn(JSON.stringify({ event: 'ingestion_warning', type: 'aircraft', message: errMsg + ' Mock fallback BLOCKED in production.', timestamp }));
        result.records = [];
        result.source = 'live';
      } else {
        console.warn(JSON.stringify({ event: 'ingestion_warning', type: 'aircraft', message: errMsg + ' Falling back to mock data.', timestamp }));
        result.records = mockAircrafts;
        result.source = 'mock';
      }
    } else {
      try {
        const headers: Record<string, string> = {
          'Accept': 'application/json',
        };

        if (username && password) {
          const auth = Buffer.from(`${username}:${password}`).toString('base64');
          headers['Authorization'] = `Basic ${auth}`;
        }

        const dataStr = await fetchWithTimeout(sourceUrl, { headers }, timeoutMs);
        const data = JSON.parse(dataStr);

        if (!data || !Array.isArray(data.states)) {
          throw new Error('Invalid OpenSky response shape: missing "states" array');
        }

        const rawStates = data.states.slice(0, maxRecords);
        let skippedCount = 0;

        for (const state of rawStates) {
          try {
            if (!Array.isArray(state) || state.length < 11) {
              throw new Error('State array too short or invalid');
            }

            const icao24 = state[0];
            const callsign = typeof state[1] === 'string' ? state[1].trim() : null;
            const originCountry = state[2];
            const longitude = state[5];
            const latitude = state[6];
            const altitude = state[7]; // baro_altitude
            const velocity = state[9];
            const heading = state[10]; // true_track
            const lastContact = state[4] || Math.floor(Date.now() / 1000);

            if (typeof icao24 !== 'string' || !icao24) {
              throw new Error('Missing ICAO24 code');
            }
            if (typeof originCountry !== 'string') {
              throw new Error('Invalid or missing origin country');
            }
            if (typeof longitude !== 'number' || isNaN(longitude)) {
              throw new Error('Invalid longitude coordinate');
            }
            if (typeof latitude !== 'number' || isNaN(latitude)) {
              throw new Error('Invalid latitude coordinate');
            }

            const plane: AircraftPosition = {
              icao24,
              callsign,
              origin_country: originCountry,
              altitude_meters: typeof altitude === 'number' && !isNaN(altitude) ? altitude : null,
              velocity_mps: typeof velocity === 'number' && !isNaN(velocity) ? velocity : null,
              heading_degrees: typeof heading === 'number' && !isNaN(heading) ? heading : null,
              latitude,
              longitude,
              last_contact: lastContact,
              source: result.source,
              freshness: Date.now() - (lastContact * 1000),
              age: Date.now() - (lastContact * 1000),
              quality: result.source === 'live' ? 'high' : 'mock',
              staleness: false
            };

            const validated = AircraftPositionSchema.parse(plane);
            result.records.push(validated);
          } catch (itemErr: any) {
            skippedCount++;
            result.errors.push(`Record validation error: ${itemErr.message || itemErr}`);
          }
        }

        if (skippedCount > 0) {
          console.warn(JSON.stringify({
            event: 'ingestion_records_skipped',
            type: 'aircraft',
            count: skippedCount,
            errors: result.errors.slice(-5),
            timestamp
          }));
        }

      } catch (err: any) {
        const errMsg = `Live ingestion failed: ${err.message || err}.`;
        result.errors.push(errMsg);
        if (process.env.BUILD_PROFILE === 'production') {
          console.error(JSON.stringify({ event: 'ingestion_run_failed', type: 'aircraft', message: errMsg + ' Mock fallback BLOCKED in production.', timestamp }));
          result.records = [];
          result.source = 'live';
        } else {
          console.error(JSON.stringify({ event: 'ingestion_run_failed', type: 'aircraft', message: errMsg + ' Falling back to mock data.', timestamp }));
          result.records = mockAircrafts;
          result.source = 'mock';
        }
      }
    }
  } else {
    // Mock mode
    result.records = mockAircrafts;
  }

  // Set the final count
  result.count = result.records.length;

  // Validate the records again just to be safe
  const validRecords: AircraftPosition[] = [];
  for (const plane of result.records) {
    const val = AircraftPositionSchema.safeParse(plane);
    if (val.success) {
      validRecords.push(val.data as AircraftPosition);
    } else {
      console.error(JSON.stringify({ event: 'ingestion_record_invalid', type: 'aircraft', icao24: plane.icao24, error: val.error.format() }));
    }
  }
  result.records = validRecords;
  result.count = validRecords.length;

  // Database persistence
  if (writeToDbEnabled && dbUrl && result.records.length > 0) {
    const client = new Client({ connectionString: dbUrl });
    try {
      await client.connect();
      for (const plane of result.records) {
        const query = `
          INSERT INTO aircraft_positions (
            icao24, callsign, origin_country, altitude_meters, velocity_mps, heading_degrees, coordinates, last_contact
          )
          VALUES (
            $1, $2, $3, $4, $5, $6,
            ST_SetSRID(ST_MakePoint($7, $8, $9), 4326),
            $10
          )
          ON CONFLICT (icao24) DO UPDATE SET
            callsign = EXCLUDED.callsign,
            origin_country = EXCLUDED.origin_country,
            altitude_meters = EXCLUDED.altitude_meters,
            velocity_mps = EXCLUDED.velocity_mps,
            heading_degrees = EXCLUDED.heading_degrees,
            coordinates = EXCLUDED.coordinates,
            last_contact = EXCLUDED.last_contact,
            updated_at = CURRENT_TIMESTAMP;
        `;

        const values = [
          plane.icao24,
          plane.callsign || null,
          plane.origin_country,
          plane.altitude_meters || null,
          plane.velocity_mps || null,
          plane.heading_degrees || null,
          plane.longitude, // X coordinate
          plane.latitude,  // Y coordinate
          plane.altitude_meters || 0.00, // Z coordinate
          typeof plane.last_contact === 'number' ? new Date(plane.last_contact * 1000) : new Date(plane.last_contact)
        ];

        await client.query(query, values);
      }
      console.log(JSON.stringify({ event: 'database_write_completed', type: 'aircraft', count: result.records.length, timestamp }));
    } catch (dbErr: any) {
      console.error(JSON.stringify({ event: 'database_write_failed', type: 'aircraft', message: dbErr.message || dbErr, timestamp }));
    } finally {
      await client.end();
    }
  } else {
    console.log(JSON.stringify({ event: 'database_write_skipped', type: 'aircraft', reason: !dbUrl ? 'No DB URL' : 'Write flag disabled', timestamp }));
  }

  console.log(JSON.stringify({
    event: 'ingestion_run_completed',
    type: 'aircraft',
    source: result.source,
    count: result.count,
    timestamp
  }));
}

run().catch((err) => {
  console.error(JSON.stringify({ event: 'ingestion_fatal_failure', type: 'aircraft', message: err.message || err, timestamp: new Date().toISOString() }));
  process.exit(1);
});

