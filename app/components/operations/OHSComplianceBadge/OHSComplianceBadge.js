// components/operations/OHSComplianceBadge/OHSComplianceBadge.js
'use client';

export default function OHSComplianceBadge({ status, showLabel = true, size = 'md' }) {
  const getStatusConfig = () => {
    switch (status?.toLowerCase()) {
      case 'compliant':
        return { label: 'Compliant', color: 'success', icon: '✅' };
      case 'non-compliant':
        return { label: 'Non-Compliant', color: 'danger', icon: '❌' };
      case 'partial':
        return { label: 'Partial', color: 'warning', icon: '⚠️' };
      case 'pending-review':
        return { label: 'Pending Review', color: 'info', icon: '⏳' };
      case 'expired':
        return { label: 'Expired', color: 'danger', icon: '⏰' };
      case 'exempt':
        return { label: 'Exempt', color: 'secondary', icon: '✓' };
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
    <span className={`compliance-badge ${config.color}`}>
      <span className="compliance-icon">{config.icon}</span>
      {showLabel && <span className="compliance-label">{config.label}</span>}
      
      <style jsx>{`
        .compliance-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: ${sizeClass.padding};
          border-radius: 9999px;
          font-size: ${sizeClass.fontSize};
          font-weight: 500;
          white-space: nowrap;
        }
        
        .compliance-icon {
          font-size: ${sizeClass.iconSize};
        }
        
        .compliance-label {
          line-height: 1;
        }
        
        .compliance-badge.success {
          background: #d1fae5;
          color: #065f46;
        }
        
        .compliance-badge.warning {
          background: #fed7aa;
          color: #92400e;
        }
        
        .compliance-badge.danger {
          background: #fee2e2;
          color: #991b1b;
        }
        
        .compliance-badge.info {
          background: #dbeafe;
          color: #1e40af;
        }
        
        .compliance-badge.secondary {
          background: #f3f4f6;
          color: #374151;
        }
      `}</style>
    </span>
  );
}