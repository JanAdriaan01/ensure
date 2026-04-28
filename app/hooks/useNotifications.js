'use client';

// Re-export from the actual NotificationContext
import { useNotifications as useNotificationsContext } from '@/app/context/NotificationContext';

export function useNotifications() {
  return useNotificationsContext();
}

export default useNotifications;