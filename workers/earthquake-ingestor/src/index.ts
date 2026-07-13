import * as path from 'path';
import * as dotenv from 'dotenv';
import { Client } from 'pg';
import {
  SeismicEventSchema,
  fetchWithTimeout,
  SeismicEvent,
  IngestionResult
} from '@q-sight/shared';
let mockSeismicEvents : any[] = [];
if (process.env.BUILD_PROFILE !== 'production') {
  mockSeismicEvents = require('./mock-data').mockSeismicEvents;
}

// Load environment variables from possible parent directories
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const LIVE_INGESTION_ENABLED = process.env.LIVE_INGESTION_ENABLED === 'true';
const SEISMIC_LIVE_ENABLED = process.env.SEISMIC_LIVE_ENABLED === 'true';
const isLive = LIVE_INGESTION_ENABLED && SEISMIC_LIVE_ENABLED;

const dbUrl = process.env.DATABASE_URL;
const writeToDbEnabled = isLive
  ? process.env.LIVE_INGESTOR_WRITE_TO_DB === 'true'
  : process.env.MOCK_INGESTOR_WRITE_TO_DB === 'true';

const sourceUrl = process.env.SEISMIC_SOURCE_URL || process.env.USGS_EARTHQUAKE_FEED_URL;
const minMagnitude = parseFloat(process.env.SEISMIC_MIN_MAGNITUDE || '2.5');

const timeoutMs = parseInt(process.env.INGESTION_REQUEST_TIMEOUT_MS || '10000', 10);
const maxRecords = parseInt(process.env.INGESTION_MAX_RECORDS_PER_RUN || '500', 10);

async function run() {
  const timestamp = new Date().toISOString();
  console.log(JSON.stringify({ event: 'ingestion_run_started', type: 'seismic', mode: isLive ? 'live' : 'mock', timestamp }));

  let result: IngestionResult<SeismicEvent> = {
    source: isLive ? 'live' : 'mock',
    count: 0,
    records: [],
    errors: [],
    timestamp
  };

  if (isLive) {
    if (!sourceUrl) {
      const errMsg = 'SEISMIC_SOURCE_URL is missing.';
      result.errors.push(errMsg);
      if (process.env.BUILD_PROFILE === 'production') {
        console.warn(JSON.stringify({ event: 'ingestion_warning', type: 'seismic', message: errMsg + ' Mock fallback BLOCKED in production.', timestamp }));
        result.records = [];
        result.source = 'live';
      } else {
        console.warn(JSON.stringify({ event: 'ingestion_warning', type: 'seismic', message: errMsg + ' Falling back to mock data.', timestamp }));
        result.records = mockSeismicEvents;
        result.source = 'mock';
      }
    } else {
      try {
        const dataStr = await fetchWithTimeout(sourceUrl, { headers: { 'Accept': 'application/json' } }, timeoutMs);
        const data = JSON.parse(dataStr);

        if (!data || !Array.isArray(data.features)) {
          throw new Error('Invalid USGS response shape: missing "features" array');
        }

        const rawFeatures = data.features.slice(0, maxRecords);
        let skippedCount = 0;

        for (const feature of rawFeatures) {
          try {
            if (!feature || !feature.properties || !feature.geometry || !Array.isArray(feature.geometry.coordinates)) {
              throw new Error('Invalid GeoJSON feature structure');
            }

            const usgsId = feature.id || feature.properties.code;
            const place = feature.properties.place || 'Unknown Location';
            const magnitude = typeof feature.properties.mag === 'number' ? feature.properties.mag : null;
            const eventTime = feature.properties.time;

            const coords = feature.geometry.coordinates;
            const longitude = coords[0];
            const latitude = coords[1];
            const depthKm = coords[2] || 0.0;

            if (!usgsId || typeof usgsId !== 'string') {
              throw new Error('Missing or invalid USGS event ID');
            }
            if (magnitude === null || isNaN(magnitude)) {
              throw new Error('Missing magnitude value');
            }
            if (magnitude < minMagnitude) {
              // Silently filter by minimum magnitude without logging as an error
              continue;
            }
            if (typeof longitude !== 'number' || isNaN(longitude) || typeof latitude !== 'number' || isNaN(latitude)) {
              throw new Error('Invalid epicenter coordinates');
            }
            if (typeof eventTime !== 'number' && typeof eventTime !== 'string') {
              throw new Error('Missing event timestamp');
            }

            const event: SeismicEvent = {
              usgs_id: usgsId,
              place,
              magnitude,
              depth_km: typeof depthKm === 'number' && !isNaN(depthKm) ? depthKm : 0.0,
              event_time: eventTime,
              latitude,
              longitude,
              source: result.source,
              freshness: Date.now() - new Date(eventTime).getTime(),
              age: Date.now() - new Date(eventTime).getTime(),
              quality: result.source === 'live' ? 'high' : 'mock',
              staleness: false
            };

            const validated = SeismicEventSchema.parse(event);
            result.records.push(validated);
          } catch (itemErr: any) {
            skippedCount++;
            result.errors.push(`Feature parse error: ${itemErr.message || itemErr}`);
          }
        }

        if (skippedCount > 0) {
          console.warn(JSON.stringify({
            event: 'ingestion_records_skipped',
            type: 'seismic',
            count: skippedCount,
            errors: result.errors.slice(-5),
            timestamp
          }));
        }

      } catch (err: any) {
        const errMsg = `Live ingestion failed: ${err.message || err}.`;
        result.errors.push(errMsg);
        if (process.env.BUILD_PROFILE === 'production') {
          console.error(JSON.stringify({ event: 'ingestion_run_failed', type: 'seismic', message: errMsg + ' Mock fallback BLOCKED in production.', timestamp }));
          result.records = [];
          result.source = 'live';
        } else {
          console.error(JSON.stringify({ event: 'ingestion_run_failed', type: 'seismic', message: errMsg + ' Falling back to mock data.', timestamp }));
          result.records = mockSeismicEvents;
          result.source = 'mock';
        }
      }
    }
  } else {
    result.records = mockSeismicEvents;
  }

  // Filter local mock data by magnitude if needed, or validate it
  const validRecords: SeismicEvent[] = [];
  for (const event of result.records) {
    if (event.magnitude < minMagnitude) continue;
    const val = SeismicEventSchema.safeParse(event);
    if (val.success) {
      validRecords.push(val.data as SeismicEvent);
    } else {
      console.error(JSON.stringify({ event: 'ingestion_record_invalid', type: 'seismic', usgs_id: event.usgs_id, error: val.error.format() }));
    }
  }
  result.records = validRecords;
  result.count = validRecords.length;

  // Database persistence
  if (writeToDbEnabled && dbUrl && result.records.length > 0) {
    const client = new Client({ connectionString: dbUrl });
    try {
      await client.connect();
      for (const event of result.records) {
        const query = `
          INSERT INTO seismic_events (usgs_id, place, magnitude, depth_km, event_time, location, source, freshness, age, quality, staleness)
          VALUES ($1, $2, $3, $4, $5, ST_SetSRID(ST_MakePoint($6, $7), 4326), $8, $9, $10, $11, $12)
          ON CONFLICT (usgs_id) DO UPDATE SET
            place = EXCLUDED.place,
            magnitude = EXCLUDED.magnitude,
            depth_km = EXCLUDED.depth_km,
            event_time = EXCLUDED.event_time,
            location = EXCLUDED.location,
            source = EXCLUDED.source,
            freshness = EXCLUDED.freshness,
            age = EXCLUDED.age,
            quality = EXCLUDED.quality,
            staleness = EXCLUDED.staleness;
        `;

        const values = [
          event.usgs_id,
          event.place,
          event.magnitude,
          event.depth_km,
          // Handle string vs number vs date for time in SQL
          typeof event.event_time === 'number' ? new Date(event.event_time) : new Date(event.event_time),
          event.longitude, // X coordinate
          event.latitude,  // Y coordinate
          event.source || 'live',
          event.freshness || 0,
          event.age || 0,
          event.quality || 'unknown',
          event.staleness || false
        ];

        await client.query(query, values);
      }
      console.log(JSON.stringify({ event: 'database_write_completed', type: 'seismic', count: result.records.length, timestamp }));
    } catch (dbErr: any) {
      console.error(JSON.stringify({ event: 'database_write_failed', type: 'seismic', message: dbErr.message || dbErr, timestamp }));
    } finally {
      await client.end();
    }
  } else {
    console.log(JSON.stringify({ event: 'database_write_skipped', type: 'seismic', reason: !dbUrl ? 'No DB URL' : 'Write flag disabled', timestamp }));
  }

  console.log(JSON.stringify({
    event: 'ingestion_run_completed',
    type: 'seismic',
    source: result.source,
    count: result.count,
    timestamp
  }));
}

run().catch((err) => {
  console.error(JSON.stringify({ event: 'ingestion_fatal_failure', type: 'seismic', message: err.message || err, timestamp: new Date().toISOString() }));
  process.exit(1);
});

