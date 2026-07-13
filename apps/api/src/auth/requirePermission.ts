import { FastifyRequest, FastifyReply } from 'fastify';
import { Permission, hasPermission } from './roles';
import { logAuditEvent } from '../audit/auditLogger';

// Simple in-memory cache to rate-limit denied-access logging to prevent database spamming during client polling
const recentDenials = new Map<string, number>();
const DENIAL_LOG_COOLDOWN_MS = 60000; // 1 minute cooldown per user+permission pair

export function requirePermission(permission: Permission) {
  return async function (request: FastifyRequest, reply: FastifyReply) {
    const context = request.userContext;
    if (!context) {
      reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Auth context missing. Check middleware order.',
      });
      return;
    }

    const authorized = hasPermission(context.role, permission);

    if (!authorized) {
      const now = Date.now();
      const denialKey = `${context.user_id}:${permission}`;
      const lastLogged = recentDenials.get(denialKey) || 0;

      const shouldLogToDb = (now - lastLogged) > DENIAL_LOG_COOLDOWN_MS;

      // Always log to console
      request.log.warn(`🚫 Access Denied: User "${context.user_id}" with role "${context.role}" requested "${request.url}" requiring permission "${permission}"`);

      if (shouldLogToDb) {
        recentDenials.set(denialKey, now);
        // Fire-and-forget DB audit log write
        logAuditEvent({
          operator_id: context.user_id,
          role: context.role,
          action: 'access_denied',
          target_type: 'endpoint',
          target_id: request.routerPath || request.url,
          request_id: context.request_id,
          route: request.url,
          metadata: {
            required_permission: permission,
            message: 'Access denied due to insufficient permissions.',
          },
        }).catch(err => {
          request.log.error('Failed to log audit event:', err);
        });
      }

      reply.status(403).send({
        error: 'Forbidden',
        message: 'Access denied. Insufficient permissions.',
        requiredPermission: permission,
      });
      return;
    }
  };
}
