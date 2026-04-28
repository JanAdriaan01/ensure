// components/operations/StockStatusBadge/StockStatusBadge.js
'use client';

export default function StockStatusBadge({ status, showLabel = true, size = 'md' }) {
  const getStatusConfig = () => {
    switch (status?.toLowerCase()) {
      case 'in-stock':
      case 'instock':
        return { label: 'In Stock', color: 'success', icon: '✅' };
      case 'low-stock':
        return { label: 'Low Stock', color: 'warning', icon: '⚠️' };
      case 'out-of-stock':
        return { label: 'Out of Stock', color: 'danger', icon: '❌' };
      case 'on-order':
        return { label: 'On Order', color: 'info', icon: '📦' };
      case 'discontinued':
        return { label: 'Discontinued', color: 'secondary', icon: '🚫' };
      default:
        return { label: status || 'Unknown', color: 'secondary', icon: '⚪' };
    }
  };
  
  const config = getStatusConfig();
  
  const sizeClasses = {
    sm: { padding: '0.125rem 0.5rem', fontSize: '0.75rem', iconSize: '0.75rem' },
    md: { padding: '0.25rem 0.75rem', fontSize: '0.875rem', iconSize: '0.875rem' },
    lg: { padding: '0.375rem 1rem', fontSize: '1rem', iconSize: '1rem' }
  };
  
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  
  return (
    <span className={`status-badge ${config.color}`}>
      <span className="status-icon">{config.icon}</span>
      {showLabel && <span className="status-label">{config.label}</span>}
      
      <style jsx>{`
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: ${sizeClass.padding};
          border-radius: 9999px;
          font-size: ${sizeClass.fontSize};
          font-weight: 500;
          white-space: nowrap;
        }
        
        .status-icon {
          font-size: ${sizeClass.iconSize};
        }
        
        .status-label {
          line-height: 1;
        }
        
        .status-badge.success {
          background: #d1fae5;
          color: #065f46;
        }
        
        .status-badge.warning {
          background: #fed7aa;
          color: #92400e;
        }
        
        .status-badge.danger {
          background: #fee2e2;
          color: #991b1b;
        }
        
        .status-badge.info {
          background: #dbeafe;
          color: #1e40af;
        }
        
        .status-badge.secondary {
          background: #f3f4f6;
          color: #374151;
        }
      `}</style>
    </span>
  );
}