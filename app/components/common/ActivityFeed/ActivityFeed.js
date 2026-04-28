// components/common/ActivityFeed/ActivityFeed.js
'use client';

import { useState } from 'react';

export default function ActivityFeed({ 
  activities = [], 
  title = 'Recent Activity',
  maxItems = 20,
  showViewAll = true,
  onViewAll,
  onActivityClick,
  filter = 'all',
  className = ''
}) {
  const [currentFilter, setCurrentFilter] = useState(filter);
  
  const filters = [
    { value: 'all', label: 'All', icon: '📋' },
    { value: 'create', label: 'Created', icon: '➕' },
    { value: 'update', label: 'Updated', icon: '✏️' },
    { value: 'delete', label: 'Deleted', icon: '🗑️' },
    { value: 'status', label: 'Status Change', icon: '🔄' },
    { value: 'comment', label: 'Comments', icon: '💬' }
  ];
  
  const getActivityIcon = (type) => {
    const icons = {
      create: '➕',
      update: '✏️',
      delete: '🗑️',
      status: '🔄',
      comment: '💬',
      upload: '📎',
      download: '📥',
      share: '🔗',
      login: '🔐',
      logout: '🚪'
    };
    return icons[type] || '📌';
  };
  
  const getActivityColor = (type) => {
    const colors = {
      create: '#10b981',
      update: '#3b82f6',
      delete: '#ef4444',
      status: '#f59e0b',
      comment: '#8b5cf6',
      upload: '#06b6d4',
      default: '#6b7280'
    };
    return colors[type] || colors.default;
  };
  
  const getTimeAgo = (date) => {
    const diff = Math.floor((new Date() - new Date(date)) / 1000);
    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
    return new Date(date).toLocaleDateString();
  };
  
  const filteredActivities = activities.filter(activity => {
    if (currentFilter === 'all') return true;
    return activity.type === currentFilter;
  }).slice(0, maxItems);
  
  return (
    <div className={`activity-feed ${className}`}>
      <div className="feed-header">
        <h3 className="feed-title">{title}</h3>
        <div className="filter-tabs">
          {filters.map(filter => (
            <button
              key={filter.value}
              className={`filter-tab ${currentFilter === filter.value ? 'active' : ''}`}
              onClick={() => setCurrentFilter(filter.value)}
            >
              <span className="filter-icon">{filter.icon}</span>
              <span className="filter-label">{filter.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      <div className="feed-items">
        {filteredActivities.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <p>No activity to display</p>
          </div>
        ) : (
          filteredActivities.map((activity, idx) => (
            <div
              key={activity.id || idx}
              className="feed-item"
              onClick={() => onActivityClick && onActivityClick(activity)}
            >
              <div 
                className="activity-icon"
                style={{ background: getActivityColor(activity.type) }}
              >
                {getActivityIcon(activity.type)}
              </div>
              <div className="activity-content">
                <div className="activity-header">
                  <span className="activity-user">{activity.user}</span>
                  <span className="activity-time">{getTimeAgo(activity.timestamp)}</span>
                </div>
                <div className="activity-description">
                  {activity.description}
                  {activity.target && (
                    <span className="activity-target"> • {activity.target}</span>
                  )}
                </div>
                {activity.details && (
                  <div className="activity-details">
                    {activity.details}
                  </div>
                )}
                {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                  <div className="activity-metadata">
                    {Object.entries(activity.metadata).map(([key, value]) => (
                      <span key={key} className="metadata-tag">
                        {key}: {value}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      {showViewAll && activities.length > maxItems && (
        <div className="feed-footer">
          <button className="view-all-btn" onClick={onViewAll}>
            View all {activities.length} activities →
          </button>
        </div>
      )}
      
      <style jsx>{`
        .activity-feed {
          background: white;
          border-radius: 0.75rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        
        .feed-header {
          padding: 1rem;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .feed-title {
          margin: 0 0 1rem 0;
          font-size: 1rem;
          font-weight: 600;
          color: #111827;
        }
        
        .filter-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .filter-tab {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.375rem 0.75rem;
          background: #f3f4f6;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 0.75rem;
          transition: all 0.2s;
        }
        
        .filter-tab:hover {
          background: #e5e7eb;
        }
        
        .filter-tab.active {
          background: #3b82f6;
          color: white;
        }
        
        .filter-icon {
          font-size: 0.75rem;
        }
        
        .feed-items {
          max-height: 500px;
          overflow-y: auto;
        }
        
        .empty-state {
          text-align: center;
          padding: 3rem;
        }
        
        .empty-icon {
          font-size: 3rem;
          display: block;
          margin-bottom: 1rem;
        }
        
        .empty-state p {
          margin: 0;
          color: #6b7280;
        }
        
        .feed-item {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          border-bottom: 1px solid #f3f4f6;
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .feed-item:hover {
          background: #f9fafb;
        }
        
        .activity-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 0.875rem;
          flex-shrink: 0;
        }
        
        .activity-content {
          flex: 1;
        }
        
        .activity-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 0.25rem;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .activity-user {
          font-weight: 600;
          font-size: 0.875rem;
          color: #111827;
        }
        
        .activity-time {
          font-size: 0.7rem;
          color: #9ca3af;
        }
        
        .activity-description {
          font-size: 0.875rem;
          color: #6b7280;
          margin-bottom: 0.25rem;
        }
        
        .activity-target {
          font-weight: 500;
          color: #3b82f6;
        }
        
        .activity-details {
          font-size: 0.75rem;
          color: #9ca3af;
          margin-top: 0.25rem;
        }
        
        .activity-metadata {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }
        
        .metadata-tag {
          padding: 0.125rem 0.375rem;
          background: #f3f4f6;
          border-radius: 0.25rem;
          font-size: 0.7rem;
          color: #6b7280;
        }
        
        .feed-footer {
          padding: 0.75rem;
          text-align: center;
          border-top: 1px solid #e5e7eb;
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

// Add named export for compatibility with the import in page.js
export { ActivityFeed as RecentActivity };