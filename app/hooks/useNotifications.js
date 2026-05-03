'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

export function useNotifications() {
  const { token, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    setLoading(true);
    setError(null);

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
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err.message);
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
          prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        );
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
        setNotifications(prev =>
          prev.map(n => ({ ...n, read: true }))
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

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, token, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    hasUnread: unreadCount > 0,
    isEmpty: notifications.length === 0
  };
}

export default useNotifications;