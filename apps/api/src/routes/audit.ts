import { FastifyInstance } from 'fastify';
import { pool } from '../db';
import { requirePermission } from '../auth/requirePermission';
import { logAuditEvent } from '../audit/auditLogger';

// Pre-defined mock audit logs for development fallback when database is missing
const mockAuditLogs = [
  {
    id: 1,
    operator_id: 'dev_operator',
    role: 'operator',
    action: 'camera_view_redacted',
    target_type: 'camera',
    target_id: '1c2d3e4f-5678-490a-bcde-f12345678901',
    request_id: 'req_mock_1',
    route: '/api/cameras/authorized',
    metadata: { message: 'Camera metadata restricted by role' },
    timestamp: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 2,
    operator_id: 'dev_supervisor',
    role: 'supervisor',
    action: 'camera_view_authorized',
    target_type: 'camera',
    target_id: '1c2d3e4f-5678-490a-bcde-f12345678901',
    request_id: 'req_mock_2',
    route: '/api/cameras/authorized',
    metadata: { camera_name: 'Refinery Perimeter North' },
    timestamp: new Date(Date.now() - 1800000).toISOString()
  },
  {
    id: 3,
    operator_id: 'dev_operator',
    role: 'operator',
    action: 'access_denied',
    target_type: 'endpoint',
    target_id: '/api/audit/logs',
    request_id: 'req_mock_3',
    route: '/api/audit/logs',
    metadata: { required_permission: 'audit:read' },
    timestamp: new Date(Date.now() - 600000).toISOString()
  }
];

export async function auditRoutes(fastify: FastifyInstance) {
  // GET /api/audit/logs
  fastify.get('/api/audit/logs', {
    preHandler: [requirePermission('audit:read')]
  }, async (request, reply) => {
    const timestamp = new Date().toISOString();
    const context = request.userContext!;

    // Log the audit viewer access event (non-recursively)
    await logAuditEvent({
      operator_id: context.user_id,
      role: context.role,
      action: 'audit_logs_viewed',
      target_type: 'logs_panel',
      target_id: null,
      request_id: context.request_id,
      route: '/api/audit/logs',
      metadata: { limit: request.query }
    });

    // Parse query params
    const query = request.query as any;
    let limit = parseInt(query.limit || '50', 10);
    if (isNaN(limit) || limit < 1) limit = 50;
    if (limit > 200) limit = 200;

    const actionFilter = query.action;
    const targetTypeFilter = query.target_type;
    const sinceFilter = query.since;

    if (!pool) {
      // Mock fallback for local dev when DB is disconnected
      let items = [...mockAuditLogs];
      if (actionFilter) items = items.filter(x => x.action === actionFilter);
      if (targetTypeFilter) items = items.filter(x => x.target_type === targetTypeFilter);
      if (sinceFilter) items = items.filter(x => new Date(x.timestamp).getTime() >= new Date(sinceFilter).getTime());
      
      items = items.slice(0, limit);

      return {
        source: 'mock',
        count: items.length,
        timestamp,
        items
      };
    }

    try {
      let sql = `
        SELECT 
          id, 
          operator_id, 
          role, 
          action, 
          target_type, 
          target_id, 
          request_id, 
          route, 
          metadata, 
          zoom_level, 
          timestamp 
        FROM audit_logs
      `;
      const conditions: string[] = [];
      const values: any[] = [];
      let valIdx = 1;

      if (actionFilter) {
        conditions.push(`action = $${valIdx++}`);
        values.push(actionFilter);
      }
      if (targetTypeFilter) {
        conditions.push(`target_type = $${valIdx++}`);
        values.push(targetTypeFilter);
      }
      if (sinceFilter) {
        conditions.push(`timestamp >= $${valIdx++}`);
        values.push(sinceFilter);
      }

      if (conditions.length > 0) {
        sql += ` WHERE ` + conditions.join(' AND ');
      }

      sql += ` ORDER BY timestamp DESC LIMIT $${valIdx}`;
      values.push(limit);

      const res = await pool.query(sql, values);

      const items = res.rows.map(row => ({
        id: parseInt(row.id, 10),
        operator_id: row.operator_id,
        role: row.role || 'unknown',
        action: row.action,
        target_type: row.target_type,
        target_id: row.target_id,
        request_id: row.request_id || 'unknown',
        route: row.route,
        metadata: row.metadata,
        zoom_level: row.zoom_level ? parseFloat(row.zoom_level) : null,
        timestamp: row.timestamp
      }));

      return {
        source: 'database',
        count: items.length,
        timestamp,
        items
      };
    } catch (err: any) {
      fastify.log.error('Database query failed for audit logs:', err.message || err);
      reply.status(500).send({
        error: 'Database Error',
        message: 'Failed to retrieve compliance audit logs.'
      });
    }
  });

  // GET /api/audit/summary
  fastify.get('/api/audit/summary', {
    preHandler: [requirePermission('audit:summary:read')]
  }, async (request, reply) => {
    const timestamp = new Date().toISOString();
    const context = request.userContext!;

    // Log the summary view event (non-recursively)
    await logAuditEvent({
      operator_id: context.user_id,
      role: context.role,
      action: 'audit_summary_viewed',
      target_type: 'summary_panel',
      target_id: null,
      request_id: context.request_id,
      route: '/api/audit/summary',
      metadata: null
    });

    if (!pool) {
      // Build mock summary from mock items
      const summaryItems = [
        { group_type: 'action', key: 'camera_view_redacted', count: 1 },
        { group_type: 'action', key: 'camera_view_authorized', count: 1 },
        { group_type: 'action', key: 'access_denied', count: 1 },
        { group_type: 'target_type', key: 'camera', count: 2 },
        { group_type: 'target_type', key: 'endpoint', count: 1 },
        { group_type: 'role', key: 'operator', count: 2 },
        { group_type: 'role', key: 'supervisor', count: 1 }
      ];
      return {
        source: 'mock',
        count: summaryItems.length,
        timestamp,
        items: summaryItems
      };
    }

    try {
      // Query counts grouped by action, target_type, and role in parallel
      const actionQuery = pool.query(`
        SELECT 'action' as group_type, action as key, count(*)::int as count 
        FROM audit_logs GROUP BY action;
      `);
      const targetQuery = pool.query(`
        SELECT 'target_type' as group_type, COALESCE(target_type, 'unspecified') as key, count(*)::int as count 
        FROM audit_logs GROUP BY target_type;
      `);
      const roleQuery = pool.query(`
        SELECT 'role' as group_type, COALESCE(role, 'unspecified') as key, count(*)::int as count 
        FROM audit_logs GROUP BY role;
      `);

      const [actionRes, targetRes, roleRes] = await Promise.all([actionQuery, targetQuery, roleQuery]);

      const items = [...actionRes.rows, ...targetRes.rows, ...roleRes.rows];

      return {
        source: 'database',
        count: items.length,
        timestamp,
        items
      };
    } catch (err: any) {
      fastify.log.error('Database query failed for audit summary:', err.message || err);
      reply.status(500).send({
        error: 'Database Error',
        message: 'Failed to retrieve compliance audit summary.'
      });
    }
  });
}
