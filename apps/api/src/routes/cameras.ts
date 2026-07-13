import { FastifyInstance } from 'fastify';
import { pool } from '../db';
import { mockCameras } from '../mock-data';
import { requirePermission } from '../auth/requirePermission';
import { logAuditEvent } from '../audit/auditLogger';

export async function camerasRoutes(fastify: FastifyInstance) {
  fastify.get('/api/cameras/authorized', {
    preHandler: [requirePermission('cameras:summary:read')]
  }, async (request, reply) => {
    const timestamp = new Date().toISOString();
    const context = request.userContext!;

    // Check if the user has permission to view detailed camera metadata
    const hasDetailedAccess = context.permissions.includes('cameras:metadata:read');

    // Helper to sanitize camera record based on permissions
    const sanitizeCamera = (cam: any) => {
      // 1. Always strip stream_url and verification_hash for all roles
      const { stream_url, verification_hash, ...safeBase } = cam;

      // 2. If operator (no metadata:read permission), strip coordinates, owner, timestamps
      if (!hasDetailedAccess) {
        return {
          id: safeBase.id,
          asset_id: safeBase.asset_id,
          name: safeBase.name,
          status: safeBase.status,
          authorization_status: safeBase.authorization_status,
          protected: true,
          message: 'Camera metadata restricted by role'
        };
      }

      // 3. Supervisor/Admin gets full allowed metadata
      return safeBase;
    };

    // Log the access audit event
    if (hasDetailedAccess) {
      await logAuditEvent({
        operator_id: context.user_id,
        role: context.role,
        action: 'camera_metadata_view_authorized',
        target_type: 'camera_metadata',
        target_id: 'all_cameras',
        request_id: context.request_id,
        route: '/api/cameras/authorized',
        metadata: { message: 'Full authorized camera metadata viewed.' }
      });
    } else {
      await logAuditEvent({
        operator_id: context.user_id,
        role: context.role,
        action: 'camera_metadata_view_redacted',
        target_type: 'camera_metadata',
        target_id: 'all_cameras',
        request_id: context.request_id,
        route: '/api/cameras/authorized',
        metadata: { message: 'Redacted camera metadata viewed.' }
      });
    }

    const mockItemsSanitized = mockCameras.map(sanitizeCamera);

    if (!pool) {
      return {
        source: 'mock',
        count: mockItemsSanitized.length,
        timestamp,
        items: mockItemsSanitized
      };
    }

    try {
      // Select metadata columns from the database (still omitting stream_url and verification_hash)
      const query = `
        SELECT 
          id, 
          asset_id, 
          name, 
          status, 
          ST_Y(location) as latitude, 
          ST_X(location) as longitude, 
          owner_id, 
          authorization_status, 
          authorized_at, 
          created_at, 
          updated_at 
        FROM authorized_cameras;
      `;
      const res = await pool.query(query);

      if (res.rows.length === 0) {
        return {
          source: 'mock',
          count: mockItemsSanitized.length,
          timestamp,
          items: mockItemsSanitized
        };
      }

      const items = res.rows.map(row => {
        const rawCam = {
          id: row.id,
          asset_id: row.asset_id,
          name: row.name,
          status: row.status,
          latitude: parseFloat(row.latitude),
          longitude: parseFloat(row.longitude),
          owner_id: row.owner_id,
          authorization_status: row.authorization_status,
          authorized_at: row.authorized_at,
          created_at: row.created_at,
          updated_at: row.updated_at
        };
        return sanitizeCamera(rawCam);
      });

      return {
        source: 'database',
        count: items.length,
        timestamp,
        items
      };
    } catch (err: any) {
      fastify.log.error('Database query failed for authorized cameras, falling back to mock:', err.message || err);
      return {
        source: 'mock',
        count: mockItemsSanitized.length,
        timestamp,
        items: mockItemsSanitized
      };
    }
  });
}

