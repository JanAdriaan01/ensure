'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from '@/app/hooks/useToast';

const WebSocketContext = createContext({});

export function WebSocketProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);
  const maxReconnectAttempts = 10;
  const baseReconnectDelay = 1000;

  // Heartbeat to keep connection alive
  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }
    
    heartbeatIntervalRef.current = setInterval(() => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
      }
    }, 30000); // Send ping every 30 seconds
  }, []);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    if (!isAuthenticated || !user?.id) {
      console.log('WebSocket: Not authenticated, skipping connection');
      return;
    }

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      console.log('WebSocket: Already connected');
      return;
    }

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = process.env.NEXT_PUBLIC_WS_URL || `${wsProtocol}//${window.location.host}`;
    const wsUrl = `${wsHost}/ws?userId=${user.id}&token=${localStorage.getItem('auth_token')}`;
    
    console.log(`WebSocket: Connecting to ${wsUrl}`);
    
    const socket = new WebSocket(wsUrl);
    
    socket.onopen = () => {
      console.log('WebSocket: Connected');
      setIsConnected(true);
      setIsReconnecting(false);
      setReconnectAttempts(0);
      socketRef.current = socket;
      startHeartbeat();
      
      // Send initial presence
      socket.send(JSON.stringify({
        type: 'presence',
        payload: { status: 'online', userId: user.id, name: user.name }
      }));
      
      // Subscribe to default topics
      socket.send(JSON.stringify({ type: 'subscribe', topics: ['jobs', 'quotes', 'notifications'] }));
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastMessage(data);
        
        // Handle different message types
        switch (data.type) {
          case 'pong':
            // Heartbeat response - ignore
            break;
            
          case 'notification':
            // Dispatch custom event for notification components
            window.dispatchEvent(new CustomEvent('websocket-notification', { detail: data.payload }));
            break;
            
          case 'job_update':
            // Dispatch job update event
            window.dispatchEvent(new CustomEvent('websocket-job-update', { detail: data.payload }));
            break;
            
          case 'quote_update':
            window.dispatchEvent(new CustomEvent('websocket-quote-update', { detail: data.payload }));
            break;
            
          case 'schedule_update':
            window.dispatchEvent(new CustomEvent('websocket-schedule-update', { detail: data.payload }));
            break;
            
          case 'presence':
            window.dispatchEvent(new CustomEvent('websocket-presence', { detail: data.payload }));
            break;
            
          case 'broadcast':
            // Handle system broadcasts
            if (data.payload.message) {
              showToast(data.payload.message, data.payload.type || 'info');
            }
            break;
            
          default:
            // Generic update event
            window.dispatchEvent(new CustomEvent('websocket-update', { detail: data }));
        }
      } catch (error) {
        console.error('WebSocket: Failed to parse message:', error);
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket: Error:', error);
      setIsConnected(false);
    };

    socket.onclose = (event) => {
      console.log(`WebSocket: Disconnected (code: ${event.code}, reason: ${event.reason})`);
      setIsConnected(false);
      stopHeartbeat();
      socketRef.current = null;
      
      // Attempt to reconnect if not a clean close
      if (event.code !== 1000 && isAuthenticated) {
        attemptReconnect();
      }
    };
  }, [isAuthenticated, user, startHeartbeat, stopHeartbeat, showToast]);

  const attemptReconnect = useCallback(() => {
    if (reconnectAttempts >= maxReconnectAttempts) {
      console.log(`WebSocket: Max reconnection attempts (${maxReconnectAttempts}) reached`);
      setIsReconnecting(false);
      showToast('Unable to connect to real-time updates. Please refresh the page.', 'warning');
      return;
    }
    
    const delay = Math.min(baseReconnectDelay * Math.pow(2, reconnectAttempts), 30000);
    console.log(`WebSocket: Reconnecting in ${delay}ms (attempt ${reconnectAttempts + 1}/${maxReconnectAttempts})`);
    
    setIsReconnecting(true);
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    reconnectTimeoutRef.current = setTimeout(() => {
      setReconnectAttempts(prev => prev + 1);
      connect();
    }, delay);
  }, [reconnectAttempts, connect, showToast]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    stopHeartbeat();
    
    if (socketRef.current) {
      // Send offline presence before closing
      if (socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({
          type: 'presence',
          payload: { status: 'offline', userId: user?.id }
        }));
        socketRef.current.close(1000, 'User logout');
      }
      socketRef.current = null;
    }
    
    setIsConnected(false);
    setIsReconnecting(false);
    setReconnectAttempts(0);
  }, [stopHeartbeat, user?.id]);

  const sendMessage = useCallback((type, payload) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type, payload, timestamp: Date.now() }));
      return true;
    }
    console.warn('WebSocket: Cannot send message - not connected');
    return false;
  }, []);

  const subscribeToTopic = useCallback((topic) => {
    return sendMessage('subscribe', { topic });
  }, [sendMessage]);

  const unsubscribeFromTopic = useCallback((topic) => {
    return sendMessage('unsubscribe', { topic });
  }, [sendMessage]);

  const joinRoom = useCallback((roomId, roomType) => {
    return sendMessage('join_room', { roomId, roomType });
  }, [sendMessage]);

  const leaveRoom = useCallback((roomId, roomType) => {
    return sendMessage('leave_room', { roomId, roomType });
  }, [sendMessage]);

  const updatePresence = useCallback((status, metadata = {}) => {
    return sendMessage('presence', { status, userId: user?.id, name: user?.name, ...metadata });
  }, [sendMessage, user]);

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
    // State
    isConnected,
    isReconnecting,
    reconnectAttempts,
    lastMessage,
    
    // Connection management
    connect,
    disconnect,
    
    // Messaging
    sendMessage,
    subscribeToTopic,
    unsubscribeFromTopic,
    joinRoom,
    leaveRoom,
    updatePresence,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

// Hook to use WebSocket context
export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider');
  }
  return context;
}

// Hook for subscribing to real-time updates on a specific topic
export function useRealtimeSubscription(topic, onMessage, dependencies = []) {
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
    if (lastMessage && lastMessage.topic === topic && lastMessage.payload && onMessage) {
      onMessage(lastMessage.payload);
    }
  }, [lastMessage, topic, onMessage, ...dependencies]);
}

// Hook for real-time job updates
export function useJobUpdates(jobId, onUpdate) {
  const topic = jobId ? `job:${jobId}` : null;
  useRealtimeSubscription(topic, onUpdate, [jobId]);
}

// Hook for real-time quote updates
export function useQuoteUpdates(quoteId, onUpdate) {
  const topic = quoteId ? `quote:${quoteId}` : null;
  useRealtimeSubscription(topic, onUpdate, [quoteId]);
}

// Hook for real-time schedule updates
export function useScheduleUpdates(onUpdate) {
  useRealtimeSubscription('schedule', onUpdate, []);
}

// Hook for real-time notification listening
export function useNotificationsWebSocket() {
  const { lastMessage } = useWebSocket();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (lastMessage && lastMessage.type === 'notification') {
      setNotifications(prev => [lastMessage.payload, ...prev]);
    }
  }, [lastMessage]);

  return { notifications, clearNotifications: () => setNotifications([]) };
}

// Hook for user presence tracking
export function usePresence(roomId) {
  const { joinRoom, leaveRoom, lastMessage } = useWebSocket();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (roomId) {
      joinRoom(roomId, 'presence');
      return () => {
        leaveRoom(roomId, 'presence');
      };
    }
  }, [roomId, joinRoom, leaveRoom]);

  useEffect(() => {
    if (lastMessage && lastMessage.type === 'presence' && lastMessage.roomId === roomId) {
      setUsers(lastMessage.payload.users || []);
    }
  }, [lastMessage, roomId]);

  return { users, onlineCount: users.filter(u => u.status === 'online').length };
}