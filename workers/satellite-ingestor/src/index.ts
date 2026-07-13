import * as path from 'path';
import * as dotenv from 'dotenv';
import { Client } from 'pg';
import {
  SatelliteOrbitPointSchema,
  fetchWithTimeout,
  SatelliteOrbitPoint,
  IngestionResult
} from '@q-sight/shared';
let mockSatellites : any[] = [];
if (process.env.BUILD_PROFILE !== 'production') {
  mockSatellites = require('./mock-data').mockSatellites;
}

// Load environment variables from possible parent directories
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const LIVE_INGESTION_ENABLED = process.env.LIVE_INGESTION_ENABLED === 'true';
const SATELLITE_LIVE_ENABLED = process.env.SATELLITE_LIVE_ENABLED === 'true';
const isLive = LIVE_INGESTION_ENABLED && SATELLITE_LIVE_ENABLED;

const dbUrl = process.env.DATABASE_URL;
const writeToDbEnabled = isLive
  ? process.env.LIVE_INGESTOR_WRITE_TO_DB === 'true'
  : process.env.MOCK_INGESTOR_WRITE_TO_DB === 'true';

const sourceUrl = process.env.SATELLITE_TLE_SOURCE_URL;
const timeoutMs = parseInt(process.env.INGESTION_REQUEST_TIMEOUT_MS || '10000', 10);
const maxRecords = parseInt(process.env.INGESTION_MAX_RECORDS_PER_RUN || '500', 10);

async function run() {
  const timestamp = new Date().toISOString();
  console.log(JSON.stringify({ event: 'ingestion_run_started', type: 'satellite', mode: isLive ? 'live' : 'mock', timestamp }));

  let result: IngestionResult<SatelliteOrbitPoint> = {
    source: isLive ? 'live' : 'mock',
    count: 0,
    records: [],
    errors: [],
    timestamp
  };

  if (isLive) {
    if (!sourceUrl) {
      const errMsg = 'SATELLITE_TLE_SOURCE_URL is missing.';
      result.errors.push(errMsg);
      if (process.env.BUILD_PROFILE === 'production') {
        console.warn(JSON.stringify({ event: 'ingestion_warning', type: 'satellite', message: errMsg + ' Mock fallback BLOCKED in production.', timestamp }));
        result.records = [];
        result.source = 'live';
      } else {
        console.warn(JSON.stringify({ event: 'ingestion_warning', type: 'satellite', message: errMsg + ' Falling back to mock data.', timestamp }));
        result.records = mockSatellites;
        result.source = 'mock';
      }
    } else {
      try {
        const dataStr = await fetchWithTimeout(sourceUrl, { headers: { 'Accept': 'text/plain' } }, timeoutMs);

        // Split text by lines, handle CRLF or LF
        const lines = dataStr.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
        let skippedCount = 0;
        let parsedCount = 0;

        // TLE format is typically in sets of 3 lines: Name, Line 1, Line 2
        for (let i = 0; i < lines.length; i += 3) {
          if (parsedCount >= maxRecords) {
            break;
          }

          if (i + 2 >= lines.length) {
            skippedCount += (lines.length - i);
            result.errors.push(`Incomplete TLE block at line ${i}`);
            break;
          }

          const name = lines[i];
          const l1 = lines[i + 1];
          const l2 = lines[i + 2];

          try {
            // Defensively check line format
            if (!l1.startsWith('1 ') || !l2.startsWith('2 ')) {
              throw new Error('Line 1 must start with "1 " and Line 2 must start with "2 "');
            }

            // NORAD ID extraction (chars 2-7, index 2 to 7)
            const noradStr1 = l1.substring(2, 7).trim();
            const noradStr2 = l2.substring(2, 7).trim();

            if (noradStr1 !== noradStr2) {
              throw new Error(`NORAD ID mismatch: ${noradStr1} vs ${noradStr2}`);
            }

            const noradId = parseInt(noradStr1, 10);
            if (isNaN(noradId) || noradId <= 0) {
              throw new Error(`Invalid NORAD ID: ${noradStr1}`);
            }

            const sat: SatelliteOrbitPoint = {
              norad_id: noradId,
              name: name || `SATELLITE ${noradId}`,
              tle_line1: l1,
              tle_line2: l2,
              footprint: null, // Keep footprints null, precise propagation deferred
            };

            const validated = SatelliteOrbitPointSchema.parse(sat);
            result.records.push(validated);
            parsedCount++;
          } catch (err: any) {
            skippedCount++;
            result.errors.push(`TLE parse error for block starting with "${name}": ${err.message || err}`);
          }
        }

        if (skippedCount > 0) {
          console.warn(JSON.stringify({
            event: 'ingestion_records_skipped',
            type: 'satellite',
            count: skippedCount,
            errors: result.errors.slice(-5),
            timestamp
          }));
        }

      } catch (err: any) {
        const errMsg = `Live ingestion failed: ${err.message || err}.`;
        result.errors.push(errMsg);
        if (process.env.BUILD_PROFILE === 'production') {
          console.error(JSON.stringify({ event: 'ingestion_run_failed', type: 'satellite', message: errMsg + ' Mock fallback BLOCKED in production.', timestamp }));
          result.records = [];
          result.source = 'live';
        } else {
          console.error(JSON.stringify({ event: 'ingestion_run_failed', type: 'satellite', message: errMsg + ' Falling back to mock data.', timestamp }));
          result.records = mockSatellites;
          result.source = 'mock';
        }
      }
    }
  } else {
    result.records = mockSatellites;
  }

  // Set the final count
  result.count = result.records.length;

  // Validate the records again just to be safe
  const validRecords: SatelliteOrbitPoint[] = [];
  for (const sat of result.records) {
    const val = SatelliteOrbitPointSchema.safeParse(sat);
    if (val.success) {
      validRecords.push(val.data as SatelliteOrbitPoint);
    } else {
      console.error(JSON.stringify({ event: 'ingestion_record_invalid', type: 'satellite', norad_id: sat.norad_id, error: val.error.format() }));
    }
  }
  result.records = validRecords;
  result.count = validRecords.length;

  // Database persistence
  if (writeToDbEnabled && dbUrl && result.records.length > 0) {
    const client = new Client({ connectionString: dbUrl });
    try {
      await client.connect();
      for (const sat of result.records) {
        const query = `
          INSERT INTO satellite_orbits (norad_id, name, tle_line1, tle_line2, footprint)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (norad_id) DO UPDATE SET
            name = EXCLUDED.name,
            tle_line1 = EXCLUDED.tle_line1,
            tle_line2 = EXCLUDED.tle_line2,
            footprint = EXCLUDED.footprint,
            updated_at = CURRENT_TIMESTAMP;
        `;

        const values = [
          sat.norad_id,
          sat.name,
          sat.tle_line1,
          sat.tle_line2,
          sat.footprint ? JSON.stringify(sat.footprint) : null
        ];

        await client.query(query, values);
      }
      console.log(JSON.stringify({ event: 'database_write_completed', type: 'satellite', count: result.records.length, timestamp }));
    } catch (dbErr: any) {
      console.error(JSON.stringify({ event: 'database_write_failed', type: 'satellite', message: dbErr.message || dbErr, timestamp }));
    } finally {
      await client.end();
    }
  } else {
    console.log(JSON.stringify({ event: 'database_write_skipped', type: 'satellite', reason: !dbUrl ? 'No DB URL' : 'Write flag disabled', timestamp }));
  }

  console.log(JSON.stringify({
    event: 'ingestion_run_completed',
    type: 'satellite',
    source: result.source,
    count: result.count,
    timestamp
  }));
}

run().catch((err) => {
  console.error(JSON.stringify({ event: 'ingestion_fatal_failure', type: 'satellite', message: err.message || err, timestamp: new Date().toISOString() }));
  process.exit(1);
});

