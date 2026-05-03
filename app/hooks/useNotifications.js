'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

export function useNotifications() {
  const { token, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/notifications?limit=50', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      // Ensure we're working with arrays
      const notificationsData = Array.isArray(data) ? data : (data.notifications || []);
      const unread = Array.isArray(data) ? 0 : (data.unreadCount || 0);
      
      setNotifications(notificationsData);
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
        setNotifications(prev =>
          (prev || []).map(n => n.id === notificationId ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, (prev || 0) - 1));
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
        setNotifications(prev =>
          (prev || []).map(n => ({ ...n, read: true }))
        );
        setUnreadCount(0);
        return true;
      }
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
    return false;
  }, [isAuthenticated, token]);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchNotifications();
    }
  }, [isAuthenticated, token, fetchNotifications]);

  return {
    notifications: notifications || [],
    unreadCount: unreadCount || 0,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    hasUnread: (unreadCount || 0) > 0,
    isEmpty: (notifications || []).length === 0
  };
}

export default useNotifications;