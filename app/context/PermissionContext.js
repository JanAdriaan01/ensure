'use client';

import { createContext, useContext, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { 
  hasPermission, 
  hasAnyPermission, 
  hasAllPermissions, 
  getRolePermissions,
  hasRole,
  ModulePermissions,
  canAccessModule,
  batchCheckPermissions,
  getUserEffectivePermissions,
} from '@/app/lib/permissions';

const PermissionContext = createContext();

export function PermissionProvider({ children }) {
  const { user, permissions: userPermissions } = useAuth();
  
  // Single permission check
  const can = useCallback((permission) => {
    if (!user) return false;
    return hasPermission(user.role, permission, userPermissions);
  }, [user, userPermissions]);
  
  // Check any of multiple permissions
  const canAny = useCallback((permissions) => {
    if (!user) return false;
    return hasAnyPermission(user.role, permissions, userPermissions);
  }, [user, userPermissions]);
  
  // Check all permissions
  const canAll = useCallback((permissions) => {
    if (!user) return false;
    return hasAllPermissions(user.role, permissions, userPermissions);
  }, [user, userPermissions]);
  
  // Get all permissions for user's role
  const getPermissions = useCallback(() => {
    if (!user) return [];
    return getRolePermissions(user.role);
  }, [user]);
  
  // Get effective permissions (role + custom)
  const getEffectivePermissions = useCallback(() => {
    if (!user) return [];
    return getUserEffectivePermissions(user.role, userPermissions);
  }, [user, userPermissions]);
  
  // Check role
  const isRole = useCallback((role) => {
    if (!user) return false;
    return hasRole(user.role, role);
  }, [user]);
  
  // Check module access
  const canAccessModule = useCallback((module, action = 'view') => {
    if (!user) return false;
    return canAccessModule(user.role, module, action, userPermissions);
  }, [user, userPermissions]);
  
  // Batch check multiple permissions
  const batchCheck = useCallback((permissions) => {
    if (!user) return {};
    return batchCheckPermissions(user.role, permissions, userPermissions);
  }, [user, userPermissions]);
  
  const value = useMemo(() => ({
    // Core permission methods
    can,
    canAny,
    canAll,
    getPermissions,
    getEffectivePermissions,
    isRole,
    canAccessModule,
    batchCheck,
    
    // Role shortcuts
    isAdmin: user?.role === 'admin',
    isManager: user?.role === 'manager',
    isSupervisor: user?.role === 'supervisor',
    isUser: user?.role === 'user',
    isViewer: user?.role === 'viewer',
    
    // Hierarchy checks
    isManagerOrAbove: hasRole(user?.role, 'manager'),
    isSupervisorOrAbove: hasRole(user?.role, 'supervisor'),
    
    // Financial Module shortcuts
    canViewFinancial: () => canAccessModule('financial', 'view'),
    canCreateFinancial: () => canAccessModule('financial', 'create'),
    canEditFinancial: () => canAccessModule('financial', 'edit'),
    canDeleteFinancial: () => canAccessModule('financial', 'delete'),
    canFinalizeJob: () => hasPermission(user?.role, PERMISSIONS.JOB_FINALIZE, userPermissions),
    
    // HR Module shortcuts
    canViewHR: () => canAccessModule('hr', 'view'),
    canCreateHR: () => canAccessModule('hr', 'create'),
    canEditHR: () => canAccessModule('hr', 'edit'),
    canDeleteHR: () => canAccessModule('hr', 'delete'),
    canProcessPayroll: () => hasPermission(user?.role, PERMISSIONS.EMPLOYEE_PAYROLL, userPermissions),
    
    // Operations Module shortcuts
    canViewOperations: () => canAccessModule('operations', 'view'),
    
    // Stock shortcuts
    canViewStock: () => canAccessModule('operations', 'stock', 'view'),
    canCreateStock: () => canAccessModule('operations', 'stock', 'create'),
    canEditStock: () => canAccessModule('operations', 'stock', 'edit'),
    canDeleteStock: () => canAccessModule('operations', 'stock', 'delete'),
    canAdjustStock: () => hasPermission(user?.role, PERMISSIONS.STOCK_ADJUST, userPermissions),
    
    // Tools shortcuts
    canViewTools: () => canAccessModule('operations', 'tools', 'view'),
    canCreateTools: () => canAccessModule('operations', 'tools', 'create'),
    canEditTools: () => canAccessModule('operations', 'tools', 'edit'),
    canDeleteTools: () => canAccessModule('operations', 'tools', 'delete'),
    canCheckoutTools: () => hasPermission(user?.role, PERMISSIONS.TOOL_CHECKOUT, userPermissions),
    
    // Schedule shortcuts
    canViewSchedule: () => canAccessModule('operations', 'schedule', 'view'),
    canCreateSchedule: () => canAccessModule('operations', 'schedule', 'create'),
    canEditSchedule: () => canAccessModule('operations', 'schedule', 'edit'),
    canDeleteSchedule: () => canAccessModule('operations', 'schedule', 'delete'),
    
    // OHS shortcuts
    canViewOHS: () => canAccessModule('operations', 'ohs', 'view'),
    canCreateOHS: () => canAccessModule('operations', 'ohs', 'create'),
    canEditOHS: () => canAccessModule('operations', 'ohs', 'edit'),
    canDeleteOHS: () => canAccessModule('operations', 'ohs', 'delete'),
    
    // Report shortcuts
    canViewReports: () => hasPermission(user?.role, PERMISSIONS.REPORT_VIEW, userPermissions),
    canExportReports: () => hasPermission(user?.role, PERMISSIONS.REPORT_EXPORT, userPermissions),
    
    // Admin shortcuts
    canAccessAdmin: () => hasPermission(user?.role, PERMISSIONS.ADMIN_ACCESS, userPermissions),
    canManageUsers: () => hasPermission(user?.role, PERMISSIONS.USER_MANAGE, userPermissions),
    canEditSettings: () => hasPermission(user?.role, PERMISSIONS.SETTINGS_EDIT, userPermissions),
    
    // ModulePermissions object for direct access
    ModulePermissions,
    PERMISSIONS,
    
  }), [user, userPermissions, can, canAny, canAll, getPermissions, getEffectivePermissions, isRole, canAccessModule, batchCheck]);
  
  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}

// Hook to use permissions
export function usePermissions() {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
}

// Higher-order component to protect components with permission
export function withPermission(WrappedComponent, requiredPermission, fallback = null) {
  return function PermissionWrapper(props) {
    const { can } = usePermissions();
    
    if (!can(requiredPermission)) {
      return fallback || <div className="unauthorized">You don't have permission to view this content.</div>;
    }
    
    return <WrappedComponent {...props} />;
  };
}

// Higher-order component to protect components with role
export function withRole(WrappedComponent, requiredRole, fallback = null) {
  return function RoleWrapper(props) {
    const { isRole } = usePermissions();
    
    if (!isRole(requiredRole)) {
      return fallback || <div className="unauthorized">You need {requiredRole} role to view this content.</div>;
    }
    
    return <WrappedComponent {...props} />;
  };
}

// Hook for conditional rendering based on permission
export function usePermissionGate(permission) {
  const { can } = usePermissions();
  return {
    hasPermission: can(permission),
    renderIf: (children, fallback = null) => can(permission) ? children : fallback,
  };
}

// Hook for conditional rendering based on role
export function useRoleGate(role) {
  const { isRole } = usePermissions();
  return {
    hasRole: isRole(role),
    renderIf: (children, fallback = null) => isRole(role) ? children : fallback,
  };
}