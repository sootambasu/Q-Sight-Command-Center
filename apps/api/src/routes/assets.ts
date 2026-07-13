import { FastifyInstance } from 'fastify';
import { pool } from '../db';
import { mockAssets } from '../mock-data';
import { IndustrialAssetSchema } from '@q-sight/shared';
import { requirePermission } from '../auth/requirePermission';
import { logAuditEvent } from '../audit/auditLogger';

export async function assetsRoutes(fastify: FastifyInstance) {
  fastify.get('/api/assets', {
    preHandler: [requirePermission('assets:read')]
  }, async (request, reply) => {
    const timestamp = new Date().toISOString();
    const context = request.userContext!;

    // Check if the user has permission to view sensitive boundary/geofence data
    const hasSensitiveAccess = context.permissions.includes('assets:sensitive:read');

    // Helper to filter/sanitize assets based on permissions
    const sanitizeAsset = (asset: any) => {
      if (!hasSensitiveAccess) {
        return {
          ...asset,
          boundary: null
        };
      }
      return asset;
    };

    // Log the access event
    if (hasSensitiveAccess) {
      await logAuditEvent({
        operator_id: context.user_id,
        role: context.role,
        action: 'sensitive_boundary_accessed',
        target_type: 'asset_boundaries',
        target_id: 'all_assets',
        request_id: context.request_id,
        route: '/api/assets',
        metadata: { message: 'Full asset boundaries returned to supervisor/admin.' }
      });
    } else {
      await logAuditEvent({
        operator_id: context.user_id,
        role: context.role,
        action: 'assets_viewed_redacted',
        target_type: 'asset',
        target_id: 'all_assets',
        request_id: context.request_id,
        route: '/api/assets',
        metadata: { message: 'Asset boundary details omitted for operator/auditor.' }
      });
    }

    if (!pool) {
      const items = mockAssets.map(sanitizeAsset);
      return {
        source: 'mock',
        count: items.length,
        timestamp,
        items
      };
    }

    try {
      const query = `
        SELECT 
          id, 
          name, 
          description, 
          type, 
          ST_Y(location) as latitude, 
          ST_X(location) as longitude, 
          ST_AsGeoJSON(boundary) as boundary, 
          created_at, 
          updated_at 
        FROM industrial_assets;
      `;
      const res = await pool.query(query);

      if (res.rows.length === 0) {
        const items = mockAssets.map(sanitizeAsset);
        return {
          source: 'mock',
          count: items.length,
          timestamp,
          items
        };
      }

      const items = res.rows.map(row => {
        const asset = {
          id: row.id,
          name: row.name,
          description: row.description,
          type: row.type,
          latitude: parseFloat(row.latitude),
          longitude: parseFloat(row.longitude),
          boundary: row.boundary ? JSON.parse(row.boundary) : null,
          created_at: row.created_at,
          updated_at: row.updated_at
        };

        // Validate structure with Zod schema (with raw boundary, or null boundary)
        const sanitized = sanitizeAsset(asset);
        IndustrialAssetSchema.parse(sanitized);
        return sanitized;
      });

      return {
        source: 'database',
        count: items.length,
        timestamp,
        items
      };
    } catch (err: any) {
      fastify.log.error('Database query failed for /api/assets, falling back to mock data:', err.message || err);
      const items = mockAssets.map(sanitizeAsset);
      return {
        source: 'mock',
        count: items.length,
        timestamp,
        items
      };
    }
  });
}

