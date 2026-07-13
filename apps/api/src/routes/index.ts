import { FastifyInstance } from 'fastify';
import { healthRoutes } from './health';
import { assetsRoutes } from './assets';
import { telemetryRoutes } from './telemetry';
import { camerasRoutes } from './cameras';
import { auditRoutes } from './audit';
import { realtimeRoutes } from './realtime';
import { parseUserContext } from '../auth/context';

export async function registerRoutes(fastify: FastifyInstance) {
  // Register simulated user context parsing hook globally
  fastify.addHook('preHandler', async (request, reply) => {
    // Skip auth parsing for health and readiness checks to keep them unauthenticated
    // Skip for WebSocket routes (they handle auth via query params internally)
    if (
      request.url === '/health' ||
      request.url === '/health/db' ||
      request.url === '/ready' ||
      request.url === '/version'
    ) {
      return;
    }
    if (request.url.startsWith('/ws/')) {
      return; // WebSocket routes handle auth internally (dev-only query-param simulation)
    }
    await parseUserContext(request, reply);
  });

  // Global response logging hook to output structured logs safely without sensitive info
  fastify.addHook('onResponse', async (request, reply) => {
    // Avoid logging sensitive route payloads or query params containing credentials
    const safeUrl = request.url.split('?')[0]; // strip query parameters just in case they have secrets
    const reqId = request.userContext?.request_id || request.headers['x-q-sight-request-id'] || request.id;
    
    request.log.info({
      msg: 'HTTP Request Completed',
      request_id: reqId,
      method: request.method,
      route: safeUrl,
      status: reply.statusCode,
      duration_ms: reply.elapsedTime,
      role: request.userContext?.role || 'unauthenticated',
      user_id: request.userContext?.user_id || 'anonymous'
    });
  });

  // Register routing groups
  await fastify.register(healthRoutes);
  await fastify.register(assetsRoutes);
  await fastify.register(telemetryRoutes);
  await fastify.register(camerasRoutes);
  await fastify.register(auditRoutes);
  // V0.6: Real-time WebSocket telemetry (non-camera only)
  await fastify.register(realtimeRoutes);
}

