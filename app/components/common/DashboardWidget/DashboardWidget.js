// components/common/DashboardWidget/DashboardWidget.js
'use client';

import { useState } from 'react';

export default function DashboardWidget({ 
  widget,
  onRemove,
  onRefresh,
  onResize,
  children,
  className = ''
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  const handleRefresh = async () => {
    setIsLoading(true);
    if (onRefresh) {
      await onRefresh();
    }
    setTimeout(() => setIsLoading(false), 500);
  };
  
  const getWidgetIcon = () => {
    const icons = {
      summary: '📊',
      chart: '📈',
      table: '📋',
      list: '📝',
      calendar: '📅',
      stats: '📉',
      activity: '🔄',
      recent: '⏰',
      tasks: '✅',
      alerts: '⚠️'
    };
    return icons[widget.type] || '📌';
  };
  
  const sizeOptions = [
    { value: 'small', label: 'Small (1x1)', cols: 1, rows: 1 },
    { value: 'medium', label: 'Medium (2x2)', cols: 2, rows: 2 },
    { value: 'large', label: 'Large (3x2)', cols: 3, rows: 2 },
    { value: 'wide', label: 'Wide (2x1)', cols: 2, rows: 1 }
  ];
  
  return (
    <div className={`dashboard-widget ${widget.size || 'medium'} ${className}`}>
      <div className="widget-header">
        <div className="widget-title">
          <span className="widget-icon">{getWidgetIcon()}</span>
          <h3 className="widget-name">{widget.title}</h3>
          {widget.subtitle && (
            <span className="widget-subtitle">{widget.subtitle}</span>
          )}
        </div>
        
        <div className="widget-controls">
          {isLoading && (
            <span className="loading-spinner">⏳</span>
          )}
          
          {onRefresh && (
            <button 
              className="control-btn refresh-btn"
              onClick={handleRefresh}
              title="Refresh"
            >
              🔄
            </button>
          )}
          
          <button 
            className="control-btn minimize-btn"
            onClick={() => setIsMinimized(!isMinimized)}
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? '□' : '−'}
          </button>
          
          {onRemove && (
            <div className="widget-menu">
              <button 
                className="control-btn menu-btn"
                onClick={() => setShowMenu(!showMenu)}
                title="Options"
              >
                ⋮
              </button>
              
              {showMenu && (
                <div className="menu-dropdown">
                  {onResize && (
                    <div className="menu-section">
                      <label>Size</label>
                      {sizeOptions.map(opt => (
                        <button
                          key={opt.value}
                          className={`size-option ${widget.size === opt.value ? 'active' : ''}`}
                          onClick={() => {
                            onResize(opt.value);
                            setShowMenu(false);
                          }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                  <button 
                    className="menu-item remove"
                    onClick={() => {
                      onRemove();
                      setShowMenu(false);
                    }}
                  >
                    Remove Widget
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {!isMinimized && (
        <div className="widget-content">
          {children}
        </div>
      )}
      
      <style jsx>{`
        .dashboard-widget {
          background: white;
          border-radius: 0.75rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          overflow: hidden;
          transition: all 0.2s;
        }
        
        .dashboard-widget:hover {
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        .widget-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid #e5e7eb;
          background: #f9fafb;
        }
        
        .widget-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        
        .widget-icon {
          font-size: 1.25rem;
        }
        
        .widget-name {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: #111827;
        }
        
        .widget-subtitle {
          font-size: 0.75rem;
          color: #6b7280;
        }
        
        .widget-controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .loading-spinner {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .control-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.25rem;
          font-size: 1rem;
          opacity: 0.6;
          transition: all 0.2s;
        }
        
        .control-btn:hover {
          opacity: 1;
          transform: scale(1.1);
        }
        
        .widget-menu {
          position: relative;
        }
        
        .menu-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 0.25rem;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          min-width: 160px;
          z-index: 10;
        }
        
        .menu-section {
          padding: 0.5rem;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .menu-section label {
          display: block;
          font-size: 0.7rem;
          font-weight: 600;
          color: #6b7280;
          margin-bottom: 0.5rem;
          text-transform: uppercase;
        }
        
        .size-option {
          display: block;
          width: 100%;
          padding: 0.375rem 0.5rem;
          text-align: left;
          background: none;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 0.875rem;
          transition: background 0.2s;
        }
        
        .size-option:hover {
          background: #f3f4f6;
        }
        
        .size-option.active {
          background: #dbeafe;
          color: #1e40af;
        }
        
        .menu-item {
          display: block;
          width: 100%;
          padding: 0.5rem;
          text-align: left;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 0.875rem;
          transition: background 0.2s;
        }
        
        .menu-item:hover {
          background: #f3f4f6;
        }
        
        .menu-item.remove {
          color: #ef4444;
        }
        
        .menu-item.remove:hover {
          background: #fee2e2;
        }
        
        .widget-content {
          padding: 1rem;
          max-height: 400px;
          overflow-y: auto;
        }
        
        /* Size variants */
        .dashboard-widget.small .widget-content {
          max-height: 200px;
        }
        
        .dashboard-widget.large .widget-content {
          max-height: 500px;
        }
      `}</style>
    </div>
  );
}