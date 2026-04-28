// Role definitions
export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  SUPERVISOR: 'supervisor',
  USER: 'user',
  VIEWER: 'viewer',
};

// Permission definitions
export const PERMISSIONS = {
  // Job permissions
  JOB_VIEW: 'job:view',
  JOB_CREATE: 'job:create',
  JOB_EDIT: 'job:edit',
  JOB_DELETE: 'job:delete',
  JOB_FINALIZE: 'job:finalize',
  
  // Quote permissions
  QUOTE_VIEW: 'quote:view',
  QUOTE_CREATE: 'quote:create',
  QUOTE_EDIT: 'quote:edit',
  QUOTE_DELETE: 'quote:delete',
  QUOTE_APPROVE: 'quote:approve',
  
  // Employee permissions
  EMPLOYEE_VIEW: 'employee:view',
  EMPLOYEE_CREATE: 'employee:create',
  EMPLOYEE_EDIT: 'employee:edit',
  EMPLOYEE_DELETE: 'employee:delete',
  EMPLOYEE_PAYROLL: 'employee:payroll',
  
  // Client permissions
  CLIENT_VIEW: 'client:view',
  CLIENT_CREATE: 'client:create',
  CLIENT_EDIT: 'client:edit',
  CLIENT_DELETE: 'client:delete',
  
  // Stock permissions
  STOCK_VIEW: 'stock:view',
  STOCK_CREATE: 'stock:create',
  STOCK_EDIT: 'stock:edit',
  STOCK_DELETE: 'stock:delete',
  STOCK_ADJUST: 'stock:adjust',
  
  // Tool permissions
  TOOL_VIEW: 'tool:view',
  TOOL_CREATE: 'tool:create',
  TOOL_EDIT: 'tool:edit',
  TOOL_DELETE: 'tool:delete',
  TOOL_CHECKOUT: 'tool:checkout',
  
  // Schedule permissions
  SCHEDULE_VIEW: 'schedule:view',
  SCHEDULE_CREATE: 'schedule:create',
  SCHEDULE_EDIT: 'schedule:edit',
  SCHEDULE_DELETE: 'schedule:delete',
  
  // Report permissions
  REPORT_VIEW: 'report:view',
  REPORT_EXPORT: 'report:export',
  
  // Admin permissions
  ADMIN_ACCESS: 'admin:access',
  USER_MANAGE: 'user:manage',
  SETTINGS_EDIT: 'settings:edit',
};

// Role to permissions mapping
const rolePermissions = {
  [ROLES.ADMIN]: Object.values(PERMISSIONS),
  
  [ROLES.MANAGER]: [
    PERMISSIONS.JOB_VIEW, PERMISSIONS.JOB_CREATE, PERMISSIONS.JOB_EDIT, PERMISSIONS.JOB_FINALIZE,
    PERMISSIONS.QUOTE_VIEW, PERMISSIONS.QUOTE_CREATE, PERMISSIONS.QUOTE_EDIT,
    PERMISSIONS.EMPLOYEE_VIEW, PERMISSIONS.EMPLOYEE_CREATE, PERMISSIONS.EMPLOYEE_EDIT,
    PERMISSIONS.CLIENT_VIEW, PERMISSIONS.CLIENT_CREATE, PERMISSIONS.CLIENT_EDIT,
    PERMISSIONS.STOCK_VIEW, PERMISSIONS.STOCK_CREATE, PERMISSIONS.STOCK_ADJUST,
    PERMISSIONS.TOOL_VIEW, PERMISSIONS.TOOL_CREATE, PERMISSIONS.TOOL_CHECKOUT,
    PERMISSIONS.SCHEDULE_VIEW, PERMISSIONS.SCHEDULE_CREATE, PERMISSIONS.SCHEDULE_EDIT,
    PERMISSIONS.REPORT_VIEW, PERMISSIONS.REPORT_EXPORT,
  ],
  
  [ROLES.SUPERVISOR]: [
    PERMISSIONS.JOB_VIEW, PERMISSIONS.JOB_CREATE, PERMISSIONS.JOB_EDIT,
    PERMISSIONS.QUOTE_VIEW,
    PERMISSIONS.EMPLOYEE_VIEW,
    PERMISSIONS.CLIENT_VIEW,
    PERMISSIONS.SCHEDULE_VIEW, PERMISSIONS.SCHEDULE_CREATE,
    PERMISSIONS.TOOL_CHECKOUT,
  ],
  
  [ROLES.USER]: [
    PERMISSIONS.JOB_VIEW,
    PERMISSIONS.QUOTE_VIEW,
    PERMISSIONS.EMPLOYEE_VIEW,
    PERMISSIONS.CLIENT_VIEW,
    PERMISSIONS.SCHEDULE_VIEW,
  ],
  
  [ROLES.VIEWER]: [
    PERMISSIONS.JOB_VIEW,
    PERMISSIONS.QUOTE_VIEW,
    PERMISSIONS.EMPLOYEE_VIEW,
  ],
};

// Check if user has permission
export function hasPermission(userRole, permission, userPermissions = []) {
  if (userRole === ROLES.ADMIN) return true;
  return rolePermissions[userRole]?.includes(permission) || userPermissions.includes(permission);
}

// Get user role permissions
export function getRolePermissions(role) {
  return rolePermissions[role] || [];
}

// Check if user has any of the listed permissions
export function hasAnyPermission(userRole, permissions, userPermissions = []) {
  if (userRole === ROLES.ADMIN) return true;
  return permissions.some(p => 
    rolePermissions[userRole]?.includes(p) || userPermissions.includes(p)
  );
}

// Check if user has all listed permissions
export function hasAllPermissions(userRole, permissions, userPermissions = []) {
  if (userRole === ROLES.ADMIN) return true;
  return permissions.every(p => 
    rolePermissions[userRole]?.includes(p) || userPermissions.includes(p)
  );
}