import { FastifyInstance } from 'fastify';
import { execSync } from 'child_process';
import { pool } from '../db';
import { config } from '../config';

// Safe extraction of git commit
let gitCommit = process.env.GIT_COMMIT || 'unknown';
try {
  gitCommit = execSync('git rev-parse HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
} catch (e) {
  // Silent fallback
}

export async function healthRoutes(fastify: FastifyInstance) {
  // GET /health
  fastify.get('/health', async (request, reply) => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      app: 'q-sight-api'
    };
  });

  // GET /health/db
  fastify.get('/health/db', async (request, reply) => {
    if (!pool) {
      return reply.status(503).send({
        status: 'error',
        database: 'disconnected',
        reason: 'DATABASE_URL is not configured'
      });
    }

    try {
      // Verify database connection and check PostGIS version
      const res = await pool.query('SELECT postgis_version() as version;');
      return {
        status: 'ok',
        database: 'connected',
        postgis: res.rows[0].version
      };
    } catch (err: any) {
      return reply.status(503).send({
        status: 'error',
        database: 'disconnected',
        error: err.message || String(err)
      });
    }
  });

  // GET /ready
  fastify.get('/ready', async (request, reply) => {
    // 1. Check DB Pool Configuration
    if (!pool) {
      return reply.status(503).send({
        status: 'not_ready',
        reason: 'Database pool is not initialized'
      });
    }

    try {
      // 2. Check Database Connectivity and PostGIS
      const dbCheck = await pool.query('SELECT postgis_version() as version;');
      if (!dbCheck.rows[0] || !dbCheck.rows[0].version) {
        return reply.status(503).send({
          status: 'not_ready',
          reason: 'PostGIS extension not found'
        });
      }

      // 3. Check configuration shape (port, databaseUrl, nodeEnv, etc.)
      const isConfigValid = !!config.port && typeof config.port === 'number';
      if (!isConfigValid) {
        return reply.status(500).send({
          status: 'not_ready',
          reason: 'Configuration shape is invalid'
        });
      }

      // 4. Gather status of components
      return reply.status(200).send({
        status: 'ready',
        liveIngestionEnabled: config.liveIngestionEnabled,
        seismicLiveEnabled: config.seismicLiveEnabled,
        satelliteLiveEnabled: config.satelliteLiveEnabled,
        aircraftLiveEnabled: config.aircraftLiveEnabled,
        websocketConfigStatus: 'active'
      });
    } catch (error: any) {
      return reply.status(503).send({
        status: 'not_ready',
        reason: 'Database connection failed',
        error: error.message || String(error)
      });
    }
  });

  // GET /version
  fastify.get('/version', async (request, reply) => {
    return {
      appName: 'q-sight-api',
      version: '0.1.0',
      environment: config.nodeEnv,
      gitCommit: gitCommit,
      buildTimestamp: process.env.BUILD_TIMESTAMP || '2026-06-30T13:41:13Z' // Use build-time env or fallback
    };
  });
}

