'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useWebSocket } from './WebSocketContext';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const { socket, isConnected } = useWebSocket();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [desktopEnabled, setDesktopEnabled] = useState(true);

  // Fetch notifications on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated]);

  // WebSocket real-time notifications
  useEffect(() => {
    if (socket && isConnected) {
      socket.on('notification', (data) => {
        addNotification(data, true);
      });
      
      socket.on('job_update', (data) => {
        addNotification({
          title: `Job Update: ${data.job_number}`,
          message: data.message,
          type: 'job',
          link: `/jobs/${data.job_id}`,
        }, true);
      });
      
      socket.on('quote_update', (data) => {
        addNotification({
          title: `Quote Update: ${data.quote_number}`,
          message: data.message,
          type: 'quote',
          link: `/quotes/${data.quote_id}`,
        }, true);
      });
      
      socket.on('tool_overdue', (data) => {
        addNotification({
          title: 'Tool Overdue',
          message: `${data.tool_name} is overdue for return`,
          type: 'warning',
          link: `/tools/${data.tool_id}`,
        }, true);
      });
    }
    
    return () => {
      if (socket) {
        socket.off('notification');
        socket.off('job_update');
        socket.off('quote_update');
        socket.off('tool_overdue');
      }
    };
  }, [socket, isConnected]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const addNotification = async (notification, fromSocket = false) => {
    const newNotification = {
      id: Date.now(),
      ...notification,
      read: false,
      created_at: new Date().toISOString(),
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    // Play sound if enabled
    if (soundEnabled && !fromSocket) {
      playNotificationSound();
    }
    
    // Show desktop notification if enabled
    if (desktopEnabled && Notification.permission === 'granted') {
      showDesktopNotification(notification.title, notification.message);
    }
    
    // Save to server
    if (!fromSocket) {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notification),
      });
    }
  };

  const markAsRead = async (notificationId) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
    
    await fetch(`/api/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  };

  const markAllAsRead = async () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
    setUnreadCount(0);
    
    await fetch('/api/notifications/read-all', {
      method: 'PUT',
    });
  };

  const deleteNotification = async (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    if (notifications.find(n => n.id === notificationId)?.read === false) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    
    await fetch(`/api/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  };

  const clearAll = async () => {
    setNotifications([]);
    setUnreadCount(0);
    
    await fetch('/api/notifications/clear-all', {
      method: 'DELETE',
    });
  };

  const playNotificationSound = () => {
    const audio = new Audio('/sounds/notification.mp3');
    audio.play().catch(e => console.log('Audio play failed:', e));
  };

  const showDesktopNotification = (title, body) => {
    if (Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/logo.png' });
    }
  };

  const requestDesktopPermission = async () => {
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      setDesktopEnabled(permission === 'granted');
    }
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    soundEnabled,
    desktopEnabled,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    setSoundEnabled,
    setDesktopEnabled,
    requestDesktopPermission,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}