import { FastifyRequest, FastifyReply } from 'fastify';
import { UserRole, ROLE_PERMISSIONS, Permission } from './roles';
import { verifyJWT } from './jwtVerifier';
import { config } from '../config';

export interface UserContext {
  user_id: string;
  role: UserRole;
  request_id: string;
  permissions: Permission[];
}

declare module 'fastify' {
  interface FastifyRequest {
    userContext?: UserContext;
  }
}

export async function parseUserContext(request: FastifyRequest, reply: FastifyReply) {
  const requestIdHeader = request.headers['x-q-sight-request-id'] as string || `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Unauthorized', message: 'Missing or invalid Authorization header.' });
  }

  const token = authHeader.substring(7);
  try {
    const payload = await verifyJWT(token);
    
    // Extract subject as user_id
    const user_id = String(payload.sub || payload.user_id);
    if (!user_id) throw new Error('JWT missing subject claim (sub or user_id)');
    
    // Extract role from claims (e.g., custom claim or groups)
    let roleStr = payload.role || (Array.isArray(payload.groups) ? payload.groups[0] : undefined);
    
    // Validate role, default to operator if missing, but require it in strict mode?
    // Let's enforce deny-by-default: if role is missing or invalid, we don't grant anything
    const validRoles: UserRole[] = ['operator', 'supervisor', 'auditor', 'admin'];
    if (!validRoles.includes(roleStr as UserRole)) {
       throw new Error('Invalid or missing role in token');
    }
    
    const role: UserRole = roleStr as UserRole;
    const permissions = ROLE_PERMISSIONS[role] || [];

    request.userContext = {
      user_id,
      role,
      request_id: requestIdHeader,
      permissions,
    };
  } catch (error: any) {
    request.log.error(`JWT Verification failed: ${error.message}`);
    return reply.status(401).send({ error: 'Unauthorized', message: 'Invalid token' });
  }
}
