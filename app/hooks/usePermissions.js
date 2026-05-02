'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './useAuth';

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
  
  // OHS permissions
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

// Role definitions
export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  SUPERVISOR: 'supervisor',
  USER: 'user',
  VIEWER: 'viewer',
};

// Role level hierarchy
const ROLE_LEVELS = {
  [ROLES.VIEWER]: 1,
  [ROLES.USER]: 2,
  [ROLES.SUPERVISOR]: 3,
  [ROLES.MANAGER]: 4,
  [ROLES.ADMIN]: 5,
};

// Role to permissions mapping
const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: Object.values(PERMISSIONS),
  [ROLES.MANAGER]: [
    PERMISSIONS.JOB_VIEW, PERMISSIONS.JOB_CREATE, PERMISSIONS.JOB_EDIT, PERMISSIONS.JOB_FINALIZE,
    PERMISSIONS.QUOTE_VIEW, PERMISSIONS.QUOTE_CREATE, PERMISSIONS.QUOTE_EDIT, PERMISSIONS.QUOTE_APPROVE,
    PERMISSIONS.EMPLOYEE_VIEW, PERMISSIONS.EMPLOYEE_CREATE, PERMISSIONS.EMPLOYEE_EDIT,
    PERMISSIONS.CLIENT_VIEW, PERMISSIONS.CLIENT_CREATE, PERMISSIONS.CLIENT_EDIT,
    PERMISSIONS.INVOICE_VIEW, PERMISSIONS.INVOICE_CREATE, PERMISSIONS.INVOICE_EDIT, PERMISSIONS.INVOICE_PAY,
    PERMISSIONS.STOCK_VIEW, PERMISSIONS.STOCK_CREATE, PERMISSIONS.STOCK_ADJUST,
    PERMISSIONS.TOOL_VIEW, PERMISSIONS.TOOL_CHECKOUT,
    PERMISSIONS.SCHEDULE_VIEW, PERMISSIONS.SCHEDULE_CREATE,
    PERMISSIONS.OHS_VIEW, PERMISSIONS.OHS_CREATE,
    PERMISSIONS.REPORT_VIEW, PERMISSIONS.REPORT_EXPORT,
    PERMISSIONS.PAYROLL_VIEW, PERMISSIONS.PAYROLL_PROCESS,
    PERMISSIONS.RECONCILIATION_VIEW, PERMISSIONS.RECONCILIATION_MATCH,
    PERMISSIONS.SETTINGS_EDIT,
  ],
  [ROLES.SUPERVISOR]: [
    PERMISSIONS.JOB_VIEW, PERMISSIONS.JOB_CREATE, PERMISSIONS.JOB_EDIT,
    PERMISSIONS.QUOTE_VIEW,
    PERMISSIONS.EMPLOYEE_VIEW,
    PERMISSIONS.CLIENT_VIEW,
    PERMISSIONS.INVOICE_VIEW,
    PERMISSIONS.STOCK_VIEW,
    PERMISSIONS.TOOL_VIEW, PERMISSIONS.TOOL_CHECKOUT,
    PERMISSIONS.SCHEDULE_VIEW, PERMISSIONS.SCHEDULE_CREATE,
    PERMISSIONS.OHS_VIEW, PERMISSIONS.OHS_CREATE,
    PERMISSIONS.REPORT_VIEW,
    PERMISSIONS.PAYROLL_VIEW,
  ],
  [ROLES.USER]: [
    PERMISSIONS.JOB_VIEW,
    PERMISSIONS.QUOTE_VIEW,
    PERMISSIONS.EMPLOYEE_VIEW,
    PERMISSIONS.CLIENT_VIEW,
    PERMISSIONS.INVOICE_VIEW,
    PERMISSIONS.STOCK_VIEW,
    PERMISSIONS.TOOL_VIEW,
    PERMISSIONS.SCHEDULE_VIEW,
    PERMISSIONS.OHS_VIEW,
  ],
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

export function usePermissions() {
  const { user, permissions: userPermissions = [], isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if user has a specific permission
  const hasPermission = useCallback((permission) => {
    if (!isAuthenticated || !user) return false;
    if (user.role === ROLES.ADMIN) return true;
    if (userPermissions.includes(permission)) return true;
    return ROLE_PERMISSIONS[user.role]?.includes(permission) || false;
  }, [user, userPermissions, isAuthenticated]);

  // Check if user has any of the listed permissions
  const hasAnyPermission = useCallback((permissions) => {
    if (!isAuthenticated || !user) return false;
    if (user.role === ROLES.ADMIN) return true;
    return permissions.some(p => hasPermission(p));
  }, [user, isAuthenticated, hasPermission]);

  // Check if user has all listed permissions
  const hasAllPermissions = useCallback((permissions) => {
    if (!isAuthenticated || !user) return false;
    if (user.role === ROLES.ADMIN) return true;
    return permissions.every(p => hasPermission(p));
  }, [user, isAuthenticated, hasPermission]);

  // Check if user has a specific role
  const hasRole = useCallback((role) => {
    if (!isAuthenticated || !user) return false;
    if (user.role === ROLES.ADMIN) return true;
    return user.role === role;
  }, [user, isAuthenticated]);

  // Check if user role meets minimum level
  const hasRoleMinimum = useCallback((minRole) => {
    if (!isAuthenticated || !user) return false;
    const userLevel = ROLE_LEVELS[user.role] || 0;
    const requiredLevel = ROLE_LEVELS[minRole] || 0;
    return userLevel >= requiredLevel;
  }, [user, isAuthenticated]);

  // Get all permissions for current user
  const getAllPermissions = useCallback(() => {
    if (!isAuthenticated || !user) return [];
    if (user.role === ROLES.ADMIN) return Object.values(PERMISSIONS);
    return [...new Set([...ROLE_PERMISSIONS[user.role] || [], ...userPermissions])];
  }, [user, userPermissions, isAuthenticated]);

  // Check if user can access a specific module
  const canAccessModule = useCallback((module, action = 'view') => {
    const permissionMap = {
      financial: {
        view: PERMISSIONS.JOB_VIEW,
        create: PERMISSIONS.JOB_CREATE,
        edit: PERMISSIONS.JOB_EDIT,
        delete: PERMISSIONS.JOB_DELETE,
        finalize: PERMISSIONS.JOB_FINALIZE,
      },
      hr: {
        view: PERMISSIONS.EMPLOYEE_VIEW,
        create: PERMISSIONS.EMPLOYEE_CREATE,
        edit: PERMISSIONS.EMPLOYEE_EDIT,
        delete: PERMISSIONS.EMPLOYEE_DELETE,
        payroll: PERMISSIONS.EMPLOYEE_PAYROLL,
      },
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
      reports: {
        view: PERMISSIONS.REPORT_VIEW,
        export: PERMISSIONS.REPORT_EXPORT,
      },
      payroll: {
        view: PERMISSIONS.PAYROLL_VIEW,
        process: PERMISSIONS.PAYROLL_PROCESS,
        edit: PERMISSIONS.PAYROLL_EDIT,
      },
    };
    
    const moduleConfig = permissionMap[module];
    if (!moduleConfig) return false;
    const permission = moduleConfig[action];
    if (!permission) return false;
    return hasPermission(permission);
  }, [hasPermission]);

  // Get permission label for display
  const getPermissionLabel = useCallback((permission) => {
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
  }, []);

  // Get role label
  const getRoleLabel = useCallback((role) => {
    const labels = {
      [ROLES.ADMIN]: 'Administrator',
      [ROLES.MANAGER]: 'Manager',
      [ROLES.SUPERVISOR]: 'Supervisor',
      [ROLES.USER]: 'User',
      [ROLES.VIEWER]: 'Viewer',
    };
    return labels[role] || role;
  }, []);

  // Role level
  const getRoleLevel = useCallback((role) => {
    return ROLE_LEVELS[role] || 0;
  }, []);

  return {
    // State
    isAuthenticated,
    userRole: user?.role,
    userPermissions,
    
    // Permission checks
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasRoleMinimum,
    getAllPermissions,
    canAccessModule,
    
    // Helpers
    getPermissionLabel,
    getRoleLabel,
    getRoleLevel,
    
    // Constants
    PERMISSIONS,
    ROLES,
    
    // Convenience
    isAdmin: user?.role === ROLES.ADMIN,
    isManager: user?.role === ROLES.MANAGER,
    isSupervisor: user?.role === ROLES.SUPERVISOR,
    isUser: user?.role === ROLES.USER,
    isViewer: user?.role === ROLES.VIEWER,
  };
}

export default usePermissions;