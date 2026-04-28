export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  SUPERVISOR: 'supervisor',
  EMPLOYEE: 'employee',
  CLIENT: 'client',
  ACCOUNTANT: 'accountant'
};

export const PERMISSIONS = {
  // User management
  VIEW_USERS: 'view_users',
  CREATE_USERS: 'create_users',
  EDIT_USERS: 'edit_users',
  DELETE_USERS: 'delete_users',
  
  // Clients
  VIEW_CLIENTS: 'view_clients',
  CREATE_CLIENTS: 'create_clients',
  EDIT_CLIENTS: 'edit_clients',
  DELETE_CLIENTS: 'delete_clients',
  
  // Jobs
  VIEW_JOBS: 'view_jobs',
  CREATE_JOBS: 'create_jobs',
  EDIT_JOBS: 'edit_jobs',
  DELETE_JOBS: 'delete_jobs',
  ASSIGN_JOBS: 'assign_jobs',
  
  // Quotes
  VIEW_QUOTES: 'view_quotes',
  CREATE_QUOTES: 'create_quotes',
  EDIT_QUOTES: 'edit_quotes',
  DELETE_QUOTES: 'delete_quotes',
  APPROVE_QUOTES: 'approve_quotes',
  
  // Stock & Tools
  VIEW_STOCK: 'view_stock',
  MANAGE_STOCK: 'manage_stock',
  VIEW_TOOLS: 'view_tools',
  MANAGE_TOOLS: 'manage_tools',
  CHECKOUT_TOOLS: 'checkout_tools',
  
  // Financial
  VIEW_FINANCIALS: 'view_financials',
  MANAGE_INVOICES: 'manage_invoices',
  VIEW_PAYROLL: 'view_payroll',
  MANAGE_PAYROLL: 'manage_payroll',
  VIEW_RECONCILIATION: 'view_reconciliation',
  
  // Reports
  VIEW_REPORTS: 'view_reports',
  EXPORT_REPORTS: 'export_reports',
  
  // Schedule
  VIEW_SCHEDULE: 'view_schedule',
  MANAGE_SCHEDULE: 'manage_schedule',
  
  // Settings
  VIEW_SETTINGS: 'view_settings',
  EDIT_SETTINGS: 'edit_settings'
};

export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: Object.values(PERMISSIONS),
  
  [ROLES.MANAGER]: [
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_CLIENTS,
    PERMISSIONS.CREATE_CLIENTS,
    PERMISSIONS.EDIT_CLIENTS,
    PERMISSIONS.VIEW_JOBS,
    PERMISSIONS.CREATE_JOBS,
    PERMISSIONS.EDIT_JOBS,
    PERMISSIONS.ASSIGN_JOBS,
    PERMISSIONS.VIEW_QUOTES,
    PERMISSIONS.CREATE_QUOTES,
    PERMISSIONS.EDIT_QUOTES,
    PERMISSIONS.APPROVE_QUOTES,
    PERMISSIONS.VIEW_STOCK,
    PERMISSIONS.VIEW_TOOLS,
    PERMISSIONS.VIEW_FINANCIALS,
    PERMISSIONS.VIEW_PAYROLL,
    PERMISSIONS.VIEW_RECONCILIATION,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_REPORTS,
    PERMISSIONS.VIEW_SCHEDULE,
    PERMISSIONS.MANAGE_SCHEDULE
  ],
  
  [ROLES.SUPERVISOR]: [
    PERMISSIONS.VIEW_CLIENTS,
    PERMISSIONS.VIEW_JOBS,
    PERMISSIONS.EDIT_JOBS,
    PERMISSIONS.ASSIGN_JOBS,
    PERMISSIONS.VIEW_QUOTES,
    PERMISSIONS.VIEW_STOCK,
    PERMISSIONS.VIEW_TOOLS,
    PERMISSIONS.CHECKOUT_TOOLS,
    PERMISSIONS.VIEW_SCHEDULE,
    PERMISSIONS.VIEW_REPORTS
  ],
  
  [ROLES.EMPLOYEE]: [
    PERMISSIONS.VIEW_JOBS,
    PERMISSIONS.VIEW_SCHEDULE,
    PERMISSIONS.VIEW_TOOLS
  ],
  
  [ROLES.ACCOUNTANT]: [
    PERMISSIONS.VIEW_CLIENTS,
    PERMISSIONS.VIEW_JOBS,
    PERMISSIONS.VIEW_FINANCIALS,
    PERMISSIONS.MANAGE_INVOICES,
    PERMISSIONS.VIEW_PAYROLL,
    PERMISSIONS.MANAGE_PAYROLL,
    PERMISSIONS.VIEW_RECONCILIATION,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_REPORTS
  ]
};

export function hasPermission(userRole, requiredPermission) {
  const userPermissions = ROLE_PERMISSIONS[userRole] || [];
  return userPermissions.includes(requiredPermission);
}

export function hasAnyPermission(userRole, permissions) {
  const userPermissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.some(permission => userPermissions.includes(permission));
}

export function hasAllPermissions(userRole, permissions) {
  const userPermissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.every(permission => userPermissions.includes(permission));
}