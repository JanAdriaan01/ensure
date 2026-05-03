'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

export function useNotifications() {
  const { token, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    // If not authenticated, just set empty
    if (!isAuthenticated || !token) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/notifications?limit=10', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // If response is not ok, just return empty
      if (!response.ok) {
        setNotifications([]);
        setUnreadCount(0);
        setLoading(false);
        return;
      }

      const data = await response.json();
      
      // SAFE extraction - always ensure we have arrays
      let notificationsArray = [];
      let unread = 0;
      
      // Case 1: data is an array directly
      if (Array.isArray(data)) {
        notificationsArray = data;
        unread = data.filter(n => n && n.read === false).length;
      }
      // Case 2: data has notifications property
      else if (data && typeof data === 'object') {
        if (Array.isArray(data.notifications)) {
          notificationsArray = data.notifications;
          unread = typeof data.unreadCount === 'number' ? data.unreadCount : 0;
        }
        // Case 3: data has data property
        else if (Array.isArray(data.data)) {
          notificationsArray = data.data;
          unread = data.data.filter(n => n && n.read === false).length;
        }
      }
      
      setNotifications(notificationsArray);
      setUnreadCount(unread);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  const markAsRead = useCallback(async (notificationId) => {
    if (!isAuthenticated || !token) return false;

    try {
      const response = await fetch(`/api/notifications?id=${notificationId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Update local state
        setNotifications(prev => {
          if (!Array.isArray(prev)) return [];
          return prev.map(n => n.id === notificationId ? { ...n, read: true } : n);
        });
        setUnreadCount(prev => Math.max(0, prev - 1));
        return true;
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
    return false;
  }, [isAuthenticated, token]);

  const markAllAsRead = useCallback(async () => {
    if (!isAuthenticated || !token) return false;

    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prev => {
          if (!Array.isArray(prev)) return [];
          return prev.map(n => ({ ...n, read: true }));
        });
        setUnreadCount(0);
        return true;
      }
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
    return false;
  }, [isAuthenticated, token]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications: Array.isArray(notifications) ? notifications : [],
    unreadCount: typeof unreadCount === 'number' ? unreadCount : 0,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    hasUnread: unreadCount > 0,
    isEmpty: notifications.length === 0
  };
}

export default useNotifications;