'use client';

// Re-export from the actual PermissionContext
import { usePermissions as usePermissionsContext } from '@/app/context/PermissionContext';

export function usePermissions() {
  return usePermissionsContext();
}

export default usePermissions;