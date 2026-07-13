import { FastifyRequest, FastifyReply } from 'fastify';
import { UserRole, ROLE_PERMISSIONS, Permission } from './roles';

export interface UserContext {
  user_id: string;
  role: UserRole;
  request_id: string;
  permissions: Permission[];
}

// Extend FastifyRequest interface
declare module 'fastify' {
  interface FastifyRequest {
    userContext?: UserContext;
  }
}

/**
 * Pre-handler hook to resolve the simulated user context from custom request headers.
 * This is a development-only simulated authentication hook.
 */
export async function parseUserContext(request: FastifyRequest, reply: FastifyReply) {
  // Extract headers
  const roleHeader = (request.headers['x-q-sight-role'] as string || 'operator').toLowerCase();
  const userIdHeader = request.headers['x-q-sight-user-id'] as string || `dev_${roleHeader}`;
  const requestIdHeader = request.headers['x-q-sight-request-id'] as string || `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // Default to operator if an invalid role is provided
  let role: UserRole = 'operator';
  if (roleHeader === 'admin' || roleHeader === 'supervisor' || roleHeader === 'auditor' || roleHeader === 'operator') {
    role = roleHeader;
  } else {
    request.log.warn(`⚠️ Invalid x-q-sight-role header: "${roleHeader}". Defaulting to "operator".`);
  }

  // Map role to permissions
  const permissions = ROLE_PERMISSIONS[role] || [];

  // Decorate request
  request.userContext = {
    user_id: userIdHeader,
    role,
    request_id: requestIdHeader,
    permissions,
  };
}
