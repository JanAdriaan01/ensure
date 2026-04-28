// components/hr/CertificationBadge/CertificationBadge.js
'use client';

export default function CertificationBadge({ 
  certification, 
  showDetails = false,
  size = 'md',
  onClick 
}) {
  const getStatusConfig = () => {
    const today = new Date();
    const expiryDate = certification.expiryDate ? new Date(certification.expiryDate) : null;
    
    if (!expiryDate) {
      return { label: 'Valid', color: 'success', icon: '✅' };
    }
    
    const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
      return { label: 'Expired', color: 'danger', icon: '❌' };
    } else if (daysUntilExpiry < 30) {
      return { label: 'Expiring Soon', color: 'warning', icon: '⚠️' };
    } else if (daysUntilExpiry < 90) {
      return { label: 'Valid', color: 'info', icon: '🟡' };
    } else {
      return { label: 'Valid', color: 'success', icon: '✅' };
    }
  };
  
  const status = getStatusConfig();
  
  const formatDate = (date) => {
    if (!date) return 'No expiry';
    return new Date(date).toLocaleDateString();
  };
  
  const sizeClasses = {
    sm: { padding: '0.125rem 0.5rem', fontSize: '0.75rem', iconSize: '0.75rem' },
    md: { padding: '0.25rem 0.75rem', fontSize: '0.875rem', iconSize: '0.875rem' },
    lg: { padding: '0.375rem 1rem', fontSize: '1rem', iconSize: '1rem' }
  };
  
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  
  return (
    <div 
      className={`certification-badge ${status.color} ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
    >
      <div className="badge-header">
        <span className="badge-icon">{status.icon}</span>
        <span className="badge-title">{certification.name}</span>
        {certification.issuer && (
          <span className="badge-issuer">• {certification.issuer}</span>
        )}
      </div>
      
      {showDetails && (
        <div className="badge-details">
          {certification.dateObtained && (
            <div className="detail-item">
              <span className="detail-label">Obtained:</span>
              <span>{formatDate(certification.dateObtained)}</span>
            </div>
          )}
          {certification.expiryDate && (
            <div className="detail-item">
              <span className="detail-label">Expires:</span>
              <span className={status.color === 'warning' ? 'expiring' : ''}>
                {formatDate(certification.expiryDate)}
              </span>
            </div>
          )}
          {certification.credentialId && (
            <div className="detail-item">
              <span className="detail-label">ID:</span>
              <span className="credential-id">{certification.credentialId}</span>
            </div>
          )}
        </div>
      )}
      
      <div className="badge-footer">
        <span className={`status-badge ${status.color}`}>
          {status.label}
        </span>
      </div>
      
      <style jsx>{`
        .certification-badge {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          padding: 1rem;
          transition: all 0.2s;
        }
        
        .certification-badge.clickable {
          cursor: pointer;
        }
        
        .certification-badge.clickable:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        .certification-badge.success { border-left: 3px solid #10b981; }
        .certification-badge.warning { border-left: 3px solid #f59e0b; }
        .certification-badge.danger { border-left: 3px solid #ef4444; }
        .certification-badge.info { border-left: 3px solid #3b82f6; }
        
        .badge-header {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }
        
        .badge-icon {
          font-size: ${sizeClass.iconSize};
        }
        
        .badge-title {
          font-weight: 600;
          font-size: ${sizeClass.fontSize};
          color: #111827;
        }
        
        .badge-issuer {
          font-size: 0.75rem;
          color: #6b7280;
        }
        
        .badge-details {
          margin-bottom: 0.75rem;
          padding: 0.5rem;
          background: #f9fafb;
          border-radius: 0.375rem;
        }
        
        .detail-item {
          display: flex;
          gap: 0.5rem;
          font-size: 0.75rem;
          margin-bottom: 0.25rem;
        }
        
        .detail-item:last-child {
          margin-bottom: 0;
        }
        
        .detail-label {
          color: #6b7280;
          min-width: 55px;
        }
        
        .expiring {
          color: #f59e0b;
          font-weight: 500;
        }
        
        .credential-id {
          font-family: monospace;
          color: #6b7280;
        }
        
        .badge-footer {
          display: flex;
          justify-content: flex-end;
        }
        
        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
          font-size: 0.7rem;
          font-weight: 500;
        }
        
        .status-badge.success { background: #d1fae5; color: #065f46; }
        .status-badge.warning { background: #fed7aa; color: #92400e; }
        .status-badge.danger { background: #fee2e2; color: #991b1b; }
        .status-badge.info { background: #dbeafe; color: #1e40af; }
      `}</style>
    </div>
  );
}