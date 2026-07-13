import { FastifyInstance } from 'fastify';

// =============================================================================
// DEPRECATED ROUTE — cameras.ts
// =============================================================================
// The /api/cameras/authorized endpoint is REMOVED as of migration 005 (2026-07-13).
// Reason: The underlying authorized_cameras table has been renamed to sensor_registry
// and the prohibited columns stream_url and verification_hash have been dropped.
//
// All consumers MUST migrate to: GET /api/sensors/registry
//
// This file returns HTTP 410 Gone for all requests to maintain a clean deprecation
// signal rather than silently redirecting.
// =============================================================================

export async function camerasRoutes(fastify: FastifyInstance) {
  // -----------------------------------------------------------------------
  // 410 Gone — /api/cameras/authorized
  // This endpoint has been permanently removed. The table it queried
  // (authorized_cameras) no longer exists — it was renamed to sensor_registry
  // via migration 005, and the prohibited fields (stream_url, verification_hash)
  // were dropped.
  // -----------------------------------------------------------------------
  fastify.get('/api/cameras/authorized', async (request, reply) => {
    fastify.log.warn({
      msg: 'DEPRECATED endpoint called: /api/cameras/authorized',
      route: '/api/cameras/authorized',
      method: 'GET',
      caller_ip: request.ip,
      user_agent: request.headers['user-agent'] ?? 'unknown',
      migration_note: 'Use /api/sensors/registry'
    });

    return reply.status(410).send({
      error: 'Gone',
      code: 'ENDPOINT_REMOVED',
      message:
        'The /api/cameras/authorized endpoint has been permanently removed as part of ' +
        'Q-Sight P0 hardening (migration 005, 2026-07-13). The underlying table ' +
        'authorized_cameras was renamed to sensor_registry, and the prohibited columns ' +
        'stream_url and verification_hash were dropped.',
      migration: {
        replacement_endpoint: 'GET /api/sensors/registry',
        documentation: 'docs/remediation/CAMERA_SCOPE_MIGRATION.md',
        migration_id: '005_sensor_registry'
      },
      timestamp: new Date().toISOString()
    });
  });
}
