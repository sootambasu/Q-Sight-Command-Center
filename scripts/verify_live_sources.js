/**
 * scripts/verify_live_sources.js
 * 
 * Network-dependent script to verify live telemetry source URLs,
 * parse records through existing Zod schemas, and report results.
 * Exits non-zero ONLY on code/parser bugs. Handles third-party downtime gracefully.
 */

const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

let shared;
try {
  shared = require(path.resolve(process.cwd(), 'packages/shared/dist/index.js'));
} catch (err) {
  console.error('Error: Could not load @q-sight/shared. Did you run "npm run build" first?');
  process.exit(1);
}

const {
  SeismicEventSchema,
  SatelliteOrbitPointSchema,
  AircraftPositionSchema,
  fetchWithTimeout
} = shared;

const LIVE_INGESTION_ENABLED = process.env.LIVE_INGESTION_ENABLED === 'true';
const SEISMIC_LIVE_ENABLED = process.env.SEISMIC_LIVE_ENABLED === 'true';
const SATELLITE_LIVE_ENABLED = process.env.SATELLITE_LIVE_ENABLED === 'true';
const AIRCRAFT_LIVE_ENABLED = process.env.AIRCRAFT_LIVE_ENABLED === 'true';

const TIMEOUT_MS = parseInt(process.env.INGESTION_REQUEST_TIMEOUT_MS || '10000', 10);
const MAX_RECORDS = parseInt(process.env.INGESTION_MAX_RECORDS_PER_RUN || '100', 10);

// Safety check function to ensure no camera/video/person/biometric fields exist in records
function assertNoSensitiveFields(record, sourceName) {
  const sensitiveWords = ['camera', 'video', 'biometric', 'person', 'face', 'cctv', 'facial', 'stream', 'webrtc'];
  const recordStr = JSON.stringify(record).toLowerCase();
  for (const word of sensitiveWords) {
    if (recordStr.includes(word)) {
      throw new Error(`Safety violation in ${sourceName}: record contains sensitive field/value containing "${word}"`);
    }
  }
}

async function verifySeismic() {
  console.log('\n--- VERIFYING SEISMIC SOURCE ---');
  const sourceUrl = process.env.SEISMIC_SOURCE_URL || 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson';
  const minMagnitude = parseFloat(process.env.SEISMIC_MIN_MAGNITUDE || '2.5');

  console.log(`URL: ${sourceUrl}`);
  console.log(`Magnitude threshold: >= ${minMagnitude}`);

  if (!LIVE_INGESTION_ENABLED || !SEISMIC_LIVE_ENABLED) {
    console.log('Seismic live ingestion is disabled in config.');
    return { status: 'disabled', fallback: 'mock' };
  }

  let dataStr;
  try {
    dataStr = await fetchWithTimeout(sourceUrl, { headers: { 'Accept': 'application/json' } }, TIMEOUT_MS);
    console.log(`HTTP Status: 200 (Fetched successfully)`);
  } catch (err) {
    console.warn(`[DEGRADED] Seismic fetch failed: ${err.message}. Falling back to mock.`);
    return { status: 'fetch_failed', error: err.message, fallback: 'mock' };
  }

  try {
    const data = JSON.parse(dataStr);

    if (!data || !Array.isArray(data.features)) {
      throw new Error('Invalid USGS response shape: missing "features" array');
    }

    const rawFeatures = data.features.slice(0, MAX_RECORDS);
    let accepted = 0;
    let skipped = 0;
    let sample = null;

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

        if (!usgsId || typeof usgsId !== 'string') throw new Error('Missing usgs_id');
        if (magnitude === null || isNaN(magnitude)) throw new Error('Missing magnitude');
        if (magnitude < minMagnitude) {
          skipped++;
          continue;
        }

        const event = {
          usgs_id: usgsId,
          place,
          magnitude,
          depth_km: depthKm,
          event_time: eventTime,
          latitude,
          longitude
        };

        const validated = SeismicEventSchema.parse(event);
        assertNoSensitiveFields(validated, 'Seismic');
        accepted++;
        if (!sample) {
          sample = validated;
        }
      } catch (itemErr) {
        skipped++;
      }
    }

    console.log(`Records fetched (analyzed): ${rawFeatures.length}`);
    console.log(`Records accepted: ${accepted}`);
    console.log(`Records filtered/skipped: ${skipped}`);
    if (sample) {
      console.log('Sample accepted record:', JSON.stringify(sample, null, 2));
    }
    return { status: 'success', fetched: rawFeatures.length, accepted, skipped };
  } catch (err) {
    console.error(`[FATAL CODE ERROR] Seismic parsing failed: ${err.message}`);
    throw err;
  }
}

async function verifySatellite() {
  console.log('\n--- VERIFYING SATELLITE SOURCE ---');
  const sourceUrl = process.env.SATELLITE_TLE_SOURCE_URL || 'https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=tle';

  console.log(`URL: ${sourceUrl}`);

  if (!LIVE_INGESTION_ENABLED || !SATELLITE_LIVE_ENABLED) {
    console.log('Satellite live ingestion is disabled in config.');
    return { status: 'disabled', fallback: 'mock' };
  }

  let dataStr;
  try {
    dataStr = await fetchWithTimeout(sourceUrl, { headers: { 'Accept': 'text/plain' } }, TIMEOUT_MS);
    console.log(`HTTP Status: 200 (Fetched successfully)`);
  } catch (err) {
    console.warn(`[DEGRADED] Satellite fetch failed: ${err.message}. Falling back to mock.`);
    return { status: 'fetch_failed', error: err.message, fallback: 'mock' };
  }

  try {
    const lines = dataStr.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
    let accepted = 0;
    let skipped = 0;
    let sample = null;

    let parsedCount = 0;
    for (let i = 0; i < lines.length; i += 3) {
      if (parsedCount >= MAX_RECORDS) break;

      if (i + 2 >= lines.length) {
        skipped += (lines.length - i);
        break;
      }

      const name = lines[i];
      const l1 = lines[i + 1];
      const l2 = lines[i + 2];

      try {
        if (!l1.startsWith('1 ') || !l2.startsWith('2 ')) {
          throw new Error('Malformed TLE line prefix');
        }
        const noradStr1 = l1.substring(2, 7).trim();
        const noradId = parseInt(noradStr1, 10);
        if (isNaN(noradId)) throw new Error('Invalid NORAD ID');

        const sat = {
          norad_id: noradId,
          name: name || `SATELLITE ${noradId}`,
          tle_line1: l1,
          tle_line2: l2,
          footprint: null
        };

        const validated = SatelliteOrbitPointSchema.parse(sat);
        assertNoSensitiveFields(validated, 'Satellite');
        accepted++;
        parsedCount++;
        if (!sample) {
          sample = validated;
        }
      } catch (itemErr) {
        skipped++;
      }
    }

    console.log(`Records analyzed: ${parsedCount + skipped}`);
    console.log(`Records accepted: ${accepted}`);
    console.log(`Records skipped: ${skipped}`);
    if (sample) {
      console.log('Sample accepted record:', JSON.stringify(sample, null, 2));
    }
    return { status: 'success', fetched: parsedCount + skipped, accepted, skipped };
  } catch (err) {
    console.error(`[FATAL CODE ERROR] Satellite parsing failed: ${err.message}`);
    throw err;
  }
}

async function verifyAircraft() {
  console.log('\n--- VERIFYING AIRCRAFT SOURCE ---');
  const sourceUrl = process.env.AIRCRAFT_SOURCE_URL || 'https://opensky-network.org/api/states/all';
  const username = process.env.AIRCRAFT_SOURCE_USERNAME || process.env.OPENSKY_USERNAME;
  const password = process.env.AIRCRAFT_SOURCE_PASSWORD || process.env.OPENSKY_PASSWORD;

  console.log(`URL: ${sourceUrl}`);
  console.log(`Auth credentials provided: ${username ? 'YES' : 'NO (anonymous access)'}`);

  if (!LIVE_INGESTION_ENABLED || !AIRCRAFT_LIVE_ENABLED) {
    console.log('Aircraft live ingestion is disabled in config.');
    return { status: 'disabled', fallback: 'mock' };
  }

  const headers = { 'Accept': 'application/json' };
  if (username && password && username !== 'your_opensky_username_here') {
    const auth = Buffer.from(`${username}:${password}`).toString('base64');
    headers['Authorization'] = `Basic ${auth}`;
  }

  let dataStr;
  try {
    dataStr = await fetchWithTimeout(sourceUrl, { headers }, TIMEOUT_MS);
    console.log(`HTTP Status: 200 (Fetched successfully)`);
  } catch (err) {
    console.warn(`[DEGRADED] Aircraft fetch failed: ${err.message}. Falling back to mock.`);
    return { status: 'fetch_failed', error: err.message, fallback: 'mock' };
  }

  try {
    const data = JSON.parse(dataStr);

    if (!data || !Array.isArray(data.states)) {
      throw new Error('Invalid OpenSky response shape: missing "states" array');
    }

    const rawStates = data.states.slice(0, MAX_RECORDS);
    let accepted = 0;
    let skipped = 0;
    let sample = null;

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
        const altitude = state[7];
        const velocity = state[9];
        const heading = state[10];
        const lastContact = state[4] || Math.floor(Date.now() / 1000);

        if (typeof icao24 !== 'string' || !icao24) throw new Error('Missing icao24');
        if (typeof originCountry !== 'string') throw new Error('Missing country');
        if (typeof longitude !== 'number' || isNaN(longitude)) throw new Error('Invalid longitude');
        if (typeof latitude !== 'number' || isNaN(latitude)) throw new Error('Invalid latitude');

        const plane = {
          icao24,
          callsign,
          origin_country: originCountry,
          altitude_meters: typeof altitude === 'number' && !isNaN(altitude) ? altitude : null,
          velocity_mps: typeof velocity === 'number' && !isNaN(velocity) ? velocity : null,
          heading_degrees: typeof heading === 'number' && !isNaN(heading) ? heading : null,
          latitude,
          longitude,
          last_contact: lastContact
        };

        const validated = AircraftPositionSchema.parse(plane);
        assertNoSensitiveFields(validated, 'Aircraft');
        accepted++;
        if (!sample) {
          sample = validated;
        }
      } catch (itemErr) {
        skipped++;
      }
    }

    console.log(`Records fetched (analyzed): ${rawStates.length}`);
    console.log(`Records accepted: ${accepted}`);
    console.log(`Records skipped: ${skipped}`);
    if (sample) {
      console.log('Sample accepted record:', JSON.stringify(sample, null, 2));
    }
    return { status: 'success', fetched: rawStates.length, accepted, skipped };
  } catch (err) {
    console.error(`[FATAL CODE ERROR] Aircraft parsing failed: ${err.message}`);
    throw err;
  }
}

async function main() {
  console.log('====================================================');
  console.log('Q-Sight Live Open-Data Telemetry Verification');
  console.log('====================================================');
  console.log(`LIVE_INGESTION_ENABLED: ${LIVE_INGESTION_ENABLED}`);
  console.log(`SEISMIC_LIVE_ENABLED: ${SEISMIC_LIVE_ENABLED}`);
  console.log(`SATELLITE_LIVE_ENABLED: ${SATELLITE_LIVE_ENABLED}`);
  console.log(`AIRCRAFT_LIVE_ENABLED: ${AIRCRAFT_LIVE_ENABLED}`);
  console.log(`LIVE_INGESTOR_WRITE_TO_DB: ${process.env.LIVE_INGESTOR_WRITE_TO_DB}`);
  console.log(`Timeout Limit: ${TIMEOUT_MS}ms`);

  let codeFailure = false;

  try {
    await verifySeismic();
  } catch (err) {
    codeFailure = true;
  }

  try {
    await verifySatellite();
  } catch (err) {
    codeFailure = true;
  }

  try {
    await verifyAircraft();
  } catch (err) {
    codeFailure = true;
  }

  console.log('\n====================================================');
  if (codeFailure) {
    console.error('❌ VERIFICATION FAILED: Code or Parser Failure Detected.');
    process.exit(1);
  } else {
    console.log('✅ VERIFICATION COMPLETED (Third-party downtime/degradation is handled gracefully).');
    process.exitCode = 0;
  }
}

main();
