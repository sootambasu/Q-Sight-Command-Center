import { FastifyInstance } from 'fastify';
import { pool } from '../db';
import { requirePermission } from '../auth/requirePermission';
import { logAuditEvent } from '../audit/auditLogger';

export async function alertsRoutes(fastify: FastifyInstance) {
  fastify.get('/api/alerts', { preHandler: [requirePermission('alerts:read')] }, async (request, reply) => {
    if (!pool) return { source: 'mock', items: [] };
    try {
      const res = await pool.query(SELECT * FROM alerts ORDER BY timestamp DESC LIMIT 100);
      return { source: 'database', items: res.rows };
    } catch (err: any) {
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  });

  fastify.post('/api/alerts/:alert_id/acknowledge', { preHandler: [requirePermission('alerts:write')] }, async (request, reply) => {
    const { alert_id } = request.params as { alert_id: string };
    const context = request.userContext!;
    if (!pool) return reply.status(503).send({ error: 'Database unavailable' });
    try {
      const res = await pool.query(UPDATE alerts SET status = 'acknowledged', acknowledged_at = CURRENT_TIMESTAMP, acknowledged_by =  WHERE alert_id =  AND status = 'new' RETURNING *, [context.user_id, alert_id]);
      if (res.rowCount === 0) return reply.status(404).send({ error: 'Not Found or invalid state' });
      await logAuditEvent({ operator_id: context.user_id, role: context.role, action: 'alert_acknowledged', target_type: 'alert', target_id: alert_id, request_id: context.request_id, route: '/api/alerts/:alert_id/acknowledge', metadata: { alert_id }});
      return res.rows[0];
    } catch (err) { return reply.status(500).send({ error: 'Internal Server Error' }); }
  });

  fastify.post('/api/alerts/:alert_id/assign', { preHandler: [requirePermission('alerts:write')] }, async (request, reply) => {
    const { alert_id } = request.params as { alert_id: string };
    const { assignee_id } = request.body as { assignee_id: string };
    const context = request.userContext!;
    if (!pool) return reply.status(503).send({ error: 'Database unavailable' });
    try {
      const res = await pool.query(UPDATE alerts SET status = 'assigned', assignee_id =  WHERE alert_id =  AND status IN ('new', 'acknowledged') RETURNING *, [assignee_id, alert_id]);
      if (res.rowCount === 0) return reply.status(404).send({ error: 'Not Found or invalid state' });
      await logAuditEvent({ operator_id: context.user_id, role: context.role, action: 'alert_assigned', target_type: 'alert', target_id: alert_id, request_id: context.request_id, route: '/api/alerts/:alert_id/assign', metadata: { alert_id, assignee_id }});
      return res.rows[0];
    } catch (err) { return reply.status(500).send({ error: 'Internal Server Error' }); }
  });

  fastify.post('/api/alerts/:alert_id/investigate', { preHandler: [requirePermission('alerts:write')] }, async (request, reply) => {
    const { alert_id } = request.params as { alert_id: string };
    const context = request.userContext!;
    if (!pool) return reply.status(503).send({ error: 'Database unavailable' });
    try {
      const res = await pool.query(UPDATE alerts SET status = 'investigating', investigating_at = CURRENT_TIMESTAMP, investigating_by =  WHERE alert_id =  AND status IN ('new', 'acknowledged', 'assigned') RETURNING *, [context.user_id, alert_id]);
      if (res.rowCount === 0) return reply.status(404).send({ error: 'Not Found or invalid state' });
      await logAuditEvent({ operator_id: context.user_id, role: context.role, action: 'alert_investigated', target_type: 'alert', target_id: alert_id, request_id: context.request_id, route: '/api/alerts/:alert_id/investigate', metadata: { alert_id }});
      return res.rows[0];
    } catch (err) { return reply.status(500).send({ error: 'Internal Server Error' }); }
  });

  fastify.post('/api/alerts/:alert_id/resolve', { preHandler: [requirePermission('alerts:write')] }, async (request, reply) => {
    const { alert_id } = request.params as { alert_id: string };
    const { notes } = request.body as { notes: string };
    const context = request.userContext!;
    if (!pool) return reply.status(503).send({ error: 'Database unavailable' });
    try {
      const res = await pool.query(UPDATE alerts SET status = 'resolved', resolved_at = CURRENT_TIMESTAMP, resolved_by = , resolution_notes =  WHERE alert_id =  AND status != 'resolved' RETURNING *, [context.user_id, notes, alert_id]);
      if (res.rowCount === 0) return reply.status(404).send({ error: 'Not Found or invalid state' });
      await logAuditEvent({ operator_id: context.user_id, role: context.role, action: 'alert_resolved', target_type: 'alert', target_id: alert_id, request_id: context.request_id, route: '/api/alerts/:alert_id/resolve', metadata: { alert_id, notes }});
      return res.rows[0];
    } catch (err) { return reply.status(500).send({ error: 'Internal Server Error' }); }
  });

  fastify.post('/api/alerts/:alert_id/reopen', { preHandler: [requirePermission('alerts:write')] }, async (request, reply) => {
    const { alert_id } = request.params as { alert_id: string };
    const context = request.userContext!;
    if (!pool) return reply.status(503).send({ error: 'Database unavailable' });
    try {
      const res = await pool.query(UPDATE alerts SET status = 'new', resolved_at = NULL, resolved_by = NULL, resolution_notes = NULL WHERE alert_id =  AND status = 'resolved' RETURNING *, [alert_id]);
      if (res.rowCount === 0) return reply.status(404).send({ error: 'Not Found or invalid state' });
      await logAuditEvent({ operator_id: context.user_id, role: context.role, action: 'alert_reopened', target_type: 'alert', target_id: alert_id, request_id: context.request_id, route: '/api/alerts/:alert_id/reopen', metadata: { alert_id }});
      return res.rows[0];
    } catch (err) { return reply.status(500).send({ error: 'Internal Server Error' }); }
  });
}
