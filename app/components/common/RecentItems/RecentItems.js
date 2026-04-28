// components/common/RecentItems/RecentItems.js
'use client';

import { useState } from 'react';

export default function RecentItems({ 
  items = [],
  title = 'Recent Items',
  maxItems = 5,
  showViewAll = true,
  onViewAll,
  onItemClick,
  onPin,
  onDismiss,
  typeIcons = {},
  className = ''
}) {
  const [pinnedItems, setPinnedItems] = useState([]);
  
  const getItemIcon = (type) => {
    const defaultIcons = {
      job: '🔧',
      quote: '📄',
      invoice: '💰',
      client: '👥',
      employee: '👤',
      tool: '🔨',
      stock: '📦',
      workorder: '📋',
      team: '👥',
      report: '📊'
    };
    return typeIcons[type] || defaultIcons[type] || '📌';
  };
  
  const getTimeAgo = (date) => {
    if (!date) return '';
    const diff = Math.floor((new Date() - new Date(date)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };
  
  const handlePin = (item, e) => {
    e.stopPropagation();
    setPinnedItems(prev => {
      if (prev.includes(item.id)) {
        return prev.filter(id => id !== item.id);
      } else {
        return [...prev, item.id];
      }
    });
    if (onPin) onPin(item);
  };
  
  const handleDismiss = (item, e) => {
    e.stopPropagation();
    if (onDismiss) onDismiss(item);
  };
  
  const sortedItems = [...items].sort((a, b) => {
    const aPinned = pinnedItems.includes(a.id);
    const bPinned = pinnedItems.includes(b.id);
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;
    return new Date(b.lastAccessed) - new Date(a.lastAccessed);
  }).slice(0, maxItems);
  
  return (
    <div className={`recent-items ${className}`}>
      <div className="items-header">
        <h3 className="items-title">{title}</h3>
        {showViewAll && items.length > maxItems && (
          <button className="view-all-link" onClick={onViewAll}>
            View All →
          </button>
        )}
      </div>
      
      <div className="items-list">
        {sortedItems.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <p>No recent items</p>
          </div>
        ) : (
          sortedItems.map(item => (
            <div
              key={item.id}
              className={`item-row ${pinnedItems.includes(item.id) ? 'pinned' : ''}`}
              onClick={() => onItemClick && onItemClick(item)}
            >
              <div className="item-icon">{getItemIcon(item.type)}</div>
              <div className="item-details">
                <div className="item-title">
                  {item.title || item.name || `Item ${item.id}`}
                  {item.number && <span className="item-number">#{item.number}</span>}
                </div>
                <div className="item-meta">
                  {item.type && <span className="item-type">{item.type}</span>}
                  {item.status && (
                    <span className={`item-status ${item.status.toLowerCase()}`}>
                      {item.status}
                    </span>
                  )}
                  {item.lastAccessed && (
                    <span className="item-time">{getTimeAgo(item.lastAccessed)}</span>
                  )}
                </div>
              </div>
              <div className="item-actions">
                {onPin && (
                  <button 
                    className={`pin-btn ${pinnedItems.includes(item.id) ? 'pinned' : ''}`}
                    onClick={(e) => handlePin(item, e)}
                    title={pinnedItems.includes(item.id) ? 'Unpin' : 'Pin'}
                  >
                    📌
                  </button>
                )}
                {onDismiss && (
                  <button 
                    className="dismiss-btn"
                    onClick={(e) => handleDismiss(item, e)}
                    title="Dismiss"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      <style jsx>{`
        .recent-items {
          background: white;
          border-radius: 0.75rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        
        .items-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .items-title {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: #111827;
        }
        
        .view-all-link {
          background: none;
          border: none;
          color: #3b82f6;
          font-size: 0.875rem;
          cursor: pointer;
        }
        
        .view-all-link:hover {
          text-decoration: underline;
        }
        
        .items-list {
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
          font-size: 0.875rem;
        }
        
        .item-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #f3f4f6;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .item-row:hover {
          background: #f9fafb;
        }
        
        .item-row.pinned {
          background: #fffbeb;
        }
        
        .item-icon {
          font-size: 1.25rem;
          flex-shrink: 0;
        }
        
        .item-details {
          flex: 1;
        }
        
        .item-title {
          font-weight: 500;
          font-size: 0.875rem;
          color: #111827;
          margin-bottom: 0.25rem;
        }
        
        .item-number {
          font-size: 0.75rem;
          color: #6b7280;
          margin-left: 0.5rem;
        }
        
        .item-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          align-items: center;
        }
        
        .item-type {
          font-size: 0.7rem;
          color: #6b7280;
          text-transform: capitalize;
        }
        
        .item-status {
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-size: 0.7rem;
          font-weight: 500;
        }
        
        .item-status.active, .item-status.completed {
          background: #d1fae5;
          color: #065f46;
        }
        
        .item-status.pending, .item-status.in-progress {
          background: #fed7aa;
          color: #92400e;
        }
        
        .item-status.overdue {
          background: #fee2e2;
          color: #991b1b;
        }
        
        .item-time {
          font-size: 0.7rem;
          color: #9ca3af;
        }
        
        .item-actions {
          display: flex;
          gap: 0.25rem;
          flex-shrink: 0;
        }
        
        .pin-btn, .dismiss-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.25rem;
          font-size: 0.875rem;
          opacity: 0.5;
          transition: opacity 0.2s;
        }
        
        .pin-btn:hover, .dismiss-btn:hover {
          opacity: 1;
        }
        
        .pin-btn.pinned {
          opacity: 1;
          color: #f59e0b;
          transform: rotate(-45deg);
        }
        
        .dismiss-btn:hover {
          color: #ef4444;
        }
      `}</style>
    </div>
  );
}