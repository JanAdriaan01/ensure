'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';

const WebSocketContext = createContext(null);

export function WebSocketProvider({ children }) {
  const { token, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const [isClient, setIsClient] = useState(false);

  // Track when we're on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  const connectSSE = useCallback(() => {
    if (!isClient || !isAuthenticated || !token) return;
    if (eventSourceRef.current) return;

    try {
      const eventSource = new EventSource(`/api/events?token=${token}`);
      
      eventSource.addEventListener('connected', () => {
        setIsConnected(true);
      });

      eventSource.addEventListener('notification', (event) => {
        try {
          const data = JSON.parse(event.data);
          setMessages(prev => [...prev.slice(-99), data]);
        } catch (error) {
          console.error('SSE message error:', error);
        }
      });

      eventSource.onerror = () => {
        setIsConnected(false);
        
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          eventSourceRef.current = null;
        }
        
        reconnectTimeoutRef.current = setTimeout(() => {
          connectSSE();
        }, 5000);
      };

      eventSourceRef.current = eventSource;
    } catch (error) {
      console.error('SSE connection error:', error);
    }
  }, [isClient, isAuthenticated, token]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsConnected(false);
  }, []);

  useEffect(() => {
    if (isClient && isAuthenticated && token) {
      connectSSE();
    }
    return () => {
      disconnect();
    };
  }, [isClient, isAuthenticated, token, connectSSE, disconnect]);

  const sendMessage = useCallback(async (message) => {
    if (!isClient) return;
    try {
      await fetch('/api/ws', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(message),
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }, [token, isClient]);

  const value = {
    isConnected,
    messages,
    sendMessage,
    reconnect: connectSSE,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  // Return safe default values instead of throwing error
  if (!context) {
    return {
      isConnected: false,
      messages: [],
      sendMessage: () => {},
      reconnect: () => {},
    };
  }
  return context;
}