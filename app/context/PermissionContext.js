'use client';

import { createContext, useContext, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { hasPermission, hasAnyPermission, hasAllPermissions, getRolePermissions } from '@/app/lib/permissions';

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
      return user.role === role || user.role === 'admin';
    },
    
    // Check if admin
    isAdmin: user?.role === 'admin',
    
    // Check if manager or above
    isManagerOrAbove: ['admin', 'manager'].includes(user?.role),
    
    // Check if supervisor or above
    isSupervisorOrAbove: ['admin', 'manager', 'supervisor'].includes(user?.role),
    
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