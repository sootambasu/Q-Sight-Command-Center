export type UserRole = 'operator' | 'supervisor' | 'auditor' | 'admin';

export type Permission =
  | 'telemetry:read'
  | 'assets:read'
  | 'assets:sensitive:read'
  | 'cameras:summary:read'
  | 'cameras:metadata:read'
  | 'audit:read'
  | 'audit:summary:read'
  | 'admin:all';

// Define roles and their corresponding permissions
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  operator: [
    'telemetry:read',
    'assets:read',
    'cameras:summary:read',
  ],
  supervisor: [
    'telemetry:read',
    'assets:read',
    'assets:sensitive:read',
    'cameras:summary:read',
    'cameras:metadata:read',
  ],
  auditor: [
    'audit:read',
    'audit:summary:read',
  ],
  admin: [
    'telemetry:read',
    'assets:read',
    'assets:sensitive:read',
    'cameras:summary:read',
    'cameras:metadata:read',
    'audit:read',
    'audit:summary:read',
    'admin:all',
  ],
};

/**
 * Checks if a given role has a specific permission.
 * Admin role automatically receives all permissions.
 */
export function hasPermission(role: UserRole | string, permission: Permission): boolean {
  if (role === 'admin') {
    return true;
  }
  const permissions = ROLE_PERMISSIONS[role as UserRole];
  if (!permissions) {
    return false;
  }
  return permissions.includes(permission);
}
