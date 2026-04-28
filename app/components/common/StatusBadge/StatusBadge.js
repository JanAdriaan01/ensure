'use client';

export default function StatusBadge({ 
  status, 
  size = 'sm', 
  showLabel = true,
  className = '',
  onClick 
}) {
  const statusConfig = {
    // Job statuses
    not_started: { label: 'Not Started', color: '#6b7280', bg: '#f3f4f6', icon: '⏳' },
    in_progress: { label: 'In Progress', color: '#1e40af', bg: '#dbeafe', icon: '🔄' },
    in_progress_paused: { label: 'Paused', color: '#92400e', bg: '#fef3c7', icon: '⏸️' },
    completed: { label: 'Completed', color: '#065f46', bg: '#d1fae5', icon: '✅' },
    
    // Quote statuses
    pending: { label: 'Pending', color: '#92400e', bg: '#fef3c7', icon: '⏳' },
    approved: { label: 'Approved', color: '#065f46', bg: '#d1fae5', icon: '✓' },
    rejected: { label: 'Rejected', color: '#991b1b', bg: '#fee2e2', icon: '✗' },
    po_received: { label: 'PO Received', color: '#1e40af', bg: '#dbeafe', icon: '📄' },
    
    // Invoice statuses
    draft: { label: 'Draft', color: '#6b7280', bg: '#f3f4f6', icon: '📝' },
    sent: { label: 'Sent', color: '#1e40af', bg: '#dbeafe', icon: '📧' },
    paid: { label: 'Paid', color: '#065f46', bg: '#d1fae5', icon: '💰' },
    overdue: { label: 'Overdue', color: '#991b1b', bg: '#fee2e2', icon: '⚠️' },
    
    // Tool statuses
    available: { label: 'Available', color: '#065f46', bg: '#d1fae5', icon: '🔧' },
    checked_out: { label: 'Checked Out', color: '#92400e', bg: '#fef3c7', icon: '🔨' },
    maintenance: { label: 'Maintenance', color: '#f59e0b', bg: '#fef3c7', icon: '🛠️' },
    broken: { label: 'Broken', color: '#991b1b', bg: '#fee2e2', icon: '💔' },
    
    // Stock statuses
    in_stock: { label: 'In Stock', color: '#065f46', bg: '#d1fae5', icon: '📦' },
    low_stock: { label: 'Low Stock', color: '#f59e0b', bg: '#fef3c7', icon: '⚠️' },
    out_of_stock: { label: 'Out of Stock', color: '#991b1b', bg: '#fee2e2', icon: '❌' },
    
    // Schedule statuses
    scheduled: { label: 'Scheduled', color: '#1e40af', bg: '#dbeafe', icon: '📅' },
    in_progress_schedule: { label: 'In Progress', color: '#f59e0b', bg: '#fef3c7', icon: '🔄' },
    completed_schedule: { label: 'Completed', color: '#065f46', bg: '#d1fae5', icon: '✅' },
    cancelled: { label: 'Cancelled', color: '#991b1b', bg: '#fee2e2', icon: '✗' },
    
    // OHS statuses
    reported: { label: 'Reported', color: '#92400e', bg: '#fef3c7', icon: '📢' },
    investigating: { label: 'Investigating', color: '#1e40af', bg: '#dbeafe', icon: '🔍' },
    resolved: { label: 'Resolved', color: '#065f46', bg: '#d1fae5', icon: '✅' },
    closed: { label: 'Closed', color: '#6b7280', bg: '#f3f4f6', icon: '🔒' },
    
    // Payment statuses
    unpaid: { label: 'Unpaid', color: '#991b1b', bg: '#fee2e2', icon: '💰' },
    partial: { label: 'Partial', color: '#f59e0b', bg: '#fef3c7', icon: '💸' },
    paid_full: { label: 'Paid in Full', color: '#065f46', bg: '#d1fae5', icon: '✅' },
    
    // User statuses
    active: { label: 'Active', color: '#065f46', bg: '#d1fae5', icon: '🟢' },
    inactive: { label: 'Inactive', color: '#6b7280', bg: '#f3f4f6', icon: '⚫' },
    suspended: { label: 'Suspended', color: '#991b1b', bg: '#fee2e2', icon: '🔴' },
  };

  const config = statusConfig[status] || { 
    label: status?.replace(/_/g, ' ') || 'Unknown', 
    color: '#6b7280', 
    bg: '#f3f4f6',
    icon: '📌'
  };
  
  const sizeStyles = {
    sm: { padding: '0.125rem 0.5rem', fontSize: '0.625rem', gap: '0.25rem' },
    md: { padding: '0.25rem 0.75rem', fontSize: '0.7rem', gap: '0.375rem' },
    lg: { padding: '0.375rem 1rem', fontSize: '0.75rem', gap: '0.5rem' },
  };

  const style = sizeStyles[size] || sizeStyles.sm;

  if (!showLabel) {
    return (
      <span 
        className={`status-dot ${className}`}
        style={{ backgroundColor: config.color }}
        title={config.label}
        onClick={onClick}
      />
    );
  }

  return (
    <span 
      className={`status-badge ${className}`}
      style={{
        background: config.bg,
        color: config.color,
        padding: style.padding,
        fontSize: style.fontSize,
        gap: style.gap,
      }}
      onClick={onClick}
    >
      {config.icon && <span className="status-icon">{config.icon}</span>}
      <span className="status-text">{config.label}</span>
      <style jsx>{`
        .status-badge {
          display: inline-flex;
          align-items: center;
          border-radius: 9999px;
          font-weight: 500;
          line-height: 1;
          white-space: nowrap;
          transition: all 0.2s;
        }
        .status-badge.clickable {
          cursor: pointer;
        }
        .status-badge.clickable:hover {
          transform: translateY(-1px);
          filter: brightness(0.95);
        }
        .status-icon {
          font-size: 0.75em;
        }
        .status-text {
          display: inline-block;
        }
        .status-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          transition: transform 0.2s;
        }
        .status-dot.clickable {
          cursor: pointer;
        }
        .status-dot.clickable:hover {
          transform: scale(1.2);
        }
      `}</style>
    </span>
  );
}