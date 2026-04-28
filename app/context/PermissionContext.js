'use client';

import { createContext, useContext, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { 
  hasPermission, 
  hasAnyPermission, 
  hasAllPermissions, 
  getRolePermissions,
  hasRole,
  ModulePermissions 
} from '@/app/lib/permissions';

const PermissionContext = createContext();

export function PermissionProvider({ children }) {
  const { user, permissions: userPermissions } = useAuth();
  
  const value = useMemo(() => ({
    // Check single permission
    can: (permission) => {
      if (!user) return false;
      return hasPermission(user.role, permission, userPermissions);
    },
    
    // Check any of multiple permissions
    canAny: (permissions) => {
      if (!user) return false;
      return hasAnyPermission(user.role, permissions, userPermissions);
    },
    
    // Check all permissions
    canAll: (permissions) => {
      if (!user) return false;
      return hasAllPermissions(user.role, permissions, userPermissions);
    },
    
    // Get all permissions for role
    getPermissions: () => {
      if (!user) return [];
      return getRolePermissions(user.role);
    },
    
    // Check role
    isRole: (role) => {
      if (!user) return false;
      return hasRole(user.role, role);
    },
    
    // Check if admin
    isAdmin: user?.role === 'admin',
    
    // Check if manager or above
    isManagerOrAbove: hasRole(user?.role, 'manager'),
    
    // Check if supervisor or above
    isSupervisorOrAbove: hasRole(user?.role, 'supervisor'),
    
    // Module-specific permission helpers
    canViewFinancial: () => hasPermission(user?.role, ModulePermissions.financial.view, userPermissions),
    canCreateFinancial: () => hasPermission(user?.role, ModulePermissions.financial.create, userPermissions),
    canEditFinancial: () => hasPermission(user?.role, ModulePermissions.financial.edit, userPermissions),
    
    canViewHR: () => hasPermission(user?.role, ModulePermissions.hr.view, userPermissions),
    canCreateHR: () => hasPermission(user?.role, ModulePermissions.hr.create, userPermissions),
    canEditHR: () => hasPermission(user?.role, ModulePermissions.hr.edit, userPermissions),
    canProcessPayroll: () => hasPermission(user?.role, ModulePermissions.hr.payroll, userPermissions),
    
    canViewStock: () => hasPermission(user?.role, ModulePermissions.operations.stock.view, userPermissions),
    canCreateStock: () => hasPermission(user?.role, ModulePermissions.operations.stock.create, userPermissions),
    canAdjustStock: () => hasPermission(user?.role, ModulePermissions.operations.stock.adjust, userPermissions),
    
    canViewTools: () => hasPermission(user?.role, ModulePermissions.operations.tools.view, userPermissions),
    canCreateTools: () => hasPermission(user?.role, ModulePermissions.operations.tools.create, userPermissions),
    canCheckoutTools: () => hasPermission(user?.role, ModulePermissions.operations.tools.checkout, userPermissions),
    
    canViewSchedule: () => hasPermission(user?.role, ModulePermissions.operations.schedule.view, userPermissions),
    canCreateSchedule: () => hasPermission(user?.role, ModulePermissions.operations.schedule.create, userPermissions),
    canEditSchedule: () => hasPermission(user?.role, ModulePermissions.operations.schedule.edit, userPermissions),
    
    canViewOHS: () => hasPermission(user?.role, ModulePermissions.operations.ohs.view, userPermissions),
    canCreateOHS: () => hasPermission(user?.role, ModulePermissions.operations.ohs.create, userPermissions),
    canEditOHS: () => hasPermission(user?.role, ModulePermissions.operations.ohs.edit, userPermissions),
    
    // ModulePermissions object for direct access
    ModulePermissions,
    
  }), [user, userPermissions]);
  
  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
}