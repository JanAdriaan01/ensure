'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';

const WebSocketContext = createContext({});

export function WebSocketProvider({ children }) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const { isAuthenticated, user } = useAuth();
  const { addNotification } = useNotifications();

  const connect = useCallback(() => {
    if (!isAuthenticated) return;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000';
    const socket = new WebSocket(`${wsUrl}/ws?userId=${user?.id}`);
    
    socket.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      socketRef.current = socket;
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastMessage(data);
        
        // Handle different message types
        switch (data.type) {
          case 'notification':
            addNotification(data.payload);
            break;
          case 'update':
            // Handle real-time updates for jobs, schedules, etc.
            window.dispatchEvent(new CustomEvent('websocket-update', { detail: data }));
            break;
          case 'presence':
            // Handle user presence updates
            console.log('User presence update:', data.payload);
            break;
          default:
            console.log('Unknown message type:', data);
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    socket.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      
      // Attempt to reconnect after 5 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 5000);
    };
  }, [isAuthenticated, user?.id, addNotification]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((message) => {
    if (socketRef.current && isConnected) {
      socketRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, [isConnected]);

  const subscribeToTopic = useCallback((topic) => {
    return sendMessage({ type: 'subscribe', topic });
  }, [sendMessage]);

  const unsubscribeFromTopic = useCallback((topic) => {
    return sendMessage({ type: 'unsubscribe', topic });
  }, [sendMessage]);

  useEffect(() => {
    if (isAuthenticated) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, connect, disconnect]);

  const value = {
    isConnected,
    lastMessage,
    sendMessage,
    subscribeToTopic,
    unsubscribeFromTopic,
    disconnect,
    reconnect: connect
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider');
  }
  return context;
}

// Custom hook for subscribing to real-time updates
export function useRealtimeSubscription(topic, onMessage) {
  const { subscribeToTopic, unsubscribeFromTopic, lastMessage } = useWebSocket();

  useEffect(() => {
    if (topic) {
      subscribeToTopic(topic);
      return () => {
        unsubscribeFromTopic(topic);
      };
    }
  }, [topic, subscribeToTopic, unsubscribeFromTopic]);

  useEffect(() => {
    if (lastMessage && lastMessage.topic === topic && onMessage) {
      onMessage(lastMessage.payload);
    }
  }, [lastMessage, topic, onMessage]);
}