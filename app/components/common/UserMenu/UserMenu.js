// components/common/UserMenu/UserMenu.js
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export default function UserMenu({ 
  user, 
  onLogout, 
  onSettings,
  onProfile,
  menuItems = [],
  avatarSize = 'md',
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const getInitials = () => {
    if (!user?.name) return 'U';
    return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };
  
  const getAvatarColor = () => {
    const colors = [
      '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'
    ];
    const index = (user?.id?.length || 0) % colors.length;
    return colors[index];
  };
  
  const sizeStyles = {
    sm: { width: '32px', height: '32px', fontSize: '0.75rem' },
    md: { width: '40px', height: '40px', fontSize: '0.875rem' },
    lg: { width: '48px', height: '48px', fontSize: '1rem' }
  };
  
  const defaultMenuItems = [
    { label: '👤 My Profile', action: 'profile', icon: '👤' },
    { label: '⚙️ Settings', action: 'settings', icon: '⚙️' },
    { label: '🔐 Security', action: 'security', icon: '🔐' },
    { divider: true },
    { label: '❓ Help & Support', action: 'help', icon: '❓' },
    { label: '📋 Changelog', action: 'changelog', icon: '📋' },
    { divider: true },
    { label: '🚪 Logout', action: 'logout', icon: '🚪', danger: true }
  ];
  
  const items = menuItems.length > 0 ? menuItems : defaultMenuItems;
  
  const handleAction = (action) => {
    setIsOpen(false);
    
    switch (action) {
      case 'profile':
        if (onProfile) onProfile();
        break;
      case 'settings':
        if (onSettings) onSettings();
        break;
      case 'logout':
        if (onLogout) onLogout();
        break;
      default:
        if (typeof action === 'function') action();
    }
  };
  
  return (
    <div className={`user-menu ${className}`} ref={menuRef}>
      <button 
        className="avatar-btn"
        onClick={() => setIsOpen(!isOpen)}
        style={sizeStyles[avatarSize]}
      >
        {user?.avatar ? (
          <img src={user.avatar} alt={user.name} className="avatar-img" />
        ) : (
          <div 
            className="avatar-initials" 
            style={{ background: getAvatarColor() }}
          >
            {getInitials()}
          </div>
        )}
      </button>
      
      {isOpen && (
        <div className="dropdown">
          <div className="user-info">
            <div className="user-avatar">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} />
              ) : (
                <div style={{ background: getAvatarColor() }}>
                  {getInitials()}
                </div>
              )}
            </div>
            <div className="user-details">
              <div className="user-name">{user?.name || 'User'}</div>
              <div className="user-email">{user?.email || 'user@example.com'}</div>
              {user?.role && (
                <div className="user-role">{user.role}</div>
              )}
            </div>
          </div>
          
          <div className="menu-items">
            {items.map((item, idx) => (
              item.divider ? (
                <div key={idx} className="divider" />
              ) : (
                <button
                  key={idx}
                  className={`menu-item ${item.danger ? 'danger' : ''}`}
                  onClick={() => handleAction(item.action)}
                >
                  <span className="item-icon">{item.icon}</span>
                  <span className="item-label">{item.label}</span>
                  {item.badge && (
                    <span className="item-badge">{item.badge}</span>
                  )}
                </button>
              )
            ))}
          </div>
        </div>
      )}
      
      <style jsx>{`
        .user-menu {
          position: relative;
          display: inline-block;
        }
        
        .avatar-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          border-radius: 50%;
          overflow: hidden;
          transition: all 0.2s;
        }
        
        .avatar-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        
        .avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .avatar-initials {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
        }
        
        .dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 0.5rem;
          width: 280px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          z-index: 50;
          overflow: hidden;
        }
        
        .user-info {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .user-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
        }
        
        .user-avatar img,
        .user-avatar div {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 1rem;
        }
        
        .user-details {
          flex: 1;
        }
        
        .user-name {
          font-weight: 600;
          color: #111827;
          margin-bottom: 0.25rem;
        }
        
        .user-email {
          font-size: 0.75rem;
          color: #6b7280;
          margin-bottom: 0.25rem;
        }
        
        .user-role {
          display: inline-block;
          padding: 0.125rem 0.375rem;
          background: #dbeafe;
          color: #1e40af;
          border-radius: 0.25rem;
          font-size: 0.7rem;
          font-weight: 500;
        }
        
        .menu-items {
          padding: 0.5rem 0;
        }
        
        .menu-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.625rem 1rem;
          background: none;
          border: none;
          cursor: pointer;
          transition: background 0.2s;
          font-size: 0.875rem;
          color: #374151;
        }
        
        .menu-item:hover {
          background: #f3f4f6;
        }
        
        .menu-item.danger {
          color: #dc2626;
        }
        
        .menu-item.danger:hover {
          background: #fee2e2;
        }
        
        .item-icon {
          font-size: 1rem;
        }
        
        .item-label {
          flex: 1;
          text-align: left;
        }
        
        .item-badge {
          padding: 0.125rem 0.375rem;
          background: #ef4444;
          color: white;
          border-radius: 9999px;
          font-size: 0.7rem;
        }
        
        .divider {
          height: 1px;
          background: #e5e7eb;
          margin: 0.25rem 0;
        }
      `}</style>
    </div>
  );
}