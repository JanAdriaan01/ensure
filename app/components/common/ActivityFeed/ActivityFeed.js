'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

export function ActivityFeed({ activities, loading, limit = 5 }) {
  if (loading) {
    return (
      <div className="activity-feed">
        <div className="feed-header">
          <h3>Recent Activity</h3>
        </div>
        <div className="feed-list">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="feed-item skeleton">
              <div className="feed-icon-placeholder"></div>
              <div className="feed-content">
                <div className="feed-title-placeholder"></div>
                <div className="feed-time-placeholder"></div>
              </div>
            </div>
          ))}
        </div>
        <style jsx>{`
          .activity-feed {
            background: var(--card-bg);
            border: 1px solid var(--card-border);
            border-radius: 0.75rem;
            overflow: hidden;
          }
          .feed-header {
            padding: 1rem;
            border-bottom: 1px solid var(--border-light);
          }
          .feed-header h3 {
            margin: 0;
            font-size: 0.9rem;
            font-weight: 600;
            color: var(--text-primary);
          }
          .feed-list {
            padding: 0.5rem;
          }
          .feed-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.75rem;
            border-radius: 0.5rem;
          }
          .feed-icon-placeholder {
            width: 36px;
            height: 36px;
            background: var(--bg-tertiary);
            border-radius: 0.5rem;
            animation: pulse 1.5s ease-in-out infinite;
          }
          .feed-content {
            flex: 1;
          }
          .feed-title-placeholder {
            height: 16px;
            width: 70%;
            background: var(--bg-tertiary);
            border-radius: 0.25rem;
            margin-bottom: 0.5rem;
            animation: pulse 1.5s ease-in-out infinite;
          }
          .feed-time-placeholder {
            height: 12px;
            width: 40%;
            background: var(--bg-tertiary);
            border-radius: 0.25rem;
            animation: pulse 1.5s ease-in-out infinite;
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="activity-feed">
        <div className="feed-header">
          <h3>Recent Activity</h3>
          <Link href="/activities" className="view-all">View All →</Link>
        </div>
        <div className="empty-state">
          <span className="empty-icon">📭</span>
          <p>No recent activity</p>
        </div>
        <style jsx>{`
          .activity-feed {
            background: var(--card-bg);
            border: 1px solid var(--card-border);
            border-radius: 0.75rem;
            overflow: hidden;
          }
          .feed-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            border-bottom: 1px solid var(--border-light);
          }
          .feed-header h3 {
            margin: 0;
            font-size: 0.9rem;
            font-weight: 600;
            color: var(--text-primary);
          }
          .view-all {
            font-size: 0.7rem;
            color: var(--primary);
            text-decoration: none;
          }
          .view-all:hover {
            text-decoration: underline;
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
            color: var(--text-tertiary);
            font-size: 0.875rem;
          }
        `}</style>
      </div>
    );
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'job':
        return '📋';
      case 'quote':
        return '💰';
      case 'employee':
        return '👤';
      case 'client':
        return '🏢';
      case 'invoice':
        return '🧾';
      default:
        return '📌';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'job':
        return 'var(--primary)';
      case 'quote':
        return 'var(--success)';
      case 'employee':
        return 'var(--info)';
      case 'client':
        return 'var(--secondary)';
      case 'invoice':
        return 'var(--warning)';
      default:
        return 'var(--text-tertiary)';
    }
  };

  const displayActivities = activities.slice(0, limit);

  return (
    <div className="activity-feed">
      <div className="feed-header">
        <h3>Recent Activity</h3>
        <Link href="/activities" className="view-all">View All →</Link>
      </div>
      <div className="feed-list">
        {displayActivities.map((activity) => (
          <div key={activity.id} className="feed-item">
            <div 
              className="feed-icon" 
              style={{ background: `${getActivityColor(activity.type)}20` }}
            >
              <span>{getActivityIcon(activity.type)}</span>
            </div>
            <div className="feed-content">
              <div className="feed-title">{activity.title || activity.description}</div>
              <div className="feed-time">
                {activity.created_at 
                  ? formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })
                  : 'Just now'}
              </div>
            </div>
            {activity.status && (
              <div className={`feed-status status-${activity.status.toLowerCase().replace(/_/g, '-')}`}>
                {activity.status.replace(/_/g, ' ')}
              </div>
            )}
          </div>
        ))}
      </div>

      <style jsx>{`
        .activity-feed {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 0.75rem;
          overflow: hidden;
        }
        .feed-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid var(--border-light);
        }
        .feed-header h3 {
          margin: 0;
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-primary);
        }
        .view-all {
          font-size: 0.7rem;
          color: var(--primary);
          text-decoration: none;
        }
        .view-all:hover {
          text-decoration: underline;
        }
        .feed-list {
          padding: 0.5rem;
        }
        .feed-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          border-radius: 0.5rem;
          transition: background 0.2s;
        }
        .feed-item:hover {
          background: var(--bg-tertiary);
        }
        .feed-icon {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.5rem;
          font-size: 1.125rem;
        }
        .feed-content {
          flex: 1;
        }
        .feed-title {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }
        .feed-time {
          font-size: 0.7rem;
          color: var(--text-tertiary);
        }
        .feed-status {
          font-size: 0.7rem;
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
          font-weight: 500;
        }
        .status-pending {
          background: var(--warning-bg);
          color: var(--warning-dark);
        }
        .status-approved,
        .status-completed,
        .status-paid {
          background: var(--success-bg);
          color: var(--success-dark);
        }
        .status-in-progress,
        .status-in_progress {
          background: var(--primary-bg);
          color: var(--primary-dark);
        }
        .status-rejected {
          background: var(--danger-bg);
          color: var(--danger-dark);
        }
      `}</style>
    </div>
  );
}