'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/app/context/PermissionContext';

export default function QuickActions({ 
  actions = [],
  title = 'Quick Actions',
  columns = 2,
  showIcon = true,
  onActionClick,
  className = ''
}) {
  const router = useRouter();
  const { can } = usePermissions();
  const [hoveredAction, setHoveredAction] = useState(null);
  
  const getDefaultActions = () => [
    { 
      id: 'new-job', 
      label: 'New Job', 
      icon: '🔧', 
      color: '#3b82f6', 
      shortcut: '⌘J', 
      action: 'new-job',
      href: '/jobs/new',
      permission: 'job:create'
    },
    { 
      id: 'new-quote', 
      label: 'New Quote', 
      icon: '📄', 
      color: '#10b981', 
      shortcut: '⌘Q', 
      action: 'new-quote',
      href: '/quotes/new',
      permission: 'quote:create'
    },
    { 
      id: 'new-invoice', 
      label: 'New Invoice', 
      icon: '💰', 
      color: '#f59e0b', 
      shortcut: '⌘I', 
      action: 'new-invoice',
      href: '/invoicing/new',
      permission: 'invoice:create'
    },
    { 
      id: 'new-client', 
      label: 'Add Client', 
      icon: '👥', 
      color: '#8b5cf6', 
      shortcut: '⌘C', 
      action: 'new-client',
      href: '/clients/new',
      permission: 'client:create'
    },
    { 
      id: 'new-employee', 
      label: 'Add Employee', 
      icon: '👤', 
      color: '#ec4899', 
      shortcut: '⌘E', 
      action: 'new-employee',
      href: '/employees/new',
      permission: 'employee:create'
    },
    { 
      id: 'new-tool', 
      label: 'Add Tool', 
      icon: '🔨', 
      color: '#06b6d4', 
      shortcut: '⌘T', 
      action: 'new-tool',
      href: '/tools/new',
      permission: 'tool:create'
    },
    { 
      id: 'new-stock', 
      label: 'Add Stock', 
      icon: '📦', 
      color: '#84cc16', 
      shortcut: '⌘S', 
      action: 'new-stock',
      href: '/stock/new',
      permission: 'stock:create'
    },
    { 
      id: 'log-time', 
      label: 'Log Time', 
      icon: '⏰', 
      color: '#f97316', 
      shortcut: '⌘L', 
      action: 'log-time',
      href: '/employees/time',
      permission: 'employee:edit'
    }
  ];
  
  // Filter actions based on user permissions
  const items = (actions.length > 0 ? actions : getDefaultActions())
    .filter(action => !action.permission || can(action.permission));
  
  const handleAction = (action) => {
    if (onActionClick) {
      onActionClick(action);
    } else if (action.href) {
      router.push(action.href);
    }
  };
  
  if (items.length === 0) return null;
  
  return (
    <div className={`quick-actions ${className}`}>
      <div className="actions-header">
        <h3 className="actions-title">{title}</h3>
        <span className="actions-hint">Quick shortcuts</span>
      </div>
      
      <div className={`actions-grid columns-${Math.min(columns, items.length)}`}>
        {items.map(action => (
          <button
            key={action.id}
            className={`action-card ${hoveredAction === action.id ? 'hovered' : ''}`}
            onMouseEnter={() => setHoveredAction(action.id)}
            onMouseLeave={() => setHoveredAction(null)}
            onClick={() => handleAction(action)}
          >
            {showIcon && (
              <div 
                className="action-icon" 
                style={{ background: action.color || '#6b7280' }}
              >
                {action.icon}
              </div>
            )}
            <div className="action-content">
              <div className="action-label">{action.label}</div>
              {action.shortcut && (
                <div className="action-shortcut">{action.shortcut}</div>
              )}
            </div>
            <div className="action-arrow">→</div>
          </button>
        ))}
      </div>
      
      <style jsx>{`
        .quick-actions {
          background: white;
          border-radius: 0.75rem;
          padding: 1rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .actions-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .actions-title {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: #111827;
        }
        
        .actions-hint {
          font-size: 0.7rem;
          color: #9ca3af;
        }
        
        .actions-grid {
          display: grid;
          gap: 0.75rem;
        }
        
        .actions-grid.columns-2 {
          grid-template-columns: repeat(2, 1fr);
        }
        
        .actions-grid.columns-3 {
          grid-template-columns: repeat(3, 1fr);
        }
        
        .actions-grid.columns-4 {
          grid-template-columns: repeat(4, 1fr);
        }
        
        .action-card {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
          width: 100%;
        }
        
        .action-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          border-color: transparent;
        }
        
        .action-card.hovered {
          background: #f9fafb;
        }
        
        .action-icon {
          width: 40px;
          height: 40px;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          flex-shrink: 0;
        }
        
        .action-content {
          flex: 1;
        }
        
        .action-label {
          font-weight: 500;
          font-size: 0.875rem;
          color: #111827;
          margin-bottom: 0.25rem;
        }
        
        .action-shortcut {
          font-size: 0.7rem;
          color: #9ca3af;
          font-family: monospace;
        }
        
        .action-arrow {
          font-size: 1rem;
          color: #d1d5db;
          transition: transform 0.2s;
        }
        
        .action-card:hover .action-arrow {
          transform: translateX(4px);
          color: #3b82f6;
        }
        
        @media (max-width: 768px) {
          .actions-grid.columns-3,
          .actions-grid.columns-4 {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (max-width: 480px) {
          .actions-grid.columns-2,
          .actions-grid.columns-3,
          .actions-grid.columns-4 {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}