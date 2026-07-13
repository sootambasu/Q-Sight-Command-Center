import { FastifyInstance } from 'fastify';
import { pool } from '../db';
import { mockSensors } from '../mock-data';
import { requirePermission } from '../auth/requirePermission';
import { logAuditEvent } from '../audit/auditLogger';

// =============================================================================
// Sensor Registry Route
// Endpoint: GET /api/sensors/registry
// Table: sensor_registry (migrated from authorized_cameras via migration 005)
// PROHIBITED: stream_url, verification_hash, access_token, api_key, playback_config
// =============================================================================

export async function sensorRegistryRoutes(fastify: FastifyInstance) {
  fastify.get('/api/sensors/registry', {
    preHandler: [requirePermission('cameras:summary:read')]
  }, async (request, reply) => {
    const timestamp = new Date().toISOString();
    const context = request.userContext!;

    // Check if the user has permission to view detailed sensor metadata
    const hasDetailedAccess = context.permissions.includes('cameras:metadata:read');

    // Sanitize sensor record based on permissions.
    // stream_url and verification_hash are NOT in the schema or DB anymore —
    // this sanitization applies to any legacy cached objects that may come from
    // intermediate layers. The SELECT query never fetches those columns.
    const sanitizeSensor = (sensor: any) => {
      // If operator (no metadata:read permission), return minimal safe fields only
      if (!hasDetailedAccess) {
        return {
          id: sensor.id,
          asset_id: sensor.asset_id,
          name: sensor.name,
          sensor_category: sensor.sensor_category ?? 'camera',
          status: sensor.status,
          authorization_status: sensor.authorization_status,
          protected: true,
          message: 'Sensor metadata restricted by role'
        };
      }

      // Supervisor/Admin gets full non-secret metadata
      return {
        id: sensor.id,
        asset_id: sensor.asset_id,
        name: sensor.name,
        sensor_category: sensor.sensor_category ?? 'camera',
        status: sensor.status,
        latitude: sensor.latitude,
        longitude: sensor.longitude,
        owner_id: sensor.owner_id,
        authorization_status: sensor.authorization_status,
        registration_status: sensor.registration_status ?? 'registered',
        authorized_at: sensor.authorized_at,
        created_at: sensor.created_at,
        updated_at: sensor.updated_at
      };
    };

    // Log the access audit event
    if (hasDetailedAccess) {
      await logAuditEvent({
        operator_id: context.user_id,
        role: context.role,
        action: 'sensor_metadata_view_authorized',
        target_type: 'sensor_metadata',
        target_id: 'all_sensors',
        request_id: context.request_id,
        route: '/api/sensors/registry',
        metadata: { message: 'Full authorized sensor metadata viewed.' }
      });
    } else {
      await logAuditEvent({
        operator_id: context.user_id,
        role: context.role,
        action: 'sensor_metadata_view_redacted',
        target_type: 'sensor_metadata',
        target_id: 'all_sensors',
        request_id: context.request_id,
        route: '/api/sensors/registry',
        metadata: { message: 'Redacted sensor metadata viewed.' }
      });
    }

    // In production (BUILD_PROFILE=live or NODE_ENV=production), never fall back to mock data
    const isProduction = process.env.NODE_ENV === 'production' || process.env.BUILD_PROFILE === 'live';

    if (!pool) {
      if (isProduction) {
        fastify.log.error('CRITICAL: Database pool unavailable in production. Refusing mock fallback for sensor registry.');
        return reply.status(503).send({
          error: 'Service Unavailable',
          message: 'Sensor registry database is temporarily unavailable. No mock fallback in production.',
          timestamp
        });
      }

      const items = mockSensors.map(sanitizeSensor);
      return {
        source: 'mock',
        count: items.length,
        timestamp,
        items
      };
    }

    try {
      // Query sensor_registry table — stream_url and verification_hash columns do NOT exist
      // after migration 005 and are NEVER selected even if somehow present in older states.
      const query = `
        SELECT
          id,
          asset_id,
          name,
          sensor_category,
          status,
          ST_Y(location) as latitude,
          ST_X(location) as longitude,
          owner_id,
          authorization_status,
          registration_status,
          authorized_at,
          created_at,
          updated_at
        FROM sensor_registry
        ORDER BY created_at DESC;
      `;
      const res = await pool.query(query);

      if (res.rows.length === 0 && !isProduction) {
        // Fall back to mock only in non-production when DB is empty
        const items = mockSensors.map(sanitizeSensor);
        return {
          source: 'mock',
          count: items.length,
          timestamp,
          items
        };
      }

      const items = res.rows.map(row => {
        const rawSensor = {
          id: row.id,
          asset_id: row.asset_id,
          name: row.name,
          sensor_category: row.sensor_category ?? 'camera',
          status: row.status,
          latitude: parseFloat(row.latitude),
          longitude: parseFloat(row.longitude),
          owner_id: row.owner_id,
          authorization_status: row.authorization_status,
          registration_status: row.registration_status ?? 'registered',
          authorized_at: row.authorized_at,
          created_at: row.created_at,
          updated_at: row.updated_at
        };
        return sanitizeSensor(rawSensor);
      });

      return {
        source: 'database',
        count: items.length,
        timestamp,
        items
      };
    } catch (err: any) {
      fastify.log.error('Database query failed for sensor registry:', err.message || err);

      if (isProduction) {
        return reply.status(503).send({
          error: 'Service Unavailable',
          message: 'Sensor registry database query failed. No mock fallback in production.',
          timestamp
        });
      }

      // Dev/staging fallback
      const items = mockSensors.map(sanitizeSensor);
      return {
        source: 'mock',
        count: items.length,
        timestamp,
        items
      };
    }
  });
}
