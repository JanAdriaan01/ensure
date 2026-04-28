// hooks/useWebSocket.js
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export default function useWebSocket(options = {}) {
  const {
    url = null,
    autoConnect = true,
    reconnectOnClose = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
    onMessage = null,
    onOpen = null,
    onClose = null,
    onError = null
  } = options;
  
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [error, setError] = useState(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  
  const connect = useCallback(() => {
    if (!url) {
      setError(new Error('WebSocket URL is required'));
      return;
    }
    
    try {
      const ws = new WebSocket(url);
      
      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
        setReconnectAttempts(0);
        if (onOpen) onOpen();
      };
      
      ws.onmessage = (event) => {
        let data;
        try {
          data = JSON.parse(event.data);
        } catch {
          data = event.data;
        }
        setLastMessage(data);
        if (onMessage) onMessage(data);
      };
      
      ws.onerror = (event) => {
        setError(event);
        if (onError) onError(event);
      };
      
      ws.onclose = () => {
        setIsConnected(false);
        if (onClose) onClose();
        
        if (reconnectOnClose && reconnectAttempts < maxReconnectAttempts) {
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connect();
          }, reconnectInterval);
        }
      };
      
      wsRef.current = ws;
    } catch (err) {
      setError(err);
      if (onError) onError(err);
    }
  }, [url, reconnectOnClose, reconnectInterval, maxReconnectAttempts, reconnectAttempts, onOpen, onMessage, onClose, onError]);
  
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close();
    }
    
    wsRef.current = null;
    setIsConnected(false);
  }, []);
  
  const sendMessage = useCallback((data) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const message = typeof data === 'string' ? data : JSON.stringify(data);
      wsRef.current.send(message);
      return true;
    }
    return false;
  }, []);
  
  const sendJson = useCallback((data) => {
    return sendMessage(JSON.stringify(data));
  }, [sendMessage]);
  
  const subscribe = useCallback((channel, callback) => {
    const handler = (data) => {
      if (data.channel === channel) {
        callback(data.payload);
      }
    };
    
    const originalOnMessage = onMessage;
    // This is a simplified subscription mechanism
    // For production, you'd want a proper pub/sub system
    
    return () => {
      // Unsubscribe logic
    };
  }, [onMessage]);
  
  useEffect(() => {
    if (autoConnect) {
      connect();
    }
    
    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);
  
  return {
    isConnected,
    lastMessage,
    error,
    reconnectAttempts,
    connect,
    disconnect,
    sendMessage,
    sendJson,
    subscribe
  };
}