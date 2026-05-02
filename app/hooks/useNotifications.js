'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useFetch, useMutation } from './useFetch';

export function useNotifications() {
  const { isAuthenticated, user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Fetch notifications
  const fetchNotifications = useCallback(async (options = {}) => {
    if (!mounted || !isAuthenticated) return;
    
    const { limit = 50, unreadOnly = false } = options;
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({ limit, unreadOnly });
      const response = await fetch(`/api/notifications?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch notifications');
      
      const data = await response.json();
      if (mounted) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Fetch notifications error:', err);
      if (mounted) setError(err.message);
    } finally {
      if (mounted) setLoading(false);
    }
  }, [isAuthenticated, mounted]);

  // Mark single notification as read
  const markAsRead = useCallback(async (notificationId) => {
    if (!mounted || !isAuthenticated) return false;
    
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to mark as read');
      
      if (mounted) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      return true;
    } catch (err) {
      console.error('Mark as read error:', err);
      return false;
    }
  }, [isAuthenticated, mounted]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!mounted || !isAuthenticated) return false;
    
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user?.id }),
      });
      
      if (!response.ok) throw new Error('Failed to mark all as read');
      
      if (mounted) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
      }
      return true;
    } catch (err) {
      console.error('Mark all as read error:', err);
      return false;
    }
  }, [isAuthenticated, user, mounted]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    if (!mounted || !isAuthenticated) return false;
    
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to delete notification');
      
      if (mounted) {
        const deleted = notifications.find(n => n.id === notificationId);
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        if (deleted && !deleted.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
      return true;
    } catch (err) {
      console.error('Delete notification error:', err);
      return false;
    }
  }, [isAuthenticated, notifications, mounted]);

  // Create notification (for admins/managers)
  const createNotification = useCallback(async (notificationData) => {
    if (!mounted || !isAuthenticated) return null;
    
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData),
      });
      
      if (!response.ok) throw new Error('Failed to create notification');
      
      const data = await response.json();
      return data.notification;
    } catch (err) {
      console.error('Create notification error:', err);
      return null;
    }
  }, [isAuthenticated, mounted]);

  // Send real-time notification via WebSocket
  const sendRealtimeNotification = useCallback((userId, notification) => {
    if (!mounted || !isAuthenticated) return;
    
    // This would integrate with your WebSocket provider
    if (typeof window !== 'undefined' && window.socket) {
      window.socket.emit('notification', { userId, ...notification });
    }
  }, [isAuthenticated, mounted]);

  // Get unread notifications count
  const getUnreadCount = useCallback(() => unreadCount, [unreadCount]);

  // Clear all notifications
  const clearAllNotifications = useCallback(async () => {
    if (!mounted || !isAuthenticated) return false;
    
    try {
      const response = await fetch('/api/notifications/clear-all', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ userId: user?.id }),
      });
      
      if (!response.ok) throw new Error('Failed to clear notifications');
      
      if (mounted) {
        setNotifications([]);
        setUnreadCount(0);
      }
      return true;
    } catch (err) {
      console.error('Clear notifications error:', err);
      return false;
    }
  }, [isAuthenticated, user, mounted]);

  // Auto-fetch on mount when authenticated
  useEffect(() => {
    if (isAuthenticated && mounted) {
      fetchNotifications();
    }
  }, [isAuthenticated, mounted, fetchNotifications]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!isAuthenticated || !mounted) return;
    
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated, mounted, fetchNotifications]);

  return {
    // State
    notifications,
    unreadCount,
    loading,
    error,
    
    // Actions
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    clearAllNotifications,
    sendRealtimeNotification,
    getUnreadCount,
    
    // Convenience
    hasUnread: unreadCount > 0,
    isEmpty: notifications.length === 0,
  };
}

// Helper hook for toast notifications (not to be confused with UI toast)
export function useToastNotifications() {
  const { createNotification } = useNotifications();
  
  const notifySuccess = useCallback((message, userId) => {
    return createNotification({
      userId,
      type: 'success',
      title: 'Success',
      message,
      icon: '✅',
    });
  }, [createNotification]);
  
  const notifyError = useCallback((message, userId) => {
    return createNotification({
      userId,
      type: 'error',
      title: 'Error',
      message,
      icon: '❌',
    });
  }, [createNotification]);
  
  const notifyInfo = useCallback((message, userId) => {
    return createNotification({
      userId,
      type: 'info',
      title: 'Information',
      message,
      icon: 'ℹ️',
    });
  }, [createNotification]);
  
  const notifyWarning = useCallback((message, userId) => {
    return createNotification({
      userId,
      type: 'warning',
      title: 'Warning',
      message,
      icon: '⚠️',
    });
  }, [createNotification]);
  
  return {
    notifySuccess,
    notifyError,
    notifyInfo,
    notifyWarning,
  };
}

export default useNotifications;