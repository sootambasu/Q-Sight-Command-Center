/**
 * v0.7 Offline Ingestion Verification Script
 * Validates adapter behavior, fallbacks, timeouts, and validation rules
 * using localized fixtures and process mocking.
 * 
 * Run after building the project: `npm run build`
 */

const path = require('path');
const fs = require('fs');

// =============================================================================
// Fixtures
// =============================================================================
const FIXTURES = {
  aircraft: {
    valid: {
      time: 1680000000,
      states: [
        ["a80001", "AAL123  ", "United States", 1680000000, 1680000000, -122.375, 37.618, 10000.0, false, 250.0, 180.0, 0.0, null, 10000.0, "1200", false, 0]
      ]
    },
    malformed: {
      time: 1680000000,
      states: [
        ["a80002", "AAL456  ", "United States", 1680000000, 1680000000, "invalid_lon", 37.618, 10000.0, false, 250.0, 180.0, 0.0, null, 10000.0, "1200", false, 0],
        ["a80003", "AAL789  ", "United States", 1680000000, 1680000000, -122.375]
      ]
    }
  },
  satellite: {
    valid: `ISS (ZARYA)
1 25544U 98067A   23272.84835417  .00016717  00000-0  30043-3 0  9997
2 25544  51.6428  23.8562 0007891  37.4912 322.6105 15.49842417418247`,
    malformed: `BAD SATELLITE
1 99999U INVALID LINE
2 00000  INVALID LINE`
  },
  seismic: {
    valid: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            mag: 5.4,
            place: "10km E of Anchorage, Alaska",
            time: 1680000000000,
            updated: 1680000000000
          },
          geometry: {
            type: "Point",
            coordinates: [-149.9, 61.2, 33.0]
          },
          id: "ak023abc123"
        }
      ]
    },
    malformed: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            mag: "invalid_mag",
            place: "10km E of Anchorage, Alaska",
            time: 1680000000000
          },
          geometry: {
            type: "Point",
            coordinates: ["invalid_coord", 61.2]
          },
          id: "ak023abc124"
        }
      ]
    }
  }
};

// =============================================================================
// Mocking Setup
// =============================================================================
let activeFixture = null;
let fetchShouldTimeout = false;
let dbQueries = [];

// Mock global fetch
globalThis.fetch = async (url, options) => {
  if (fetchShouldTimeout) {
    const err = new Error('The user aborted a request.');
    err.name = 'AbortError';
    throw err;
  }

  if (activeFixture) {
    const bodyStr = typeof activeFixture === 'string' ? activeFixture : JSON.stringify(activeFixture);
    return {
      ok: true,
      status: 200,
      text: async () => bodyStr,
      json: async () => JSON.parse(bodyStr)
    };
  }

  return {
    ok: false,
    status: 404,
    text: async () => 'Not Found'
  };
};

// Mock dotenv module to prevent environment reloading during runs
require.cache[require.resolve('dotenv')] = {
  id: 'dotenv',
  filename: 'dotenv',
  loaded: true,
  exports: {
    config: () => ({})
  }
};

// Mock pg module
require.cache[require.resolve('pg')] = {
  id: 'pg',
  filename: 'pg',
  loaded: true,
  exports: {
    Client: class MockClient {
      constructor(config) {
        this.config = config;
      }
      async connect() {
        return Promise.resolve();
      }
      async query(text, values) {
        dbQueries.push({ text, values });
        return Promise.resolve({ rows: [] });
      }
      async end() {
        return Promise.resolve();
      }
    }
  }
};

// Console logs capturer
let loggedLines = [];
const originalLog = console.log;
const originalWarn = console.warn;
const originalError = console.error;

function captureLogs() {
  loggedLines = [];
  console.log = (...args) => {
    loggedLines.push({ level: 'info', text: args.join(' ') });
    originalLog(...args);
  };
  console.warn = (...args) => {
    loggedLines.push({ level: 'warn', text: args.join(' ') });
    originalWarn(...args);
  };
  console.error = (...args) => {
    loggedLines.push({ level: 'error', text: args.join(' ') });
    originalError(...args);
  };
}

function restoreLogs() {
  console.log = originalLog;
  console.warn = originalWarn;
  console.error = originalError;
}

// Helper to clean up cache for workers before re-importing
function clearWorkerCache(workerName) {
  const resolved = require.resolve(`../workers/${workerName}/dist/index.js`);
  delete require.cache[resolved];
}

// =============================================================================
// Test Runner
// =============================================================================
const tests = [];
function test(name, fn) {
  tests.push({ name, fn });
}

test('Aircraft: Live disabled fallback to mock', async () => {
  process.env.LIVE_INGESTION_ENABLED = 'false';
  process.env.AIRCRAFT_LIVE_ENABLED = 'false';
  process.env.LIVE_INGESTOR_WRITE_TO_DB = 'false';
  process.env.MOCK_INGESTOR_WRITE_TO_DB = 'false';
  process.env.AIRCRAFT_SOURCE_URL = 'http://mock-opensky.org';

  activeFixture = FIXTURES.aircraft.valid;
  dbQueries = [];

  captureLogs();
  require('../workers/opensky-ingestor/dist/index.js');
  await new Promise(resolve => setTimeout(resolve, 100));
  restoreLogs();

  const completedEvent = loggedLines.find(l => l.text.includes('ingestion_run_completed'));
  if (!completedEvent) throw new Error('Ingestion completed log missing');
  
  const parsed = JSON.parse(completedEvent.text);
  if (parsed.source !== 'mock') throw new Error(`Expected source mock, got ${parsed.source}`);
  if (parsed.count === 0) throw new Error('Expected mock records, got 0');
  
  // Verify DB write skipped
  const skippedWrite = loggedLines.find(l => l.text.includes('database_write_skipped'));
  if (!skippedWrite) throw new Error('Database write skipped log missing');
});

test('Aircraft: Live enabled but source URL missing', async () => {
  process.env.LIVE_INGESTION_ENABLED = 'true';
  process.env.AIRCRAFT_LIVE_ENABLED = 'true';
  delete process.env.AIRCRAFT_SOURCE_URL;

  activeFixture = FIXTURES.aircraft.valid;
  dbQueries = [];

  captureLogs();
  clearWorkerCache('opensky-ingestor');
  require('../workers/opensky-ingestor/dist/index.js');
  await new Promise(resolve => setTimeout(resolve, 100));
  restoreLogs();

  const warningEvent = loggedLines.find(l => l.text.includes('ingestion_warning'));
  if (!warningEvent) throw new Error('Warning log missing for missing URL');
  
  const completedEvent = loggedLines.find(l => l.text.includes('ingestion_run_completed'));
  const parsed = JSON.parse(completedEvent.text);
  if (parsed.source !== 'mock') throw new Error(`Expected fallback to mock source, got ${parsed.source}`);
});

test('Aircraft: Invalid URL timeout/failure handling', async () => {
  process.env.LIVE_INGESTION_ENABLED = 'true';
  process.env.AIRCRAFT_LIVE_ENABLED = 'true';
  process.env.AIRCRAFT_SOURCE_URL = 'http://invalid-opensky.org';
  fetchShouldTimeout = true;

  captureLogs();
  clearWorkerCache('opensky-ingestor');
  require('../workers/opensky-ingestor/dist/index.js');
  await new Promise(resolve => setTimeout(resolve, 100));
  restoreLogs();

  fetchShouldTimeout = false;

  const failedEvent = loggedLines.find(l => l.text.includes('ingestion_run_failed'));
  if (!failedEvent) throw new Error('Ingestion run failed log missing');
  
  const completedEvent = loggedLines.find(l => l.text.includes('ingestion_run_completed'));
  const parsed = JSON.parse(completedEvent.text);
  if (parsed.source !== 'mock') throw new Error(`Expected fallback to mock on error, got ${parsed.source}`);
});

test('Aircraft: Malformed records skipped and valid processed', async () => {
  process.env.LIVE_INGESTION_ENABLED = 'true';
  process.env.AIRCRAFT_LIVE_ENABLED = 'true';
  process.env.AIRCRAFT_SOURCE_URL = 'http://mock-opensky.org';
  process.env.LIVE_INGESTOR_WRITE_TO_DB = 'true';
  process.env.DATABASE_URL = 'postgresql://localhost:5432/test';

  activeFixture = FIXTURES.aircraft.malformed;
  dbQueries = [];

  captureLogs();
  clearWorkerCache('opensky-ingestor');
  require('../workers/opensky-ingestor/dist/index.js');
  await new Promise(resolve => setTimeout(resolve, 100));
  restoreLogs();

  const skippedEvent = loggedLines.find(l => l.text.includes('ingestion_records_skipped'));
  if (!skippedEvent) throw new Error('Skipped records log missing');
  
  const parsedSkipped = JSON.parse(skippedEvent.text);
  if (parsedSkipped.count !== 2) throw new Error(`Expected 2 skipped records, got ${parsedSkipped.count}`);
});

test('Satellite: Valid TLE parsing and DB write', async () => {
  process.env.LIVE_INGESTION_ENABLED = 'true';
  process.env.SATELLITE_LIVE_ENABLED = 'true';
  process.env.SATELLITE_TLE_SOURCE_URL = 'http://mock-celestrak.org';
  process.env.LIVE_INGESTOR_WRITE_TO_DB = 'true';

  activeFixture = FIXTURES.satellite.valid;
  dbQueries = [];

  captureLogs();
  clearWorkerCache('satellite-ingestor');
  require('../workers/satellite-ingestor/dist/index.js');
  await new Promise(resolve => setTimeout(resolve, 100));
  restoreLogs();

  const dbWriteEvent = loggedLines.find(l => l.text.includes('database_write_completed'));
  if (!dbWriteEvent) throw new Error('Database write completed log missing');
  
  const parsedWrite = JSON.parse(dbWriteEvent.text);
  if (parsedWrite.count !== 1) throw new Error(`Expected 1 written satellite, got ${parsedWrite.count}`);
  
  if (dbQueries.length === 0) throw new Error('No DB queries made');
  const values = dbQueries[0].values;
  if (values[0] !== 25544) throw new Error(`Expected NORAD ID 25544, got ${values[0]}`);
  if (values[1] !== 'ISS (ZARYA)') throw new Error(`Expected name 'ISS (ZARYA)', got ${values[1]}`);
});

test('Satellite: Malformed TLE skipped', async () => {
  process.env.LIVE_INGESTION_ENABLED = 'true';
  process.env.SATELLITE_LIVE_ENABLED = 'true';
  process.env.SATELLITE_TLE_SOURCE_URL = 'http://mock-celestrak.org';
  process.env.LIVE_INGESTOR_WRITE_TO_DB = 'true';

  activeFixture = FIXTURES.satellite.malformed;
  dbQueries = [];

  captureLogs();
  clearWorkerCache('satellite-ingestor');
  require('../workers/satellite-ingestor/dist/index.js');
  await new Promise(resolve => setTimeout(resolve, 100));
  restoreLogs();

  const skippedEvent = loggedLines.find(l => l.text.includes('ingestion_records_skipped'));
  if (!skippedEvent) throw new Error('Skipped records log missing');
});

test('Seismic: Valid GeoJSON parsing and DB write', async () => {
  process.env.LIVE_INGESTION_ENABLED = 'true';
  process.env.SEISMIC_LIVE_ENABLED = 'true';
  process.env.SEISMIC_SOURCE_URL = 'http://mock-usgs.org';
  process.env.LIVE_INGESTOR_WRITE_TO_DB = 'true';
  process.env.SEISMIC_MIN_MAGNITUDE = '2.5';

  activeFixture = FIXTURES.seismic.valid;
  dbQueries = [];

  captureLogs();
  clearWorkerCache('earthquake-ingestor');
  require('../workers/earthquake-ingestor/dist/index.js');
  await new Promise(resolve => setTimeout(resolve, 100));
  restoreLogs();

  const dbWriteEvent = loggedLines.find(l => l.text.includes('database_write_completed'));
  if (!dbWriteEvent) throw new Error('Database write completed log missing');
  
  const parsedWrite = JSON.parse(dbWriteEvent.text);
  if (parsedWrite.count !== 1) throw new Error(`Expected 1 written seismic event, got ${parsedWrite.count}`);
});

test('Safety: Verify no camera/video/person fields are output in telemetry', async () => {
  process.env.LIVE_INGESTION_ENABLED = 'true';
  process.env.AIRCRAFT_LIVE_ENABLED = 'true';
  process.env.AIRCRAFT_SOURCE_URL = 'http://mock-opensky.org';

  activeFixture = FIXTURES.aircraft.valid;

  captureLogs();
  clearWorkerCache('opensky-ingestor');
  require('../workers/opensky-ingestor/dist/index.js');
  await new Promise(resolve => setTimeout(resolve, 100));
  restoreLogs();

  const sensitiveWords = ['camera', 'video', 'biometric', 'person', 'face', 'cctv', 'facial'];
  for (const log of loggedLines) {
    for (const word of sensitiveWords) {
      if (log.text.toLowerCase().includes(word)) {
        throw new Error(`Safety violation: found sensitive word "${word}" in logs: ${log.text}`);
      }
    }
  }

  for (const query of dbQueries) {
    const qStr = JSON.stringify(query).toLowerCase();
    for (const word of sensitiveWords) {
      if (qStr.includes(word)) {
        throw new Error(`Safety violation: found sensitive word "${word}" in database query: ${qStr}`);
      }
    }
  }
});

// =============================================================================
// Run All
// =============================================================================
async function runAll() {
  console.log('\n=== Running Ingestion Verification Tests ===\n');
  let failed = 0;

  for (const testItem of tests) {
    console.log(`Running: ${testItem.name}...`);
    try {
      await testItem.fn();
      console.log(`PASS: ${testItem.name}\n`);
    } catch (err) {
      console.error(`FAIL: ${testItem.name}`);
      console.error(err);
      console.log('\n');
      failed++;
    }
  }

  console.log('=== Ingestion Verification Results ===');
  console.log(`Passed: ${tests.length - failed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total: ${tests.length}`);

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('\n🎉 All Ingestion Verification tests passed successfully!');
    process.exit(0);
  }
}

runAll().catch(err => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
