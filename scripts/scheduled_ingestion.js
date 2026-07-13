import { spawn } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

const SCHEDULER_ENABLED = process.env.SCHEDULER_ENABLED === 'true';
const LIVE_INGESTION_ENABLED = process.env.LIVE_INGESTION_ENABLED === 'true';

if (!SCHEDULER_ENABLED) {
  console.log(JSON.stringify({
    level: 'info',
    timestamp: new Date().toISOString(),
    msg: '[Scheduler] SCHEDULER_ENABLED is false. Exiting.'
  }));
  process.exit(0);
}

if (!LIVE_INGESTION_ENABLED) {
  console.log(JSON.stringify({
    level: 'info',
    timestamp: new Date().toISOString(),
    msg: '[Scheduler] LIVE_INGESTION_ENABLED is false. Exiting.'
  }));
  process.exit(0);
}

function parseInterval(envVar, minMs, defaultMs) {
  const val = process.env[envVar];
  if (!val) return defaultMs;
  const parsed = parseInt(val, 10);
  if (isNaN(parsed)) return defaultMs;
  if (parsed < minMs) {
    console.warn(JSON.stringify({
      level: 'warn',
      timestamp: new Date().toISOString(),
      msg: `[Scheduler] WARNING: ${envVar} (${parsed}ms) is below safe threshold (${minMs}ms). Running with the overridden value as requested.`
    }));
    return parsed;
  }
  return parsed;
}

const SEISMIC_INTERVAL = parseInterval('SEISMIC_POLL_INTERVAL_MS', 300000, 300000);
const AIRCRAFT_INTERVAL = parseInterval('AIRCRAFT_POLL_INTERVAL_MS', 120000, 120000);
const SATELLITE_INTERVAL = parseInterval('SATELLITE_POLL_INTERVAL_MS', 86400000, 86400000);

console.log(JSON.stringify({
  level: 'info',
  timestamp: new Date().toISOString(),
  msg: '[Scheduler] Starting controlled ingestion scheduler...',
  config: {
    seismic_interval_ms: SEISMIC_INTERVAL,
    aircraft_interval_ms: AIRCRAFT_INTERVAL,
    satellite_interval_ms: SATELLITE_INTERVAL
  }
}));

const activeWorkers = new Map();
let isShuttingDown = false;

function runIngestor(name, scriptName, interval) {
  console.log(JSON.stringify({
    level: 'info',
    timestamp: new Date().toISOString(),
    msg: `[Scheduler] Initializing ${name} worker`,
    interval_ms: interval
  }));
  
  let timerId = null;

  const tick = () => {
    if (isShuttingDown) return;

    // Check if job is already running to prevent overlapping
    if (activeWorkers.has(name)) {
      console.warn(JSON.stringify({
        level: 'warn',
        timestamp: new Date().toISOString(),
        msg: `[Scheduler] ${name} worker is already running. Skipping execution to prevent overlap.`
      }));
      return;
    }

    console.log(JSON.stringify({
      level: 'info',
      timestamp: new Date().toISOString(),
      msg: `[Scheduler] Executing ${name} worker...`
    }));

    const isWindows = process.platform === 'win32';
    const npmCmd = isWindows ? 'npm.cmd' : 'npm';
    
    const child = spawn(npmCmd, ['run', scriptName], {
      stdio: ['ignore', 'pipe', 'pipe'], // capture output instead of direct inherit to parse/format logs
      shell: true
    });

    activeWorkers.set(name, child);

    let stdoutData = '';
    let stderrData = '';

    child.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    child.on('close', (code) => {
      activeWorkers.delete(name);
      
      if (code === 0) {
        console.log(JSON.stringify({
          level: 'info',
          timestamp: new Date().toISOString(),
          msg: `[Scheduler] ${name} worker completed successfully`,
          exit_code: code
        }));
      } else {
        console.error(JSON.stringify({
          level: 'error',
          timestamp: new Date().toISOString(),
          msg: `[Scheduler] ${name} worker exited with errors`,
          exit_code: code,
          stderr: stderrData.trim().substring(0, 500) // log only a short summary of error
        }));
      }

      if (!isShuttingDown) {
        timerId = setTimeout(tick, interval);
      }
    });

    child.on('error', (err) => {
      activeWorkers.delete(name);
      console.error(JSON.stringify({
        level: 'error',
        timestamp: new Date().toISOString(),
        msg: `[Scheduler] ${name} worker failed to start`,
        error: err.message || String(err)
      }));

      if (!isShuttingDown) {
        timerId = setTimeout(tick, interval);
      }
    });
  };

  // Start the first tick immediately
  tick();
}

runIngestor('Seismic', 'ingest:seismic:once', SEISMIC_INTERVAL);
runIngestor('Aircraft', 'ingest:aircraft:once', AIRCRAFT_INTERVAL);
runIngestor('Satellite', 'ingest:satellite:once', SATELLITE_INTERVAL);

// Graceful shutdown handling
const shutdown = (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(JSON.stringify({
    level: 'info',
    timestamp: new Date().toISOString(),
    msg: `[Scheduler] Received ${signal}. Shutting down active workers...`
  }));

  for (const [name, child] of activeWorkers.entries()) {
    console.log(JSON.stringify({
      level: 'info',
      timestamp: new Date().toISOString(),
      msg: `[Scheduler] Terminating worker process for ${name}...`
    }));
    try {
      child.kill('SIGTERM');
    } catch (e) {
      // Ignore
    }
  }

  // Allow short delay to clean up and exit
  setTimeout(() => {
    console.log(JSON.stringify({
      level: 'info',
      timestamp: new Date().toISOString(),
      msg: '[Scheduler] All workers terminated. Exiting.'
    }));
    process.exit(0);
  }, 1500);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
