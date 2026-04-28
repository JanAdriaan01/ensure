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
  
  // Invoice permissions
  INVOICE_VIEW: 'invoice:view',
  INVOICE_CREATE: 'invoice:create',
  INVOICE_EDIT: 'invoice:edit',
  INVOICE_DELETE: 'invoice:delete',
  INVOICE_PAY: 'invoice:pay',
  
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
  
  // OHS (Safety) permissions
  OHS_VIEW: 'ohs:view',
  OHS_CREATE: 'ohs:create',
  OHS_EDIT: 'ohs:edit',
  OHS_DELETE: 'ohs:delete',
  
  // Report permissions
  REPORT_VIEW: 'report:view',
  REPORT_EXPORT: 'report:export',
  
  // Payroll permissions
  PAYROLL_VIEW: 'payroll:view',
  PAYROLL_PROCESS: 'payroll:process',
  PAYROLL_EDIT: 'payroll:edit',
  
  // Reconciliation permissions
  RECONCILIATION_VIEW: 'reconciliation:view',
  RECONCILIATION_MATCH: 'reconciliation:match',
  RECONCILIATION_EDIT: 'reconciliation:edit',
  
  // Admin permissions
  ADMIN_ACCESS: 'admin:access',
  USER_MANAGE: 'user:manage',
  SETTINGS_EDIT: 'settings:edit',
};

// Role to permissions mapping
const rolePermissions = {
  // ADMIN - Full system access
  [ROLES.ADMIN]: Object.values(PERMISSIONS),
  
  // MANAGER - Management level access
  [ROLES.MANAGER]: [
    // Job Management
    PERMISSIONS.JOB_VIEW,
    PERMISSIONS.JOB_CREATE,
    PERMISSIONS.JOB_EDIT,
    PERMISSIONS.JOB_FINALIZE,
    
    // Quote Management
    PERMISSIONS.QUOTE_VIEW,
    PERMISSIONS.QUOTE_CREATE,
    PERMISSIONS.QUOTE_EDIT,
    PERMISSIONS.QUOTE_APPROVE,
    
    // Employee Management
    PERMISSIONS.EMPLOYEE_VIEW,
    PERMISSIONS.EMPLOYEE_CREATE,
    PERMISSIONS.EMPLOYEE_EDIT,
    
    // Client Management
    PERMISSIONS.CLIENT_VIEW,
    PERMISSIONS.CLIENT_CREATE,
    PERMISSIONS.CLIENT_EDIT,
    
    // Invoice Management
    PERMISSIONS.INVOICE_VIEW,
    PERMISSIONS.INVOICE_CREATE,
    PERMISSIONS.INVOICE_EDIT,
    PERMISSIONS.INVOICE_PAY,
    
    // Stock Management
    PERMISSIONS.STOCK_VIEW,
    PERMISSIONS.STOCK_CREATE,
    PERMISSIONS.STOCK_ADJUST,
    
    // Tool Management
    PERMISSIONS.TOOL_VIEW,
    PERMISSIONS.TOOL_CREATE,
    PERMISSIONS.TOOL_CHECKOUT,
    
    // Schedule Management
    PERMISSIONS.SCHEDULE_VIEW,
    PERMISSIONS.SCHEDULE_CREATE,
    PERMISSIONS.SCHEDULE_EDIT,
    
    // OHS Management
    PERMISSIONS.OHS_VIEW,
    PERMISSIONS.OHS_CREATE,
    PERMISSIONS.OHS_EDIT,
    
    // Reports
    PERMISSIONS.REPORT_VIEW,
    PERMISSIONS.REPORT_EXPORT,
    
    // Payroll
    PERMISSIONS.PAYROLL_VIEW,
    PERMISSIONS.PAYROLL_PROCESS,
    
    // Reconciliation
    PERMISSIONS.RECONCILIATION_VIEW,
    PERMISSIONS.RECONCILIATION_MATCH,
    
    // Admin
    PERMISSIONS.SETTINGS_EDIT,
  ],
  
  // SUPERVISOR - Supervisory access
  [ROLES.SUPERVISOR]: [
    // Job Management
    PERMISSIONS.JOB_VIEW,
    PERMISSIONS.JOB_CREATE,
    PERMISSIONS.JOB_EDIT,
    
    // Quote Management
    PERMISSIONS.QUOTE_VIEW,
    
    // Employee Management
    PERMISSIONS.EMPLOYEE_VIEW,
    
    // Client Management
    PERMISSIONS.CLIENT_VIEW,
    
    // Invoice Management
    PERMISSIONS.INVOICE_VIEW,
    
    // Stock Management
    PERMISSIONS.STOCK_VIEW,
    
    // Tool Management
    PERMISSIONS.TOOL_VIEW,
    PERMISSIONS.TOOL_CHECKOUT,
    
    // Schedule Management
    PERMISSIONS.SCHEDULE_VIEW,
    PERMISSIONS.SCHEDULE_CREATE,
    
    // OHS Management
    PERMISSIONS.OHS_VIEW,
    PERMISSIONS.OHS_CREATE,
    
    // Reports
    PERMISSIONS.REPORT_VIEW,
    
    // Payroll
    PERMISSIONS.PAYROLL_VIEW,
  ],
  
  // USER - Standard user access
  [ROLES.USER]: [
    // Job Management
    PERMISSIONS.JOB_VIEW,
    
    // Quote Management
    PERMISSIONS.QUOTE_VIEW,
    
    // Employee Management
    PERMISSIONS.EMPLOYEE_VIEW,
    
    // Client Management
    PERMISSIONS.CLIENT_VIEW,
    
    // Invoice Management
    PERMISSIONS.INVOICE_VIEW,
    
    // Stock Management
    PERMISSIONS.STOCK_VIEW,
    
    // Tool Management
    PERMISSIONS.TOOL_VIEW,
    
    // Schedule Management
    PERMISSIONS.SCHEDULE_VIEW,
    
    // OHS Management
    PERMISSIONS.OHS_VIEW,
  ],
  
  // VIEWER - Read-only access
  [ROLES.VIEWER]: [
    PERMISSIONS.JOB_VIEW,
    PERMISSIONS.QUOTE_VIEW,
    PERMISSIONS.EMPLOYEE_VIEW,
    PERMISSIONS.CLIENT_VIEW,
    PERMISSIONS.INVOICE_VIEW,
    PERMISSIONS.STOCK_VIEW,
    PERMISSIONS.TOOL_VIEW,
    PERMISSIONS.SCHEDULE_VIEW,
    PERMISSIONS.OHS_VIEW,
    PERMISSIONS.REPORT_VIEW,
  ],
};

// ============================================
// CORE PERMISSION FUNCTIONS
// ============================================

// Check if user has a specific permission
export function hasPermission(userRole, permission, userPermissions = []) {
  if (!userRole) return false;
  if (userRole === ROLES.ADMIN) return true;
  if (userPermissions.includes(permission)) return true;
  return rolePermissions[userRole]?.includes(permission) || false;
}

// Get all permissions for a role
export function getRolePermissions(role) {
  return rolePermissions[role] || [];
}

// Check if user has any of the listed permissions
export function hasAnyPermission(userRole, permissions, userPermissions = []) {
  if (!userRole) return false;
  if (userRole === ROLES.ADMIN) return true;
  return permissions.some(permission => 
    userPermissions.includes(permission) || 
    rolePermissions[userRole]?.includes(permission)
  );
}

// Check if user has all listed permissions
export function hasAllPermissions(userRole, permissions, userPermissions = []) {
  if (!userRole) return false;
  if (userRole === ROLES.ADMIN) return true;
  return permissions.every(permission => 
    userPermissions.includes(permission) || 
    rolePermissions[userRole]?.includes(permission)
  );
}

// Check user role hierarchy
export function hasRole(userRole, requiredRole) {
  if (!userRole) return false;
  const roleHierarchy = {
    [ROLES.ADMIN]: 5,
    [ROLES.MANAGER]: 4,
    [ROLES.SUPERVISOR]: 3,
    [ROLES.USER]: 2,
    [ROLES.VIEWER]: 1,
  };
  const userLevel = roleHierarchy[userRole] || 0;
  const requiredLevel = roleHierarchy[requiredRole] || 0;
  return userLevel >= requiredLevel;
}

// Get user's effective permissions (role + custom)
export function getUserEffectivePermissions(userRole, userPermissions = []) {
  const rolePerms = getRolePermissions(userRole);
  return [...new Set([...rolePerms, ...userPermissions])];
}

// Batch check multiple permissions
export function batchCheckPermissions(userRole, permissions, userPermissions = []) {
  const results = {};
  permissions.forEach(perm => {
    results[perm] = hasPermission(userRole, perm, userPermissions);
  });
  return results;
}

// ============================================
// MODULE PERMISSIONS
// ============================================

export const ModulePermissions = {
  // Financial Module
  financial: {
    view: PERMISSIONS.JOB_VIEW,
    create: PERMISSIONS.JOB_CREATE,
    edit: PERMISSIONS.JOB_EDIT,
    delete: PERMISSIONS.JOB_DELETE,
    finalize: PERMISSIONS.JOB_FINALIZE,
  },
  
  // HR Module
  hr: {
    view: PERMISSIONS.EMPLOYEE_VIEW,
    create: PERMISSIONS.EMPLOYEE_CREATE,
    edit: PERMISSIONS.EMPLOYEE_EDIT,
    delete: PERMISSIONS.EMPLOYEE_DELETE,
    payroll: PERMISSIONS.EMPLOYEE_PAYROLL,
  },
  
  // Operations Module
  operations: {
    stock: {
      view: PERMISSIONS.STOCK_VIEW,
      create: PERMISSIONS.STOCK_CREATE,
      edit: PERMISSIONS.STOCK_EDIT,
      delete: PERMISSIONS.STOCK_DELETE,
      adjust: PERMISSIONS.STOCK_ADJUST,
    },
    tools: {
      view: PERMISSIONS.TOOL_VIEW,
      create: PERMISSIONS.TOOL_CREATE,
      edit: PERMISSIONS.TOOL_EDIT,
      delete: PERMISSIONS.TOOL_DELETE,
      checkout: PERMISSIONS.TOOL_CHECKOUT,
    },
    schedule: {
      view: PERMISSIONS.SCHEDULE_VIEW,
      create: PERMISSIONS.SCHEDULE_CREATE,
      edit: PERMISSIONS.SCHEDULE_EDIT,
      delete: PERMISSIONS.SCHEDULE_DELETE,
    },
    ohs: {
      view: PERMISSIONS.OHS_VIEW,
      create: PERMISSIONS.OHS_CREATE,
      edit: PERMISSIONS.OHS_EDIT,
      delete: PERMISSIONS.OHS_DELETE,
    },
  },
};

// Check if user can access a specific module action
export function canAccessModule(userRole, module, action = 'view', userPermissions = []) {
  const moduleConfig = ModulePermissions[module];
  if (!moduleConfig) return false;
  
  let permission;
  if (typeof action === 'string') {
    permission = moduleConfig[action];
  } else {
    return false;
  }
  
  if (!permission) return false;
  return hasPermission(userRole, permission, userPermissions);
}

// ============================================
// API MIDDLEWARE
// ============================================

// Permission check for API routes
export function requirePermission(permission) {
  return (req, res, next) => {
    const { userRole, userPermissions } = req;
    
    if (!hasPermission(userRole, permission, userPermissions)) {
      return res.status(403).json({ 
        error: 'Forbidden: Insufficient permissions',
        required: permission,
        role: userRole,
      });
    }
    
    next();
  };
}

// Role check for API routes
export function requireRole(role) {
  return (req, res, next) => {
    const { userRole } = req;
    
    if (!hasRole(userRole, role)) {
      return res.status(403).json({ 
        error: 'Forbidden: Insufficient role',
        required: role,
        role: userRole,
      });
    }
    
    next();
  };
}

// ============================================
// UI HELPER FUNCTIONS
// ============================================

// Get permission label for display
export function getPermissionLabel(permission) {
  const labels = {
    [PERMISSIONS.JOB_VIEW]: 'View Jobs',
    [PERMISSIONS.JOB_CREATE]: 'Create Jobs',
    [PERMISSIONS.JOB_EDIT]: 'Edit Jobs',
    [PERMISSIONS.JOB_DELETE]: 'Delete Jobs',
    [PERMISSIONS.JOB_FINALIZE]: 'Finalize Jobs',
    [PERMISSIONS.QUOTE_VIEW]: 'View Quotes',
    [PERMISSIONS.QUOTE_CREATE]: 'Create Quotes',
    [PERMISSIONS.QUOTE_EDIT]: 'Edit Quotes',
    [PERMISSIONS.QUOTE_DELETE]: 'Delete Quotes',
    [PERMISSIONS.QUOTE_APPROVE]: 'Approve Quotes',
    [PERMISSIONS.EMPLOYEE_VIEW]: 'View Employees',
    [PERMISSIONS.EMPLOYEE_CREATE]: 'Create Employees',
    [PERMISSIONS.EMPLOYEE_EDIT]: 'Edit Employees',
    [PERMISSIONS.EMPLOYEE_DELETE]: 'Delete Employees',
    [PERMISSIONS.EMPLOYEE_PAYROLL]: 'Process Payroll',
    [PERMISSIONS.CLIENT_VIEW]: 'View Clients',
    [PERMISSIONS.CLIENT_CREATE]: 'Create Clients',
    [PERMISSIONS.CLIENT_EDIT]: 'Edit Clients',
    [PERMISSIONS.CLIENT_DELETE]: 'Delete Clients',
    [PERMISSIONS.INVOICE_VIEW]: 'View Invoices',
    [PERMISSIONS.INVOICE_CREATE]: 'Create Invoices',
    [PERMISSIONS.INVOICE_EDIT]: 'Edit Invoices',
    [PERMISSIONS.INVOICE_DELETE]: 'Delete Invoices',
    [PERMISSIONS.INVOICE_PAY]: 'Mark Invoices as Paid',
    [PERMISSIONS.STOCK_VIEW]: 'View Stock',
    [PERMISSIONS.STOCK_CREATE]: 'Create Stock Items',
    [PERMISSIONS.STOCK_EDIT]: 'Edit Stock Items',
    [PERMISSIONS.STOCK_DELETE]: 'Delete Stock Items',
    [PERMISSIONS.STOCK_ADJUST]: 'Adjust Stock Levels',
    [PERMISSIONS.TOOL_VIEW]: 'View Tools',
    [PERMISSIONS.TOOL_CREATE]: 'Create Tools',
    [PERMISSIONS.TOOL_EDIT]: 'Edit Tools',
    [PERMISSIONS.TOOL_DELETE]: 'Delete Tools',
    [PERMISSIONS.TOOL_CHECKOUT]: 'Checkout Tools',
    [PERMISSIONS.SCHEDULE_VIEW]: 'View Schedule',
    [PERMISSIONS.SCHEDULE_CREATE]: 'Create Schedule',
    [PERMISSIONS.SCHEDULE_EDIT]: 'Edit Schedule',
    [PERMISSIONS.SCHEDULE_DELETE]: 'Delete Schedule',
    [PERMISSIONS.OHS_VIEW]: 'View OHS Records',
    [PERMISSIONS.OHS_CREATE]: 'Create OHS Records',
    [PERMISSIONS.OHS_EDIT]: 'Edit OHS Records',
    [PERMISSIONS.OHS_DELETE]: 'Delete OHS Records',
    [PERMISSIONS.REPORT_VIEW]: 'View Reports',
    [PERMISSIONS.REPORT_EXPORT]: 'Export Reports',
    [PERMISSIONS.PAYROLL_VIEW]: 'View Payroll',
    [PERMISSIONS.PAYROLL_PROCESS]: 'Process Payroll',
    [PERMISSIONS.RECONCILIATION_VIEW]: 'View Reconciliation',
    [PERMISSIONS.RECONCILIATION_MATCH]: 'Match Transactions',
    [PERMISSIONS.ADMIN_ACCESS]: 'Admin Access',
    [PERMISSIONS.USER_MANAGE]: 'Manage Users',
    [PERMISSIONS.SETTINGS_EDIT]: 'Edit Settings',
  };
  return labels[permission] || permission;
}

// Get role label for display
export function getRoleLabel(role) {
  const labels = {
    [ROLES.ADMIN]: 'Administrator',
    [ROLES.MANAGER]: 'Manager',
    [ROLES.SUPERVISOR]: 'Supervisor',
    [ROLES.USER]: 'User',
    [ROLES.VIEWER]: 'Viewer',
  };
  return labels[role] || role;
}

// ============================================
// DEFAULT EXPORT
// ============================================

export default {
  ROLES,
  PERMISSIONS,
  hasPermission,
  getRolePermissions,
  hasAnyPermission,
  hasAllPermissions,
  hasRole,
  getUserEffectivePermissions,
  batchCheckPermissions,
  ModulePermissions,
  canAccessModule,
  requirePermission,
  requireRole,
  getPermissionLabel,
  getRoleLabel,
};