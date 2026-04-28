// hooks/useNotifications.js
'use client';

import { useState, useEffect, useCallback } from 'react';

export default function useNotifications(options = {}) {
  const {
    autoConnect = true,
    pollingInterval = 30000,
    onNotification = null
  } = options;
  
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  
  let ws = null;
  let pollInterval = null;
  
  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    if (!notification.read) {
      setUnreadCount(prev => prev + 1);
    }
    if (onNotification) onNotification(notification);
    
    // Show browser notification if supported
    if (notification.showBrowser && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: notification.icon
      });
    }
  };
  
  const markAsRead = async (notificationId) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, { method: 'POST' });
      setNotifications(prev => prev.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };
  
  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications/read-all', { method: 'POST' });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };
  
  const deleteNotification = async (notificationId) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, { method: 'DELETE' });
      const deleted = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      if (deleted && !deleted.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };
  
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/notifications');
      const data = await response.json();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const connectWebSocket = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws = new WebSocket(`${protocol}//${window.location.host}/ws/notifications`);
    
    ws.onopen = () => {
      setWsConnected(true);
    };
    
    ws.onmessage = (event) => {
      const notification = JSON.parse(event.data);
      addNotification(notification);
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setWsConnected(false);
    };
    
    ws.onclose = () => {
      setWsConnected(false);
      // Attempt to reconnect after 5 seconds
      setTimeout(connectWebSocket, 5000);
    };
  };
  
  const startPolling = () => {
    pollInterval = setInterval(fetchNotifications, pollingInterval);
  };
  
  const stopPolling = () => {
    if (pollInterval) clearInterval(pollInterval);
  };
  
  const disconnect = () => {
    if (ws) ws.close();
    stopPolling();
  };
  
  const requestBrowserPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  };
  
  useEffect(() => {
    if (autoConnect) {
      fetchNotifications();
      startPolling();
      
      // Try to connect WebSocket
      if (window.WebSocket) {
        connectWebSocket();
      }
    }
    
    return () => {
      disconnect();
    };
  }, [autoConnect]);
  
  return {
    notifications,
    unreadCount,
    loading,
    error,
    wsConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchNotifications,
    requestBrowserPermission,
    addNotification
  };
}