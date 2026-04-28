// components/hr/EmployeeStatusBadge/EmployeeStatusBadge.js
'use client';

export default function EmployeeStatusBadge({ status, showLabel = true, size = 'md' }) {
  const getStatusConfig = () => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'full-time':
        return { label: 'Active', color: 'success', icon: '🟢' };
      case 'part-time':
        return { label: 'Part Time', color: 'info', icon: '🔵' };
      case 'on-leave':
      case 'leave':
        return { label: 'On Leave', color: 'warning', icon: '🟡' };
      case 'probation':
        return { label: 'Probation', color: 'warning', icon: '📝' };
      case 'terminated':
      case 'inactive':
        return { label: 'Terminated', color: 'danger', icon: '🔴' };
      case 'contract':
        return { label: 'Contract', color: 'purple', icon: '📄' };
      case 'remote':
        return { label: 'Remote', color: 'cyan', icon: '🏠' };
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
        
        .status-badge.info {
          background: #dbeafe;
          color: #1e40af;
        }
        
        .status-badge.warning {
          background: #fed7aa;
          color: #92400e;
        }
        
        .status-badge.danger {
          background: #fee2e2;
          color: #991b1b;
        }
        
        .status-badge.purple {
          background: #e9d5ff;
          color: #6b21a5;
        }
        
        .status-badge.cyan {
          background: #cffafe;
          color: #155e75;
        }
        
        .status-badge.secondary {
          background: #f3f4f6;
          color: #374151;
        }
      `}</style>
    </span>
  );
}