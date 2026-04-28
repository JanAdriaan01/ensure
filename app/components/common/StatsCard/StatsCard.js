// app/components/common/StatsCard/StatsCard.js
'use client';

import { useState } from 'react';
import CurrencyAmount from '@/app/components/CurrencyAmount';

export default function StatsCard({ 
  title,
  value,
  change,
  icon,
  color = 'blue',
  subtitle,
  onClick,
  loading = false,
  trend = null,
  size = 'md',
  className = ''
}) {
  const [isHovered, setIsHovered] = useState(false);
  
  const colorStyles = {
    blue: { bg: '#dbeafe', iconBg: '#3b82f6', text: '#1e40af', change: '#3b82f6' },
    green: { bg: '#d1fae5', iconBg: '#10b981', text: '#065f46', change: '#10b981' },
    red: { bg: '#fee2e2', iconBg: '#ef4444', text: '#991b1b', change: '#ef4444' },
    yellow: { bg: '#fed7aa', iconBg: '#f59e0b', text: '#92400e', change: '#f59e0b' },
    purple: { bg: '#e9d5ff', iconBg: '#8b5cf6', text: '#6b21a5', change: '#8b5cf6' },
    indigo: { bg: '#e0e7ff', iconBg: '#6366f1', text: '#3730a3', change: '#6366f1' },
    pink: { bg: '#fce7f3', iconBg: '#ec4899', text: '#9d174d', change: '#ec4899' }
  };
  
  const sizeStyles = {
    sm: { padding: '0.75rem', titleSize: '0.75rem', valueSize: '1.25rem' },
    md: { padding: '1rem', titleSize: '0.875rem', valueSize: '1.5rem' },
    lg: { padding: '1.25rem', titleSize: '1rem', valueSize: '2rem' }
  };
  
  const style = colorStyles[color] || colorStyles.blue;
  const sizeStyle = sizeStyles[size] || sizeStyles.md;
  
  const getChangeIcon = () => {
    if (!change) return null;
    if (change > 0) return '↑';
    if (change < 0) return '↓';
    return '→';
  };
  
  const getTrendColor = () => {
    if (!trend) return style.change;
    if (trend === 'up') return '#10b981';
    if (trend === 'down') return '#ef4444';
    return style.change;
  };
  
  const formatValue = () => {
    if (value === undefined || value === null) return '—';
    if (typeof value === 'number') {
      return <CurrencyAmount amount={value} />;
    }
    return value;
  };
  
  return (
    <div 
      className={`stats-card ${onClick ? 'clickable' : ''} ${size} ${className}`}
      style={{ padding: sizeStyle.padding }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {loading ? (
        <div className="loading-skeleton">
          <div className="skeleton-icon"></div>
          <div className="skeleton-content">
            <div className="skeleton-title"></div>
            <div className="skeleton-value"></div>
          </div>
        </div>
      ) : (
        <>
          <div className="card-header">
            <div className="icon-wrapper" style={{ background: style.iconBg }}>
              <span className="icon">{icon}</span>
            </div>
            {change && (
              <div className="change-badge" style={{ color: style.change }}>
                <span className="change-icon">{getChangeIcon()}</span>
                <span>{Math.abs(change)}%</span>
              </div>
            )}
          </div>
          
          <div className="card-content">
            <h3 className="title" style={{ fontSize: sizeStyle.titleSize, color: style.text }}>
              {title}
            </h3>
            <div className="value" style={{ fontSize: sizeStyle.valueSize }}>
              {formatValue()}
            </div>
            {subtitle && (
              <div className="subtitle">{subtitle}</div>
            )}
            {trend && (
              <div className="trend-line">
                <div className="trend-line-fill" style={{ width: `${Math.abs(trend)}%`, background: getTrendColor() }} />
              </div>
            )}
          </div>
        </>
      )}
      
      <style jsx>{`
        .stats-card {
          background: white;
          border-radius: 0.75rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          transition: all 0.3s;
          position: relative;
          overflow: hidden;
        }
        
        .stats-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .stats-card.clickable {
          cursor: pointer;
        }
        
        .stats-card.clickable:active {
          transform: translateY(0);
        }
        
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }
        
        .icon-wrapper {
          width: 40px;
          height: 40px;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
        }
        
        .stats-card:hover .icon-wrapper {
          transform: scale(1.05);
        }
        
        .icon {
          font-size: 1.25rem;
        }
        
        .change-badge {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          font-weight: 500;
          background: #f9fafb;
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
        }
        
        .change-icon {
          font-size: 0.75rem;
        }
        
        .card-content {
          text-align: left;
        }
        
        .title {
          margin: 0 0 0.5rem 0;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .value {
          font-weight: 700;
          color: #111827;
          margin-bottom: 0.25rem;
        }
        
        .subtitle {
          font-size: 0.75rem;
          color: #6b7280;
        }
        
        .trend-line {
          margin-top: 0.75rem;
          height: 4px;
          background: #f3f4f6;
          border-radius: 2px;
          overflow: hidden;
        }
        
        .trend-line-fill {
          height: 100%;
          border-radius: 2px;
          transition: width 0.5s ease;
        }
        
        .loading-skeleton {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }
        
        .skeleton-icon {
          width: 40px;
          height: 40px;
          background: #f3f4f6;
          border-radius: 0.5rem;
          animation: pulse 1.5s ease-in-out infinite;
        }
        
        .skeleton-content {
          flex: 1;
        }
        
        .skeleton-title {
          height: 12px;
          width: 60%;
          background: #f3f4f6;
          border-radius: 0.25rem;
          margin-bottom: 0.5rem;
          animation: pulse 1.5s ease-in-out infinite;
        }
        
        .skeleton-value {
          height: 20px;
          width: 80%;
          background: #f3f4f6;
          border-radius: 0.25rem;
          animation: pulse 1.5s ease-in-out infinite;
          animation-delay: 0.2s;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}