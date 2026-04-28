'use client';

import { useNotifications as useNotificationsContext } from '@/app/context/NotificationContext';

export function useNotifications() {
  return useNotificationsContext();
}

export default useNotifications;