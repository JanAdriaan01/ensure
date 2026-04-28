// hooks/usePermissions.js
'use client';

import { useState, useEffect } from 'react';

export default function usePermissions(initialPermissions = []) {
  const [permissions, setPermissions] = useState(initialPermissions);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const hasPermission = (permission) => {
    return permissions.includes(permission);
  };
  
  const hasAnyPermission = (permissionList) => {
    return permissionList.some(p => permissions.includes(p));
  };
  
  const hasAllPermissions = (permissionList) => {
    return permissionList.every(p => permissions.includes(p));
  };
  
  const hasRole = (role) => {
    return roles.includes(role);
  };
  
  const hasAnyRole = (roleList) => {
    return roleList.some(r => roles.includes(r));
  };
  
  const hasAllRoles = (roleList) => {
    return roleList.every(r => roles.includes(r));
  };
  
  const canAccess = (resource, action) => {
    const permission = `${resource}.${action}`;
    return hasPermission(permission) || hasPermission(`${resource}.*`) || hasPermission('*.*');
  };
  
  const canView = (resource) => canAccess(resource, 'view');
  const canCreate = (resource) => canAccess(resource, 'create');
  const canEdit = (resource) => canAccess(resource, 'edit');
  const canDelete = (resource) => canAccess(resource, 'delete');
  const canExport = (resource) => canAccess(resource, 'export');
  const canImport = (resource) => canAccess(resource, 'import');
  
  const fetchPermissions = async (userId) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/users/${userId}/permissions`);
      const data = await response.json();
      setPermissions(data.permissions);
      setRoles(data.roles);
      return data;
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  const updatePermissions = async (userId, newPermissions) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/users/${userId}/permissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: newPermissions })
      });
      
      if (response.ok) {
        setPermissions(newPermissions);
        return { success: true };
      }
      return { success: false, error: 'Failed to update permissions' };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };
  
  return {
    permissions,
    roles,
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    canAccess,
    canView,
    canCreate,
    canEdit,
    canDelete,
    canExport,
    canImport,
    fetchPermissions,
    updatePermissions
  };
}