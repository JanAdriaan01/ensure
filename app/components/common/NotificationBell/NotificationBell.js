// components/common/NotificationBell/NotificationBell.js
'use client';

import { useState, useEffect, useRef } from 'react';

export default function NotificationBell({ 
  notifications = [],
  onMarkAsRead,
  onViewAll,
  onNotificationClick,
  autoRefresh = true,
  refreshInterval = 30000
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  
  useEffect(() => {
    const unread = notifications.filter(n => !n.read).length;
    setUnreadCount(unread);
  }, [notifications]);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const getNotificationIcon = (type) => {
    const icons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      alert: '🚨',
      reminder: '⏰',
      update: '🔄',
      mention: '💬'
    };
    return icons[type] || '📢';
  };
  
  const getTimeAgo = (date) => {
    const diff = Math.floor((new Date() - new Date(date)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };
  
  const handleNotificationRead = (notification) => {
    if (!notification.read && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
    setIsOpen(false);
  };
  
  const markAllAsRead = () => {
    notifications.filter(n => !n.read).forEach(n => {
      if (onMarkAsRead) onMarkAsRead(n.id);
    });
  };
  
  return (
    <div className="notification-bell" ref={dropdownRef}>
      <button 
        className={`bell-btn ${unreadCount > 0 ? 'has-unread' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        🔔
        {unreadCount > 0 && (
          <span className="unread-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>
      
      {isOpen && (
        <div className="dropdown">
          <div className="dropdown-header">
            <h4>Notifications</h4>
            {unreadCount > 0 && (
              <button className="mark-all-btn" onClick={markAllAsRead}>
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="notifications-list">
            {notifications.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">🔔</span>
                <p>No notifications</p>
              </div>
            ) : (
              notifications.slice(0, 10).map(notification => (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  onClick={() => handleNotificationRead(notification)}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-content">
                    <div className="notification-title">{notification.title}</div>
                    <div className="notification-message">{notification.message}</div>
                    <div className="notification-time">{getTimeAgo(notification.timestamp)}</div>
                  </div>
                  {!notification.read && <div className="unread-dot" />}
                </div>
              ))
            )}
          </div>
          
          {notifications.length > 10 && (
            <div className="dropdown-footer">
              <button className="view-all-btn" onClick={onViewAll}>
                View all notifications ({notifications.length})
              </button>
            </div>
          )}
        </div>
      )}
      
      <style jsx>{`
        .notification-bell {
          position: relative;
          display: inline-block;
        }
        
        .bell-btn {
          position: relative;
          background: none;
          border: none;
          font-size: 1.25rem;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 0.5rem;
          transition: background 0.2s;
        }
        
        .bell-btn:hover {
          background: #f3f4f6;
        }
        
        .bell-btn.has-unread {
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        
        .unread-badge {
          position: absolute;
          top: 0;
          right: 0;
          background: #ef4444;
          color: white;
          font-size: 0.7rem;
          font-weight: 600;
          padding: 0.125rem 0.375rem;
          border-radius: 9999px;
          min-width: 18px;
        }
        
        .dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 0.5rem;
          width: 380px;
          max-width: calc(100vw - 2rem);
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          z-index: 50;
          overflow: hidden;
        }
        
        .dropdown-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid #e5e7eb;
          background: #f9fafb;
        }
        
        .dropdown-header h4 {
          margin: 0;
          font-size: 0.875rem;
          font-weight: 600;
          color: #111827;
        }
        
        .mark-all-btn {
          background: none;
          border: none;
          font-size: 0.75rem;
          color: #3b82f6;
          cursor: pointer;
        }
        
        .mark-all-btn:hover {
          text-decoration: underline;
        }
        
        .notifications-list {
          max-height: 400px;
          overflow-y: auto;
        }
        
        .empty-state {
          text-align: center;
          padding: 2rem;
        }
        
        .empty-icon {
          font-size: 2rem;
          display: block;
          margin-bottom: 0.5rem;
        }
        
        .empty-state p {
          margin: 0;
          color: #6b7280;
        }
        
        .notification-item {
          display: flex;
          gap: 0.75rem;
          padding: 1rem;
          cursor: pointer;
          transition: background 0.2s;
          position: relative;
        }
        
        .notification-item:hover {
          background: #f9fafb;
        }
        
        .notification-item.unread {
          background: #eff6ff;
        }
        
        .notification-icon {
          font-size: 1.25rem;
          flex-shrink: 0;
        }
        
        .notification-content {
          flex: 1;
        }
        
        .notification-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 0.25rem;
        }
        
        .notification-message {
          font-size: 0.75rem;
          color: #6b7280;
          margin-bottom: 0.25rem;
        }
        
        .notification-time {
          font-size: 0.7rem;
          color: #9ca3af;
        }
        
        .unread-dot {
          position: absolute;
          right: 1rem;
          top: 1rem;
          width: 8px;
          height: 8px;
          background: #3b82f6;
          border-radius: 50%;
        }
        
        .dropdown-footer {
          padding: 0.75rem;
          border-top: 1px solid #e5e7eb;
          text-align: center;
        }
        
        .view-all-btn {
          background: none;
          border: none;
          color: #3b82f6;
          font-size: 0.875rem;
          cursor: pointer;
        }
        
        .view-all-btn:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}